import os
import secrets
import asyncio
from datetime import datetime
from typing import Dict, List
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import socketio
from models.chat import Message, User, Room, JoinRoomRequest, SendMessageRequest
from services.janitor_ai import JanitorAIClient
from services.fish_audio import FishAudioService

# Initialize FastAPI app
app = FastAPI(title="Talking Tom Chat API", version="1.0.0")

# Initialize SocketIO
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
socket_app = socketio.ASGIApp(sio, app)

# Initialize services
janitor_ai = JanitorAIClient()
fish_audio = FishAudioService()

# In-memory storage
rooms: Dict[str, Room] = {}


def generate_room_id() -> str:
    """Generate a 6-character room ID."""
    return secrets.token_urlsafe(4).upper()[:6]


def generate_message_id() -> str:
    """Generate a unique message ID."""
    return secrets.token_urlsafe(12)


@sio.event
async def connect(sid, environ):
    """Handle client connection."""
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    print(f"Client disconnected: {sid}")
    
    # Remove user from all rooms
    for room_id, room in rooms.items():
        room.users = [user for user in room.users if user.id != sid]
        if not room.users:
            # Clean up empty rooms
            del rooms[room_id]
        else:
            # Notify remaining users
            await sio.emit("userLeft", {"userId": sid}, room=room_id)


@sio.event
async def joinRoom(sid, data):
    """Handle user joining a room."""
    try:
        room_id = data.get("roomId")
        username = data.get("username")
        
        if not room_id or not username:
            await sio.emit("error", {"message": "Room ID and username are required"}, room=sid)
            return
        
        # Create room if it doesn't exist
        if room_id not in rooms:
            rooms[room_id] = Room(id=room_id)
        
        # Create user
        user = User(id=sid, username=username, room_id=room_id)
        
        # Add user to room
        rooms[room_id].users.append(user)
        
        # Join SocketIO room
        await sio.enter_room(sid, room_id)
        
        # Notify other users
        await sio.emit("userJoined", user.dict(), room=room_id, skip_sid=sid)
        
        # Send current room state
        await sio.emit("roomUsers", [user.dict() for user in rooms[room_id].users], room=sid)
        await sio.emit("roomMessages", [msg.dict() for msg in rooms[room_id].messages], room=sid)
        
        print(f"User {username} joined room {room_id}")
        
    except Exception as e:
        print(f"Error in joinRoom: {e}")
        await sio.emit("error", {"message": "Failed to join room"}, room=sid)


@sio.event
async def sendMessage(sid, data):
    """Handle sending a message."""
    try:
        content = data.get("content", "").strip()
        username = data.get("username")
        room_id = data.get("roomId")
        
        if not content or not username or not room_id:
            return
        
        # Create user message
        user_message = Message(
            id=generate_message_id(),
            content=content,
            username=username,
            timestamp=int(datetime.now().timestamp() * 1000),
            is_ai=False
        )
        
        # Add message to room
        if room_id in rooms:
            rooms[room_id].messages.append(user_message)
            
            # Broadcast user message
            await sio.emit("message", user_message.dict(), room=room_id)
            
            # Generate AI response
            await generate_ai_response(room_id, content)
        
    except Exception as e:
        print(f"Error in sendMessage: {e}")


async def generate_ai_response(room_id: str, last_user_message: str):
    """Generate AI response for a room."""
    try:
        if room_id not in rooms:
            return
        
        room = rooms[room_id]
        
        # Build conversation context
        context = janitor_ai.build_conversation_context(room.messages)
        
        # Get AI response
        ai_response = await janitor_ai.call_janitor_ai(context, last_user_message)
        
        # Only respond if AI decides to
        if not ai_response:
            return
        
        # Add delay to simulate thinking
        await asyncio.sleep(1 + (secrets.randbelow(1000) / 1000))
        
        # Create AI message
        ai_message = Message(
            id=generate_message_id(),
            content=ai_response,
            username="Talking Tom",
            timestamp=int(datetime.now().timestamp() * 1000),
            is_ai=True
        )
        
        # Add message to room
        room.messages.append(ai_message)
        
        # Generate audio for Tom's response
        audio_path = await fish_audio.generate_audio(ai_response, ai_message.id)
        if audio_path:
            ai_message.audio_url = fish_audio.get_audio_url(ai_message.id)
        
        # Broadcast AI message
        await sio.emit("message", ai_message.dict(), room=room_id)
        
    except Exception as e:
        print(f"Error generating AI response: {e}")


@sio.event
async def leaveRoom(sid, data):
    """Handle user leaving a room."""
    try:
        room_id = data.get("roomId")
        if room_id and room_id in rooms:
            # Remove user from room
            rooms[room_id].users = [user for user in rooms[room_id].users if user.id != sid]
            
            # Notify other users
            await sio.emit("userLeft", {"userId": sid}, room=room_id)
            
            # Clean up empty rooms
            if not rooms[room_id].users:
                del rooms[room_id]
        
        await sio.leave_room(sid, room_id)
        
    except Exception as e:
        print(f"Error in leaveRoom: {e}")


# HTTP endpoints
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Talking Tom Chat API", "status": "running"}


@app.get("/rooms")
async def get_rooms():
    """Get all active rooms."""
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
    """Create a new room."""
    room_id = generate_room_id()
    rooms[room_id] = Room(id=room_id)
    return {"room_id": room_id}


# Serve audio files
@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Serve audio files."""
    audio_path = f"audio_cache/{filename}"
    if os.path.exists(audio_path):
        return FileResponse(audio_path, media_type="audio/mpeg")
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")


# Cleanup old audio files periodically
async def cleanup_audio():
    """Periodic cleanup of old audio files."""
    while True:
        await asyncio.sleep(3600)  # Run every hour
        fish_audio.cleanup_old_audio()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)