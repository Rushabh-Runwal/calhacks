#!/usr/bin/env python3
"""
Startup script for the Talking Tom Chat server.
"""
import asyncio
import uvicorn
from main import socket_app, cleanup_audio

async def start_with_cleanup():
    """Start server with background cleanup task."""
    # Start cleanup task
    asyncio.create_task(cleanup_audio())
    
    # Start uvicorn server
    config = uvicorn.Config(
        socket_app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True
    )
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    print("🐱 Starting Talking Tom Chat Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("🎵 Audio files will be cached in: audio_cache/")
    print("🔌 WebSocket endpoint: ws://localhost:8000/socket.io/")
    print("\nPress Ctrl+C to stop the server")
    print("\nTo run: uv run python start_server.py")
    
    asyncio.run(start_with_cleanup())
