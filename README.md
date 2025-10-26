# 🐱 Talking Tom Chat

A real-time, room-based group chat where you and friends can talk to an AI “Talking Tom” via text or voice. Messages are delivered instantly over Socket.IO. Voice notes are auto-transcribed and Tom replies with natural text-to-speech audio. Tom follows prompt-guided behavior: he speaks when addressed or helpful, avoids interrupting active threads, nudges the room if it’s quiet, and applies simple moderation.

- Low-latency, multiplayer rooms
- Text + voice messaging (VAD recording, ASR transcription, TTS replies)
- Context-aware AI persona with speaking rules and cooldowns
- Works on desktop and mobile

## Features

- 💬 Real-time multiplayer chat (Socket.IO)
- 🎙️ Voice input with automatic speech detection
- 🔊 AI voice responses (Fish Audio TTS) + transcription (ASR)
- 🤖 JanitorAI-powered character with context-aware logic
- 👥 Room-based conversations with shareable codes
- 🛡️ Simple moderation prompts and anti-interruption behavior
- 📦 Audio caching and HTTP streaming for generated speech

## Tech Stack

- Backend: Python 3.10+, FastAPI, python-socketio, Uvicorn
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- AI: JanitorAI
- Audio: Fish Audio SDK (TTS + ASR), FFmpeg

## Prerequisites

- Python 3.10+
- Node.js 18+
- FFmpeg installed and on PATH
- Docker (optional, for Compose)

## Quick Start

### Option 1: Docker Compose (recommended)

```powershell
# In repo root
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
# Edit both env files with your API keys and settings

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- WebSocket: ws://localhost:8000/socket.io/

### Option 2: Manual setup

Backend (Windows PowerShell):
```powershell
cd backend
Copy-Item .env.example .env  # edit with your API keys

python -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

python start_server.py
```

Frontend:
```powershell
cd frontend
Copy-Item .\.env.example .\.env.local  # edit if needed
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- WebSocket: ws://localhost:8000/socket.io/

## Usage

1) Enter a username, then create or join a room via code.  
2) Send text or hold-to-record a voice message.  
3) Tom replies in text and usually with synthesized voice.  
4) Say his name to engage directly; he avoids interrupting active 1:1 threads.  

## API Overview

HTTP
- GET `/` → Health/info
- GET `/rooms` → List rooms
- POST `/rooms/create` → Create a room
- GET `/audio/{filename}` → Stream cached TTS audio

Socket.IO (ws://localhost:8000/socket.io/)
- Client → Server:
  - `joinRoom` { roomId, username }
  - `sendMessage` { roomId, username, content }
  - `sendVoiceMessage` { roomId, username, audio: base64 }
- Server → Client:
  - `userJoined`, `userLeft`, `roomUsers`
  - `roomMessages`, `newMessage`
  - `error`

## Tom’s Behavior (prompt-guided)

- Responds when addressed or when helpful to the group
- Avoids interrupting ongoing 1:1 exchanges
- Optional “silence nudge” after quiet periods
- Brief, friendly voice style; minimal fillers; no cat sounds in moderation
- Simple moderation: immediate warning on harassment; repeat → removal

Tune timings, cooldowns, and wording in the prompt/config (e.g., `config/ai_prompt.py`)

## Environment Variables

Backend (`backend/.env`)
```env
HOST=0.0.0.0
PORT=8000
FISH_API_KEY=your_fish_audio_api_key
JANITOR_API_KEY=your_janitor_ai_api_key
```

Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
.
├── backend/                 # FastAPI + Socket.IO server
│   ├── config/              # AI prompt and settings
│   ├── models/              # Pydantic models
│   ├── services/            # JanitorAI + Fish Audio integrations
│   ├── audio_cache/         # Generated audio files
│   ├── main.py              # App entry
│   ├── start_server.py      # Uvicorn launcher
│   └── requirements.txt
│
├── frontend/                # Next.js app
│   ├── src/                 # app/, components/, types/
│   ├── public/
│   └── package.json
│
└── docker-compose.yml
```

## Troubleshooting

- Missing API keys: set `FISH_API_KEY` and `JANITOR_API_KEY` in `backend/.env`.
- FFmpeg not found: install and add to PATH, then restart terminal.
- CORS/Socket errors: confirm `NEXT_PUBLIC_API_URL` points to your backend URL.
- No audio playback: ensure `audio_cache/` is writable and files are being created.

## License

MIT
