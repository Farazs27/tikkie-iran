#!/bin/bash

# Tikkie Iran - Mobile App Startup (Tunnel Mode - More Stable)

echo "🎭 ================================"
echo "🎭 TIKKIE IRAN - MOBILE APP"
echo "🎭 ================================"
echo ""
echo "🌐 Backend API: https://tikkie-iran-demo.vercel.app"
echo ""
echo "👤 Login Credentials:"
echo "   📱 09123456789 | 🔑 demo1234 | علی احمدی"
echo "   📱 09121111111 | 🔑 demo1234 | سارا محمدی"
echo "   📱 09122222222 | 🔑 demo1234 | رضا کریمی"
echo ""
echo "📲 Instructions:"
echo "   1. Install Expo Go on your phone"
echo "   2. Scan the QR code"
echo "   3. Works over internet (no WiFi needed!)"
echo ""
echo "🚀 Starting..."
echo ""

cd "$(dirname "$0")/mobile"

# Start with tunnel mode (works over internet, more stable)
npx expo start --tunnel
