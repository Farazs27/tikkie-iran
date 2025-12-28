#!/bin/bash

# Tikkie Iran - Quick Start Script
# This script starts the mobile app for testing on your phone

echo "🎭 ================================"
echo "🎭 TIKKIE IRAN - MOBILE APP STARTUP"
echo "🎭 ================================"
echo ""
echo "📱 Starting mobile app..."
echo ""
echo "🌐 Backend API: https://tikkie-iran-demo.vercel.app"
echo "💚 Health Check: https://tikkie-iran-demo.vercel.app/api/health"
echo ""
echo "👤 Demo Login Credentials:"
echo "   Phone: 09123456789, Password: demo1234 (علی احمدی)"
echo "   Phone: 09121111111, Password: demo1234 (سارا محمدی)"
echo "   Phone: 09122222222, Password: demo1234 (رضا کریمی)"
echo ""
echo "📱 Instructions:"
echo "   1. Install Expo Go on your phone"
echo "   2. Scan the QR code that appears"
echo "   3. Make sure phone and Mac are on same WiFi"
echo ""
echo "🎬 Starting Expo..."
echo ""

cd "$(dirname "$0")/mobile"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Expo
npm start

