#!/bin/bash
echo "🐱 Starting Talking Tom Chat Frontend..."
echo "📍 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:8000"
echo ""

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting Next.js..."
npm run dev