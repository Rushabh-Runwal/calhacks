# Backend - Multiplayer AI Chat

Python FastAPI backend with Socket.IO for real-time chat with AI character (Talking Tom).

## Features

- Real-time communication using Socket.IO
- AI responses using Janitor AI
- Text-to-speech using Fish Audio SDK
- Voice transcription support
- Room-based chat system

## Prerequisites

- Python 3.10 or higher
- FFmpeg (for audio processing)

## Setup

1. **Install dependencies:**

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -r requirements.txt
```

2. **Environment Variables:**

Create a `.env` file in the backend directory:

```env
HOST=0.0.0.0
PORT=8000
FISH_API_KEY=your_fish_audio_api_key
JANITOR_API_KEY=your_janitor_ai_api_key
```

3. **Create audio cache directory:**

```bash
mkdir -p audio_cache
```

## Running the Server

```bash
python start_server.py
```

The server will start on `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /rooms` - List all active rooms
- `POST /rooms/create` - Create a new room
- `GET /audio/{filename}` - Serve audio files
- `WS /socket.io` - Socket.IO connection endpoint

## Socket.IO Events

### Client → Server

- `joinRoom` - Join a chat room
- `sendMessage` - Send a text message
- `sendVoiceMessage` - Send a voice message
- `leaveRoom` - Leave a room

### Server → Client

- `connect` - Connection established
- `disconnect` - Connection closed
- `newMessage` - New message received
- `userJoined` - User joined the room
- `userLeft` - User left the room
- `roomUsers` - List of users in room
- `roomMessages` - Room message history
- `error` - Error message

## Project Structure

```
backend/
├── config/
│   └── ai_prompt.py       # AI character prompt configuration
├── models/
│   └── chat.py            # Data models (Message, User, Room)
├── services/
│   ├── fish_audio.py      # Fish Audio SDK integration
│   └── janitor_ai.py      # Janitor AI integration
├── audio_cache/           # Cached audio files
├── main.py                # FastAPI + Socket.IO application
├── start_server.py        # Server startup script
├── pyproject.toml         # Python project configuration
└── requirements.txt       # Python dependencies
```

## Deployment

### Docker (Recommended)

See `Dockerfile` for containerization.

### Manual Deployment

1. Install dependencies
2. Set environment variables
3. Run with production ASGI server:

```bash
uvicorn main:socket_app --host 0.0.0.0 --port 8000 --workers 1
```

**Note:** Socket.IO requires sticky sessions, so use only 1 worker or configure a Redis adapter for multiple workers.

## Development

Run with auto-reload:

```bash
python start_server.py
```

The server will automatically reload when you make changes to the code.
