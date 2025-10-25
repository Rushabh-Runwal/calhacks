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
from services.fish_audio import FishAudioService
from services.janitor_ai import JanitorAIClient

app = FastAPI(title="Talking Tom Chat API", version="1.0.0")
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
socket_app = socketio.ASGIApp(sio, app)

fish_audio = FishAudioService()
janitor_ai = JanitorAIClient()
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
            await sio.emit("message", user_message.dict(), room=room_id)
            
            await generate_streaming_ai_response(room_id, content)
        
    except Exception as e:
        print(f"Error in sendMessage: {e}")

@sio.event
async def sendVoiceMessage(sid, data):
    try:
        room_id = data.get("roomId")
        username = data.get("username")
        audio_base64 = data.get("audio")
        
        if not room_id or not username or not audio_base64:
            await sio.emit("error", {"message": "Missing required data"}, room=sid)
            return
        
        if room_id not in rooms:
            await sio.emit("error", {"message": "Room not found"}, room=sid)
            return
        
        try:
            audio_bytes = base64.b64decode(audio_base64)
        except Exception as e:
            await sio.emit("error", {"message": "Invalid audio data"}, room=sid)
            return
        
        transcribed_text = await fish_audio.transcribe_audio(audio_bytes)
        
        if not transcribed_text:
            await sio.emit("error", {"message": "Could not transcribe audio"}, room=sid)
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
        await sio.emit("message", user_message.dict(), room=room_id)
        
        await generate_streaming_ai_response(room_id, transcribed_text)
        
    except Exception as e:
        print(f"Error in sendVoiceMessage: {e}")
        await sio.emit("error", {"message": "Failed to process voice message"}, room=sid)

async def generate_streaming_ai_response(room_id: str, last_user_message: str):
    """Generate AI response with streaming text and audio"""
    try:
        if room_id not in rooms:
            return
        
        room = rooms[room_id]
        context = janitor_ai.build_conversation_context(room.messages)
        message_id = generate_message_id()
        collected_text = []
        
        async def text_generator():
            """Generator that streams AI text and emits chunks to frontend"""
            async for chunk in janitor_ai.stream_ai_response(context):
                collected_text.append(chunk)
                await sio.emit("aiTextChunk", {
                    "messageId": message_id,
                    "chunk": chunk
                }, room=room_id)
                yield chunk
        
        audio_path = await fish_audio.generate_streaming_audio(
            text_generator(),
            message_id
        )
        
        full_text = "".join(collected_text)
        ai_message = Message(
            id=message_id,
            content=full_text,
            username="Talking Tom",
            timestamp=int(datetime.now().timestamp() * 1000),
            is_ai=True,
            audio_url=fish_audio.get_audio_url(message_id) if audio_path else None
        )
        
        room.messages.append(ai_message)
        await sio.emit("aiComplete", ai_message.dict(), room=room_id)
        
    except Exception as e:
        print(f"Error generating streaming AI response: {e}")

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
        fish_audio.cleanup_old_audio()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)