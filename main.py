import os
import secrets
import asyncio
import base64
from datetime import datetime
from typing import Dict, List
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import socketio
from models.chat import Message, User, Room
from services.fish_audio import FishAudioClient
from services.janitor_ai import JanitorAIClient
import uuid

app = FastAPI(title="Talking Tom Chat API", version="1.0.0")
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Serve static audio files
app.mount("/audio", StaticFiles(directory="audio_cache"), name="audio")

socket_app = socketio.ASGIApp(sio, app)

# Initialize clients
fish_audio_client = FishAudioClient()
janitor_ai_client = JanitorAIClient()
rooms: Dict[str, Room] = {}

def generate_room_id() -> str:
    return secrets.token_urlsafe(4).upper()[:6]

def generate_message_id() -> str:
    return secrets.token_hex(12)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    rooms_to_update = list(rooms.items())
    for room_id, room in rooms_to_update:
        room.users = [user for user in room.users if user.id != sid]
        if not room.users:
            del rooms[room_id]
        else:
            await sio.emit("userLeft", {"userId": sid}, room=room_id)

@sio.event
async def joinRoom(sid, data):
    try:
        room_id = data.get("roomId")
        username = data.get("username")
        
        if not room_id or not username:
            await sio.emit("error", {"message": "Room ID and username are required"}, room=sid)
            return
        
        if room_id not in rooms:
            rooms[room_id] = Room(id=room_id)
        
        user = User(id=sid, username=username, room_id=room_id)
        rooms[room_id].users.append(user)
        await sio.enter_room(sid, room_id)
        await sio.emit("userJoined", user.dict(), room=room_id, skip_sid=sid)
        await sio.emit("roomUsers", [user.dict() for user in rooms[room_id].users], room=sid)
        await sio.emit("roomMessages", [msg.dict() for msg in rooms[room_id].messages], room=sid)
        print(f"User {username} joined room {room_id}")
        
    except Exception as e:
        print(f"Error in joinRoom: {e}")
        await sio.emit("error", {"message": "Failed to join room"}, room=sid)

@sio.event
async def sendMessage(sid, data):
    try:
        content = data.get("content", "").strip()
        username = data.get("username")
        room_id = data.get("roomId")
        
        if not content or not username or not room_id:
            return
        
        user_message = Message(
            id=generate_message_id(),
            content=content,
            username=username,
            timestamp=int(datetime.now().timestamp() * 1000),
            is_ai=False
        )
        
        if room_id in rooms:
            rooms[room_id].messages.append(user_message)
            await sio.emit("newMessage", user_message.dict(), room=room_id)
            
            await generate_ai_response(room_id, username)
        
    except Exception as e:
        print(f"Error in sendMessage: {e}")

@sio.event
async def sendVoiceMessage(sid, data):
    try:
        room_id = data.get("roomId")
        username = data.get("username")
        audio_base64 = data.get("audio")
        
        if not room_id or not username or not audio_base64:
            await sio.emit("error", {"message": "Missing required data for voice message"}, room=sid)
            return
        
        if room_id not in rooms:
            await sio.emit("error", {"message": "Room not found"}, room=sid)
            return
        
        try:
            audio_bytes = base64.b64decode(audio_base64)
        except Exception as e:
            await sio.emit("error", {"message": "Invalid audio data format"}, room=sid)
            return
        
        transcribed_text = await fish_audio_client.transcribe_audio(audio_bytes)
        
        if not transcribed_text:
            await sio.emit("error", {"message": "Could not transcribe audio. Please try speaking more clearly."}, room=sid)
            return
        
        user_message = Message(
            id=generate_message_id(),
            content=transcribed_text,
            username=username,
            timestamp=int(datetime.now().timestamp() * 1000),
            is_ai=False,
            is_voice=True
        )
        
        rooms[room_id].messages.append(user_message)
        await sio.emit("newMessage", user_message.dict(), room=room_id)
        
        await generate_ai_response(room_id, username)
        
    except Exception as e:
        print(f"Error in sendVoiceMessage: {e}")
        await sio.emit("error", {"message": "Failed to process voice message. Please try again."}, room=sid)

