# Multiplayer AI Chat# 🐱 Talking Tom Chat



A real-time multiplayer chat application with an AI character (Talking Tom) that can respond via text and voice.Multiplayer AI chat with Talking Tom featuring voice chat capabilities.



## Architecture## Features



This project is split into two main parts:- Real-time multiplayer chat with WebSockets

- Talking Tom AI character with Fish Audio TTS

- **Backend**: Python FastAPI + Socket.IO server (`/backend`)- Voice message recording and transcription

- **Frontend**: Next.js React application (`/frontend`)- Smart response logic (Tom responds when addressed)

- Room-based chat with shareable codes

## Features

## Tech Stack

- 🎙️ **Voice Input**: Speak to the AI using voice activity detection

- 🔊 **Voice Responses**: AI responds with synthesized speech- **Backend**: FastAPI + python-socketio

- 💬 **Real-time Chat**: Socket.IO-based instant messaging- **Frontend**: Next.js + React + TypeScript + Tailwind CSS

- 👥 **Multiplayer Rooms**: Multiple users can chat together- **AI**: JanitorAI API

- 🤖 **AI Character**: Talking Tom with personality and context awareness- **Audio**: Fish Audio SDK (TTS + ASR)

- 📱 **Responsive UI**: Works on desktop and mobile devices

## Quick Start

## Quick Start

1. **Install dependencies:**

### Prerequisites```bash

uv sync

- Python 3.10+npm install

- Node.js 18+```

- FFmpeg (for audio processing)

2. **Start backend:**

### Option 1: Docker Compose (Recommended)```bash

uv run python start_server.py

```bash```

# Copy environment files

cp backend/.env.example backend/.env3. **Start frontend:**

cp frontend/.env.example frontend/.env.local```bash

npm run dev

# Edit the .env files with your API keys```



# Start both services4. **Open:** http://localhost:3000

docker-compose up --build

```## Usage



- Frontend: http://localhost:30001. Enter username and create/join room

- Backend: http://localhost:80002. Chat with text or voice messages

3. Tom responds when you address him directly

### Option 2: Manual Setup4. Voice messages are transcribed and Tom responds with audio



#### Backend Setup## Project Structure



```bash```

cd backend├── main.py                 # FastAPI server

├── services/               # AI and audio services

# Create virtual environment (optional)├── models/                 # Pydantic models

python -m venv .venv├── config/                 # AI prompts

source .venv/bin/activate  # On Windows: .venv\Scripts\activate├── src/                    # Next.js frontend

└── audio_cache/           # Generated audio files

# Install dependencies```

pip install -r requirements.txt

## API

# Copy and configure environment

cp .env.example .env- WebSocket: `ws://localhost:8000/socket.io/`

# Edit .env with your API keys- Events: `joinRoom`, `sendMessage`, `sendVoiceMessage`

- HTTP: `/rooms`, `/audio/{filename}`
# Start the server
python start_server.py
```

Backend will run on http://localhost:8000

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local if needed

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## Environment Variables

### Backend (`backend/.env`)

```env
HOST=0.0.0.0
PORT=8000
FISH_API_KEY=your_fish_audio_api_key
JANITOR_API_KEY=your_janitor_ai_api_key
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
.
├── backend/                 # Python FastAPI backend
│   ├── config/             # Configuration files
│   ├── models/             # Data models
│   ├── services/           # External service integrations
│   ├── audio_cache/        # Cached audio files
│   ├── main.py             # Main application
│   ├── start_server.py     # Server startup script
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend Docker configuration
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Frontend Docker configuration
│
├── docker-compose.yml     # Docker Compose configuration
└── README.md             # This file
```

## Development

### Backend Development

```bash
cd backend
python start_server.py
```

The server will auto-reload on code changes.

### Frontend Development

```bash
cd frontend
npm run dev
```

The frontend will auto-reload on code changes.

## Deployment

### Backend Deployment

#### Railway / Render / Heroku

1. Create a new service
2. Connect your repository
3. Set the root directory to `backend`
4. Set environment variables
5. Deploy!

#### Docker

```bash
cd backend
docker build -t chat-backend .
docker run -p 8000:8000 --env-file .env chat-backend
```

### Frontend Deployment

#### Vercel (Recommended)

1. Import your repository on Vercel
2. Set root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your backend URL
4. Deploy!

#### Netlify / CloudFlare Pages

Similar to Vercel - set the root directory and environment variables.

#### Docker

```bash
cd frontend
docker build -t chat-frontend --build-arg NEXT_PUBLIC_API_URL=https://your-backend-url.com .
docker run -p 3000:3000 chat-frontend
```

## API Documentation

### REST Endpoints

- `GET /` - Health check
- `GET /rooms` - List active rooms
- `POST /rooms/create` - Create new room
- `GET /audio/{filename}` - Get audio file

### Socket.IO Events

See [backend/README.md](backend/README.md) for detailed Socket.IO documentation.

## Technology Stack

### Backend
- FastAPI - Modern Python web framework
- Socket.IO - Real-time bidirectional communication
- Fish Audio SDK - Text-to-speech and transcription
- Janitor AI - AI character responses
- FFmpeg - Audio processing

### Frontend
- Next.js 16 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Socket.IO Client - Real-time communication
- @ricky0123/vad-web - Voice Activity Detection

## Troubleshooting

### Socket.IO Connection Issues

- Ensure backend is running and accessible
- Check CORS settings in backend
- Verify `NEXT_PUBLIC_API_URL` in frontend

### Audio Issues

- Install FFmpeg on your system
- Check microphone permissions in browser
- Ensure HTTPS in production (required for microphone access)

### API Key Issues

- Verify your Fish Audio API key is valid
- Verify your Janitor AI API key is valid
- Check API rate limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
