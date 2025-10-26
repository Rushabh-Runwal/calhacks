# Frontend - Multiplayer AI Chat

Next.js frontend for real-time multiplayer chat with AI character (Talking Tom).

## Features

- Real-time chat using Socket.IO
- Voice input with VAD (Voice Activity Detection)
- Audio playback for AI responses
- Room-based chat system
- Responsive UI with Tailwind CSS

## Prerequisites

- Node.js 18+ or higher
- npm or yarn

## Setup

1. **Install dependencies:**

```bash
npm install
# or
yarn install
```

2. **Environment Variables:**

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update this to your backend URL.

## Running the Development Server

```bash
npm run dev
# or
yarn dev
```

The frontend will start on `http://localhost:3000`

## Building for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   └── room/
│   │       └── [roomId]/
│   │           └── page.tsx  # Chat room page
│   ├── components/
│   │   ├── ChatInput.tsx     # Text input component
│   │   ├── ChatMessage.tsx   # Message display component
│   │   └── ContinuousRecorder.tsx  # Voice recording component
│   └── types/
│       └── chat.ts           # TypeScript type definitions
├── public/
│   ├── Hero/                 # Hero images
│   └── vad/                  # Voice Activity Detection models
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── postcss.config.mjs
```

## Key Components

### ChatMessage
Displays individual messages with support for text and audio playback.

### ChatInput
Text input field for sending messages.

### ContinuousRecorder
Voice recording component with VAD for automatic speech detection.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy!

### Docker

See `Dockerfile` for containerization.

### Static Export (Optional)

For static hosting:

```bash
npm run build
```

Note: Socket.IO requires a server, so static export may have limitations.

## Configuration

### Socket.IO Connection

The Socket.IO client is configured in `src/app/room/[roomId]/page.tsx`:

```typescript
const newSocket = io(
  process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL || '' 
    : 'http://localhost:8000'
);
```

Update this based on your deployment environment.

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000 in development)

## Development

The project uses:
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **@ricky0123/vad-web** - Voice Activity Detection

## Troubleshooting

### Socket.IO Connection Issues

Make sure:
1. Backend server is running on the correct port
2. CORS is properly configured in the backend
3. Environment variables are set correctly

### Audio Issues

Ensure:
1. Browser has microphone permissions
2. Using HTTPS in production (required for microphone access)
3. VAD models are properly loaded from `/public/vad/`
