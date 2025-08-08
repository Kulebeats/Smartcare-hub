#!/bin/bash

# SmartCare PRO Production Deployment Script
# Security-compliant production start (no "dev" commands)

echo "🚀 SmartCare PRO Production Server"

# Set production environment
export NODE_ENV=production

# Build frontend for production
echo "Building frontend assets..."
npx vite build

# Verify build success
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build complete"

# Copy built assets to server/public for compatibility
echo "Preparing server assets..."
mkdir -p server/public
cp -r dist/public/* server/public/

# Start production server
echo "Starting production server..."
npx tsx server/index.ts