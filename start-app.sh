#!/bin/bash

echo "🎭 ================================"
echo "🎭 TIKKIE IRAN - MOBILE APP"
echo "🎭 ================================"
echo ""
echo "🌐 Backend: https://tikkie-iran-demo.vercel.app"
echo "👤 Login: 09123456789 / demo1234"
echo ""

cd "$(dirname "$0")/mobile"

# Clear watchman
echo "🧹 Clearing watchman..."
watchman watch-del-all 2>/dev/null

# Clear metro cache
echo "🧹 Clearing metro cache..."
rm -rf /tmp/metro-* /tmp/haste-map-* 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

echo "🚀 Starting Expo..."
echo ""
echo "📱 Install Expo Go on your phone:"
echo "   iOS: https://apps.apple.com/app/expo-go/id982107779"
echo "   Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo ""
echo "📸 Scan the QR code that appears!"
echo ""

npx expo start --clear

