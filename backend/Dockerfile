# Backend Dockerfile for Render
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --no-dev

# Copy application code
COPY . .

# Create audio cache directory
RUN mkdir -p audio_cache

# Expose port
EXPOSE 8000

# Start server
CMD ["uv", "run", "python", "start_server.py"]
