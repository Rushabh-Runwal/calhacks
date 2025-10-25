# Streaming AI Response Implementation

## Overview
Successfully implemented real-time streaming AI responses with simultaneous text and audio generation using JanitorAI API and Fish Audio WebSocket SDK.

## Architecture

### Backend Flow
1. **User sends message** (text or voice) → Backend receives via Socket.IO
2. **AI Response Generation** → JanitorAI API streams text chunks
3. **Simultaneous Processing**:
   - Text chunks emitted to frontend via `aiTextChunk` events
   - Same text chunks passed to Fish Audio WebSocket for TTS
4. **Audio Generation** → Fish Audio collects audio chunks and saves complete file
5. **Completion** → Backend emits `aiComplete` event with full message + audio URL

### Frontend Flow
1. **Receives `aiTextChunk` events** → Updates streaming message display in real-time
2. **Shows typing indicator** → Animated cursor while streaming
3. **Receives `aiComplete` event** → Replaces streaming message with final message
4. **Auto-plays audio** → Tom's voice plays automatically

## Key Files

### Backend
- **`services/janitor_ai.py`**: Streaming AI client using httpx AsyncClient
  - `stream_ai_response()`: Async generator that yields text chunks from JanitorAI API
  - Parses Server-Sent Events format (`data: {"content": "..."}`)

- **`services/fish_audio.py`**: Fish Audio WebSocket integration
  - `generate_streaming_audio()`: Uses AsyncWebSocketSession to generate audio from text stream
  - Collects audio chunks and saves to MP3 file

- **`main.py`**: Socket.IO event handlers
  - `generate_streaming_ai_response()`: Orchestrates streaming text + audio generation
  - Emits `aiTextChunk` for each text chunk
  - Emits `aiComplete` when done with audio URL

### Frontend
- **`src/app/room/[roomId]/page.tsx`**: Chat room page
  - Tracks `streamingMessages` Map for in-progress AI responses
  - Listens for `aiTextChunk` and `aiComplete` events
  - Displays streaming messages alongside completed messages

- **`src/components/ChatMessage.tsx`**: Message display component
  - Accepts `isStreaming` prop
  - Shows animated typing cursor for streaming messages
  - Auto-plays audio when available

## Socket.IO Events

### Client → Server
- `sendMessage`: User sends text message
- `sendVoiceMessage`: User sends voice recording (base64 audio)

### Server → Client
- `message`: Regular message (user or complete AI message)
- `aiTextChunk`: Streaming AI text chunk
  ```typescript
  { messageId: string, chunk: string }
  ```
- `aiComplete`: Complete AI message with audio
  ```typescript
  Message { id, content, username, timestamp, isAI, audioUrl }
  ```

## Features
✅ Real-time text streaming from JanitorAI API
✅ Simultaneous audio generation using Fish Audio WebSocket
✅ Live typing indicator for streaming messages
✅ Auto-play audio when generation completes
✅ Works for both text and voice messages
✅ Multiple users see synchronized streaming
✅ Proper error handling and fallbacks

## Testing
To test the complete flow:
1. Start backend: `cd multiplayer-ai-chat-python && uv run python start_server.py`
2. Start frontend: `cd multiplayer-ai-chat-python && npm run dev`
3. Open `http://localhost:3000`
4. Create/join a room
5. Send a message or voice recording
6. Watch text stream in real-time
7. Hear Tom's voice response automatically

## Dependencies
- **Backend**: `httpx`, `python-socketio`, `fish-audio-sdk`, `fastapi`, `uvicorn`
- **Frontend**: `socket.io-client`, `next`, `react`, `typescript`

