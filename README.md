# 🐱 Talking Tom Chat - Python Edition

A multiplayer AI chat experience featuring Talking Tom with Fish Audio integration, built with Python FastAPI backend and Next.js React frontend.

## Features

- **Real-time Multiplayer Chat**: Multiple users can join the same chat room
- **Talking Tom AI**: AI character that responds with Tom's playful personality
- **Fish Audio Integration**: Text-to-speech with emotional voice generation
- **Smart Response Logic**: Tom only responds when directly addressed
- **Room Management**: Create and join rooms with 6-character codes
- **Audio Playback**: Automatic audio generation for Tom's responses

## Tech Stack

- **Backend**: FastAPI + python-socketio for WebSockets
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **AI**: JanitorAI API with custom Talking Tom prompt
- **Audio**: Fish Audio SDK for TTS generation
- **Package Manager**: uv for Python, npm for Node.js

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- uv package manager
- npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd multiplayer-ai-chat-python
```

2. Install Python dependencies:
```bash
uv sync
```

3. Install Node.js dependencies:
```bash
npm install
```

### Running the Application

1. **Start the Python Backend** (Terminal 1):
```bash
uv run python start_server.py
```
Backend will be available at: http://localhost:8000

2. **Start the Next.js Frontend** (Terminal 2):
```bash
./start_frontend.sh
# or
npm run dev
```
Frontend will be available at: http://localhost:3000

### Usage

1. Open http://localhost:3000 in your browser
2. Enter your username
3. Create a new room or join an existing one with a 6-character code
4. Start chatting! Tom will respond when you address him directly

## API Endpoints

- `GET /` - Server status
- `GET /rooms` - List active rooms
- `POST /rooms/create` - Create new room
- `GET /audio/{filename}` - Serve audio files
- WebSocket: `ws://localhost:8000/socket.io/`

## WebSocket Events

- `joinRoom` - Join a chat room
- `sendMessage` - Send a message
- `leaveRoom` - Leave current room
- `message` - Receive new message
- `userJoined` - User joined room
- `userLeft` - User left room

## Project Structure

```
multiplayer-ai-chat-python/
├── main.py                 # FastAPI + SocketIO server
├── start_server.py         # Server startup script
├── start_frontend.sh       # Frontend startup script
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript config
├── config/
│   └── ai_prompt.py       # Talking Tom character prompt
├── services/
│   ├── janitor_ai.py      # JanitorAI API client
│   └── fish_audio.py      # Fish Audio TTS service
├── models/
│   └── chat.py            # Pydantic models
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── types/             # TypeScript types
├── audio_cache/           # Generated audio files
└── pyproject.toml         # Python dependencies
```

## Character Behavior

Talking Tom will only respond when:
- Someone directly mentions his name ("Tom", "Talking Tom")
- Someone asks him a question
- The message is addressed to everyone ("guys", "everyone", "hey all")

Tom maintains conversation context and references previous messages naturally.

## Audio Features

- Automatic TTS generation for Tom's responses
- Emotional voice tags (excited, curious, happy, etc.)
- Audio files cached in `audio_cache/` directory
- Automatic cleanup of old audio files

## Development

### Adding Dependencies

```bash
uv add package-name
```

### Running Tests

```bash
uv run pytest
```

### Code Formatting

```bash
uv run black .
uv run isort .
```

## Deployment

The application can be deployed to any platform that supports Python applications:

- **Render**: Easy deployment with automatic builds
- **Railway**: Simple Python app deployment
- **Heroku**: Traditional PaaS deployment
- **DigitalOcean**: VPS deployment

Make sure to:
1. Set environment variables for production
2. Configure proper CORS settings
3. Set up audio file storage (S3, etc.)
4. Configure proper logging

## License

MIT License - see LICENSE file for details.
