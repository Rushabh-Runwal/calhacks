#!/bin/bash

echo "🐱 Starting Talking Tom Chat - Backend"
echo "================================"
echo ""

cd "$(dirname "$0")/backend"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Please edit backend/.env with your API keys"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
if [ ! -f ".venv/.installed" ]; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    touch .venv/.installed
fi

# Create audio cache directory
mkdir -p audio_cache

echo ""
echo "🚀 Starting backend server on http://localhost:8000"
echo ""

python start_server.py
