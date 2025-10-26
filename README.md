# 🐱 Talking Tom Chat# Multiplayer AI Chat# 🐱 Talking Tom Chat



Real-time multiplayer chat with AI character (Talking Tom) featuring voice input and responses.



## FeaturesA real-time multiplayer chat application with an AI character (Talking Tom) that can respond via text and voice.Multiplayer AI chat with Talking Tom featuring voice chat capabilities.



- 💬 Real-time multiplayer chat

- 🎙️ Voice input with automatic speech detection

- 🔊 AI voice responses## Architecture## Features

- 🤖 Smart AI that responds contextually

- 👥 Room-based conversations



## Tech StackThis project is split into two main parts:- Real-time multiplayer chat with WebSockets



**Backend:** Python, FastAPI, Socket.IO  - Talking Tom AI character with Fish Audio TTS

**Frontend:** Next.js, React, TypeScript, Tailwind CSS  

**AI:** Janitor AI, Fish Audio SDK- **Backend**: Python FastAPI + Socket.IO server (`/backend`)- Voice message recording and transcription



## Quick Start- **Frontend**: Next.js React application (`/frontend`)- Smart response logic (Tom responds when addressed)



### Prerequisites- Room-based chat with shareable codes

- Python 3.10+

- Node.js 18+## Features

- FFmpeg

## Tech Stack

### Running Locally

- 🎙️ **Voice Input**: Speak to the AI using voice activity detection

1. **Clone and setup environment:**

```bash- 🔊 **Voice Responses**: AI responds with synthesized speech- **Backend**: FastAPI + python-socketio

git clone https://github.com/Rushabh-Runwal/calhacks.git

cd calhacks- 💬 **Real-time Chat**: Socket.IO-based instant messaging- **Frontend**: Next.js + React + TypeScript + Tailwind CSS



# Setup backend- 👥 **Multiplayer Rooms**: Multiple users can chat together- **AI**: JanitorAI API

cp backend/.env.example backend/.env

# Edit backend/.env with your API keys- 🤖 **AI Character**: Talking Tom with personality and context awareness- **Audio**: Fish Audio SDK (TTS + ASR)



# Setup frontend- 📱 **Responsive UI**: Works on desktop and mobile devices

cp frontend/.env.example frontend/.env.local

```## Quick Start



2. **Start Backend (Terminal 1):**## Quick Start

```bash

./start-backend.sh1. **Install dependencies:**

```

Backend runs on http://localhost:8000### Prerequisites```bash



3. **Start Frontend (Terminal 2):**uv sync

```bash

./start-frontend.sh- Python 3.10+npm install

```

Frontend runs on http://localhost:3000- Node.js 18+```



### Using Docker- FFmpeg (for audio processing)



```bash2. **Start backend:**

docker-compose up --build

```### Option 1: Docker Compose (Recommended)```bash



## Project Structureuv run python start_server.py



``````bash```

├── backend/          # Python FastAPI + Socket.IO

├── frontend/         # Next.js React app# Copy environment files

└── docker-compose.yml

```cp backend/.env.example backend/.env3. **Start frontend:**



## Environment Variablescp frontend/.env.example frontend/.env.local```bash



**Backend (.env):**npm run dev

```env

FISH_API_KEY=your_key# Edit the .env files with your API keys```

JANITOR_API_KEY=your_key

```



**Frontend (.env.local):**# Start both services4. **Open:** http://localhost:3000

```env

NEXT_PUBLIC_API_URL=http://localhost:8000docker-compose up --build

```

```## Usage

## Deployment



- **Backend:** Deploy to Railway, Render, or any Python hosting

- **Frontend:** Deploy to Vercel (recommended), Netlify, or CloudFlare Pages- Frontend: http://localhost:30001. Enter username and create/join room



Set root directory to `backend` or `frontend` respectively.- Backend: http://localhost:80002. Chat with text or voice messages



## License3. Tom responds when you address him directly



MIT### Option 2: Manual Setup4. Voice messages are transcribed and Tom responds with audio




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
