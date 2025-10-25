# Multiplayer AI Chat Room with Talking Tom

A real-time multiplayer chat application featuring Talking Tom, the famous friendly cat! Built for the CalHacks hackathon. Multiple users can join the same chat room and interact with Talking Tom who responds to every message with his playful, cat-like personality.

## Features

- 🐱 **Talking Tom Character**: Chat with Talking Tom, the playful cat who loves jokes, fish, and making friends!
- 👥 **Multiplayer**: Multiple users can join the same chat room
- 🔗 **Shareable Rooms**: Generate random room codes to share with friends
- ⚡ **Real-time**: WebSocket-based instant messaging
- 😸 **Fun Personality**: Tom uses cat sounds, emojis, and makes everyone laugh
- 🎨 **Modern UI**: Google Chat-inspired interface with Tailwind CSS
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.io
- **AI**: JanitorAI API (25k context length)
- **Real-time**: WebSocket communication

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd multiplayer-ai-chat
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Create a Room**: Enter your username and click "Create Room"
2. **Share Room Code**: Copy the generated room code and share with friends
3. **Join a Room**: Enter a room code and username to join an existing room
4. **Start Chatting**: Type messages and watch the AI respond to every message!

## AI Integration

The application uses the JanitorAI API with the following configuration:
- **Endpoint**: `https://janitorai.com/hackathon/completions`
- **Context Length**: 25,000 tokens
- **System Prompt**: Friendly AI assistant for group chat
- **Response Strategy**: Responds to every user message with 1-2 second delay

## Architecture

### Backend (server.js)
- Custom Node.js server with Socket.io
- Room management and user connections
- AI API integration with context management
- Message broadcasting and history

### Frontend (Next.js)
- Landing page with room creation/joining
- Chat room interface with real-time messaging
- Google Chat-style UI components
- Responsive design

### Key Components
- `ChatMessage`: Individual message display with user/AI styling
- `ChatInput`: Message input with send functionality
- `RoomPage`: Main chat room interface
- Socket.io client for real-time communication

## Deployment

For production deployment, you'll need a platform that supports Node.js with WebSockets:

- **Railway**: Recommended for full-stack apps
- **Render**: Good for Node.js applications
- **DigitalOcean**: VPS with Node.js support

Note: Vercel doesn't support custom servers, so use the alternatives above.

## Development

### Project Structure
```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── room/[roomId]/
│   │   └── page.tsx          # Chat room page
│   └── layout.tsx
├── components/
│   ├── ChatMessage.tsx       # Message component
│   └── ChatInput.tsx         # Input component
├── types/
│   └── chat.ts              # TypeScript interfaces
server.js                    # Custom Socket.io server
```

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server

## Hackathon Details

Built for CalHacks with focus on:
- Multi-turn conversation handling
- Group chat dynamics
- Real-time AI responses
- Creative prompting strategies
- Fast, responsive user experience

## License

MIT License - feel free to use for your own projects!