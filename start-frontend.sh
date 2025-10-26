#!/bin/bash

echo "🐱 Starting Talking Tom Chat - Frontend"
echo "================================"
echo ""

cd "$(dirname "$0")/frontend"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting frontend on http://localhost:3000"
echo "🔌 Make sure backend is running on http://localhost:8000"
echo ""

npm run dev
