#!/bin/bash
# Start the Next.js frontend

echo "🐱 Starting Talking Tom Chat Frontend..."
echo "📍 Frontend will be available at: http://localhost:3000"
echo "🔌 Make sure the Python backend is running on: http://localhost:8000"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start the development server
echo "🚀 Starting Next.js development server..."
npm run dev
