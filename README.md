# 🐱 Talking Tom Chat

Multiplayer AI chat with Talking Tom featuring voice chat capabilities.

## Features

- Real-time multiplayer chat with WebSockets
- Talking Tom AI character with Fish Audio TTS
- Voice message recording and transcription
- Smart response logic (Tom responds when addressed)
- Room-based chat with shareable codes

## Tech Stack

- **Backend**: FastAPI + python-socketio
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **AI**: JanitorAI API
- **Audio**: Fish Audio SDK (TTS + ASR)

## Quick Start

1. **Install dependencies:**
```bash
uv sync
npm install
```

2. **Start backend:**
```bash
uv run python start_server.py
```

3. **Start frontend:**
```bash
npm run dev
```

4. **Open:** http://localhost:3000

## Usage

1. Enter username and create/join room
2. Chat with text or voice messages
3. Tom responds when you address him directly
4. Voice messages are transcribed and Tom responds with audio

## Project Structure

```
├── main.py                 # FastAPI server
├── services/               # AI and audio services
├── models/                 # Pydantic models
├── config/                 # AI prompts
├── src/                    # Next.js frontend
└── audio_cache/           # Generated audio files
```

## API

- WebSocket: `ws://localhost:8000/socket.io/`
- Events: `joinRoom`, `sendMessage`, `sendVoiceMessage`
- HTTP: `/rooms`, `/audio/{filename}`