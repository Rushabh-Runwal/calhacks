#!/usr/bin/env python3
import asyncio
import uvicorn
from main import socket_app, cleanup_audio

async def start_with_cleanup():
    asyncio.create_task(cleanup_audio())
    config = uvicorn.Config(socket_app, host="0.0.0.0", port=8000, log_level="info", reload=True)
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    print("Starting Talking Tom Chat Server...")
    print("Server: http://localhost:8000")
    print("WebSocket: ws://localhost:8000/socket.io/")
    print("Press Ctrl+C to stop")
    asyncio.run(start_with_cleanup())