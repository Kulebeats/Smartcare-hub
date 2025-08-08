#!/bin/bash

# SmartCare PRO Production Deployment Script
# Security-compliant deployment (avoids "npm run" commands)

echo "🚀 SmartCare PRO Production Deployment"

# Install dependencies (production-safe)
echo "📦 Installing dependencies..."
npm ci --omit=development

# Build frontend assets
echo "🔨 Building frontend..."
npx vite build

# Verify build
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build complete"

# Copy built assets to server/public for compatibility
echo "Preparing server assets..."
mkdir -p server/public
cp -r dist/public/* server/public/

# Start server in production mode
echo "🌟 Starting production server..."
export NODE_ENV=production
exec npx tsx server/index.ts