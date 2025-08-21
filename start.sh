#!/bin/bash

echo "🚀 Starting MindSphere..."
echo "📍 Directory: $(pwd)"
echo "🌐 Starting server on http://localhost:3000"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the MindSphere-Local directory"
    exit 1
fi

# Check if preview script exists
if ! grep -q '"preview"' package.json; then
    echo "❌ Error: preview script not found in package.json!"
    exit 1
fi

echo "✅ Starting preview server..."
echo "📱 Open http://localhost:3000 in your browser"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

npm run preview