def should_tom_respond(message_content: str, username: str) -> bool:
    """Check if Tom should respond based on the prompt's gating rules."""
    content_lower = message_content.lower()
    
    # Rule 1: Direct mention of "Tom"
    if "tom" in content_lower:
        return True
    
    # Rule 2: Addressed to everyone (covers greetings like "hey all")
    if any(phrase in content_lower for phrase in ["guys", "everyone", "all"]):
        return True
    
    # Rule 3: A question is asked
    if "?" in message_content:
        return True

    return False

async def generate_ai_response(room_id: str, username: str):
    """Generates a response from the AI and broadcasts it to the room."""
    print(f"[{room_id}] Generating AI response for {username}")
    
    room = rooms.get(room_id)
    if not room:
        return

    # 1. Build conversation context
    context = janitor_ai_client.build_conversation_context(room.messages)

    # 2. Get AI text response
    ai_text_response = await janitor_ai_client.get_ai_response(context)

    # 3. Handle silence
    if not ai_text_response or "[[NO_OUTPUT]]" in ai_text_response:
        print(f"[{room_id}] AI decided to stay silent.")
        return
        
    print(f"[{room_id}] AI Response (text): {ai_text_response}")

    # Generate a unique ID for the AI's message
    ai_message_id = generate_message_id()

    # 4. Generate audio for the AI response
    audio_file_path = await fish_audio_client.generate_audio(ai_text_response, ai_message_id)
    audio_duration = 0 # Fish Audio SDK does not provide duration, default to 0

    if not audio_file_path:
        print(f"[{room_id}] Failed to generate audio for AI response.")
        ai_message = Message(
            id=ai_message_id,
            content=ai_text_response,
            username="Tom",
            is_ai=True,
            is_voice=False,
            audio_url=None,
            audio_duration=0,
            timestamp=int(datetime.now().timestamp() * 1000)
        )
    else:
        # 5. Create the AI message with audio
        print(f"[{room_id}] AI Response (audio): {audio_file_path} (duration: {audio_duration}s)")
        ai_message = Message(
            id=ai_message_id,
            content=ai_text_response,
            username="Tom",
            is_ai=True,
            is_voice=True,
            audio_url=f"/audio/{os.path.basename(audio_file_path)}",
            audio_duration=audio_duration,
            timestamp=int(datetime.now().timestamp() * 1000)
        )

    # 6. Add AI message to the room and broadcast
    room.messages.append(ai_message)
    await sio.emit("newMessage", ai_message.dict(), room=room_id)

@sio.event
async def leaveRoom(sid, data):
    try:
        room_id = data.get("roomId")
        if room_id and room_id in rooms:
            rooms[room_id].users = [user for user in rooms[room_id].users if user.id != sid]
            await sio.emit("userLeft", {"userId": sid}, room=room_id)
            
            if not rooms[room_id].users:
                del rooms[room_id]
        
        await sio.leave_room(sid, room_id)
        
    except Exception as e:
        print(f"Error in leaveRoom: {e}")

@app.get("/")
async def root():
    return {"message": "Talking Tom Chat API", "status": "running"}

@app.get("/rooms")
async def get_rooms():
    return {
        "rooms": [
            {
                "id": room_id,
                "user_count": len(room.users),
                "message_count": len(room.messages)
            }
            for room_id, room in rooms.items()
        ]
    }

@app.post("/rooms/create")
async def create_room():
    room_id = generate_room_id()
    rooms[room_id] = Room(id=room_id)
    return {"room_id": room_id}

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    audio_path = f"audio_cache/{filename}"
    if os.path.exists(audio_path):
        return FileResponse(audio_path, media_type="audio/mpeg")
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")

async def cleanup_audio():
    while True:
        await asyncio.sleep(3600)
        fish_audio_client.cleanup_old_audio()

@app.on_event("shutdown")
async def shutdown_event():
    await fish_audio_client.close()
    await janitor_ai_client.close()
    print("Clients closed.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)