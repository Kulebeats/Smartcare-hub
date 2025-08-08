#!/bin/bash

# SmartCare PRO Production Start Script
# This script starts the production server (security-safe deployment)

echo "🌟 Starting SmartCare PRO production server..."

# Build frontend if not already built
if [ ! -f "dist/public/index.html" ]; then
    echo "🔨 Building frontend..."
    npx vite build
fi

# Copy built assets to server/public for compatibility
echo "Preparing server assets..."
mkdir -p server/public
if [ -d "dist/public" ]; then
    cp -r dist/public/* server/public/
    echo "✅ Static assets copied successfully"
else
    echo "❌ Build directory not found - running build first"
    npx vite build
    cp -r dist/public/* server/public/
fi

# Start production server using tsx (avoids "npm run xyz" commands)
echo "🚀 Starting server in production mode..."
export NODE_ENV=production
npx tsx server/index.ts