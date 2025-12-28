#!/bin/bash

# Alternative: Start in LAN mode with cache cleared

echo "🎭 TIKKIE IRAN - Mobile App (LAN Mode)"
echo ""

cd "$(dirname "$0")/mobile"

# Clear watchman if installed
if command -v watchman &> /dev/null; then
    echo "🔧 Clearing watchman cache..."
    watchman watch-del-all
fi

# Clear metro cache
echo "🔧 Clearing metro cache..."
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null

# Start expo with cleared cache
echo "🚀 Starting Expo (cache cleared)..."
npx expo start --clear

