# 🔧 Quick Fix for "Too Many Open Files" Error

## Problem
Getting `Error: EMFILE: too many open files, watch` when starting the mobile app.

## ✅ Solution: Use Tunnel Mode (Recommended)

Tunnel mode is more stable and works over internet (no WiFi matching needed!):

```bash
cd "/Users/farazsharifi/tikkie iran"
./start-mobile.sh
```

This will:
- ✅ Work over internet (no same-WiFi requirement)
- ✅ Avoid file watcher issues
- ✅ More stable connection
- ✅ Generate QR code you can scan from anywhere

---

## Alternative: Clear Cache and Use LAN Mode

If you prefer local network:

```bash
cd "/Users/farazsharifi/tikkie iran"
./start-mobile-lan.sh
```

This will:
- Clear metro cache
- Clear watchman cache (if installed)
- Start in LAN mode

---

## Manual Fix Options

### Option 1: Direct Tunnel Mode
```bash
cd "/Users/farazsharifi/tikkie iran/mobile"
npx expo start --tunnel
```

### Option 2: Clear Cache First
```bash
cd "/Users/farazsharifi/tikkie iran/mobile"
rm -rf node_modules/.cache
npx expo start --clear
```

### Option 3: Install Watchman (Permanent Fix)
```bash
brew install watchman
```
Then restart:
```bash
cd "/Users/farazsharifi/tikkie iran"
./start-mobile.sh
```

---

## 📱 After It Starts

1. **You'll see a QR code** in the terminal
2. **Install Expo Go** on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
3. **Scan the QR code**
4. **Login with**:
   - Phone: 09123456789
   - Password: demo1234

---

## 🌐 Backend Already Works!

The backend is live and working:
- ✅ https://tikkie-iran-demo.vercel.app/api/health
- ✅ https://tikkie-iran-demo.vercel.app/api/mock/demo-users

You can test the backend while fixing the mobile app issue!

---

## 💡 Why This Happens

macOS has file watcher limits that can be exceeded by Metro bundler. Tunnel mode bypasses this by using Expo's cloud infrastructure instead of local file watching.

---

**TL;DR: Just run `./start-mobile.sh` - it's fixed now!**

