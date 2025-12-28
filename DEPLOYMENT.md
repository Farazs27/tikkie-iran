# 🚀 Deployment Guide - Tikkie Iran Demo

This guide will help you deploy the Tikkie Iran demo to GitHub and Vercel so you can test it on your phone.

---

## 📋 Prerequisites

1. **GitHub Account**: [Sign up here](https://github.com/join) if you don't have one
2. **Vercel Account**: [Sign up here](https://vercel.com/signup) - use GitHub login for easy setup
3. **Git installed**: Check with `git --version`
4. **Node.js installed**: Check with `node --version`

---

## 🔧 Step 1: Prepare the Project

The project is already configured with:
- ✅ `.gitignore` file
- ✅ `vercel.json` configuration
- ✅ Backend ready for deployment
- ✅ Mobile app ready to connect

---

## 📤 Step 2: Push to GitHub

### Option A: Using Terminal (Recommended)

```bash
# Navigate to project directory
cd "/Users/farazsharifi/tikkie iran"

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Tikkie Iran demo v1.0"

# Create repository on GitHub and push
# Go to https://github.com/new and create a repo named "tikkie-iran"
# Then run:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tikkie-iran.git
git push -u origin main
```

### Option B: Using GitHub Desktop

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. File → Add Local Repository
4. Choose `/Users/farazsharifi/tikkie iran`
5. Publish repository to GitHub

---

## ☁️ Step 3: Deploy Backend to Vercel

### Method 1: Web Interface (Easiest)

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Select your GitHub account
   - Find `tikkie-iran` repository
   - Click "Import"

3. **Configure Project**:
   - **Project Name**: `tikkie-iran` (or whatever you prefer)
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as `./`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `cd backend && npm install`

4. **Environment Variables** (Optional - already in vercel.json):
   - `DEMO_MODE`: `true`
   - `JWT_SECRET`: `tikkie-iran-demo-secret`
   - `PORT`: `3000`

5. **Click "Deploy"**
   - Wait 1-2 minutes
   - You'll get a URL like: `https://tikkie-iran-abc123.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd "/Users/farazsharifi/tikkie iran"

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Your account
# - Link to existing project? N
# - Project name? tikkie-iran
# - Directory? ./
# - Override settings? N

# Deploy to production
vercel --prod
```

---

## 📱 Step 4: Update Mobile App with Backend URL

After deploying to Vercel, you'll get a URL like `https://tikkie-iran-abc123.vercel.app`

1. **Open** `/Users/farazsharifi/tikkie iran/mobile/src/services/api.js`

2. **Update line 7** with your Vercel URL:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://tikkie-iran-abc123.vercel.app/api'; // ← PUT YOUR URL HERE
```

3. **Save the file**

4. **Commit and push changes**:
```bash
git add mobile/src/services/api.js
git commit -m "Update API URL for production"
git push
```

---

## 📲 Step 5: Test on Your Phone

### Option A: Expo Go (Recommended for Quick Testing)

1. **Install Expo Go** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the development server**:
```bash
cd "/Users/farazsharifi/tikkie iran/mobile"
npm install
npm start
```

3. **Scan QR Code**:
   - iOS: Open Camera app and scan QR code
   - Android: Open Expo Go app and scan QR code

4. **Make sure your phone is on the same WiFi as your computer**

### Option B: Build for Production (Takes longer)

#### For iOS (requires Mac):

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Install on phone via TestFlight
```

#### For Android:

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build APK for direct install
eas build --platform android --profile preview

# Download APK and install on phone
```

---

## 🧪 Step 6: Verify Deployment

### Test Backend API

```bash
# Replace with your Vercel URL
curl https://tikkie-iran-abc123.vercel.app/api/health

# Should return:
# {
#   "success": true,
#   "message": "Tikkie Iran API is running in DEMO mode",
#   "mode": "DEMO",
#   "version": "1.0.0"
# }
```

### Test Demo Users Endpoint

```bash
curl https://tikkie-iran-abc123.vercel.app/api/mock/demo-users

# Should return list of demo users
```

### Test Login

```bash
curl -X POST https://tikkie-iran-abc123.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"09123456789","password":"demo1234"}'

# Should return token and user data
```

---

## 🎯 Step 7: Demo on Phone

Once you have the app running on your phone:

1. **Open the app** - You'll see the demo banner
2. **Tap a demo user** (علی احمدی, سارا محمدی, or رضا کریمی)
3. **Tap "ورود سریع"** (Quick Login)
4. **Explore features**:
   - ✅ View transactions
   - ✅ View payment requests
   - ✅ Add/view cards
   - ✅ Create payment requests
   - ✅ Send payments

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Vercel deployment fails
- **Solution**: Check `vercel.json` is in project root
- **Solution**: Make sure `backend/src/server.js` exports the app: `module.exports = app;`

**Problem**: API returns 404
- **Solution**: Check Vercel logs: `vercel logs`
- **Solution**: Verify URL includes `/api/` prefix

**Problem**: CORS errors
- **Solution**: Backend already has CORS enabled in `server.js`

### Mobile App Issues

**Problem**: Can't connect to backend
- **Solution**: Check API_BASE_URL in `api.js` is correct
- **Solution**: Make sure URL doesn't have trailing slash
- **Solution**: Try DEMO_MODE=true to test without backend

**Problem**: Expo Go shows error
- **Solution**: Make sure phone is on same WiFi
- **Solution**: Restart with `npm start --clear`
- **Solution**: Check firewall isn't blocking connection

**Problem**: App shows old data
- **Solution**: Clear app data: Shake phone → Dev Menu → Clear AsyncStorage
- **Solution**: Uninstall and reinstall Expo Go app

---

## 🌐 Optional: Custom Domain

Want a nicer URL like `tikkie-iran.yourdomain.com`?

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Domains
4. Add custom domain
5. Follow DNS configuration instructions
6. Update mobile app API URL

---

## 📊 Monitoring

### View Logs

```bash
# View real-time logs
vercel logs --follow

# View specific deployment
vercel logs [deployment-url]
```

### Vercel Dashboard

- View at: https://vercel.com/dashboard
- See deployments, logs, analytics
- Monitor API usage and performance

---

## 🔄 Update Deployment

After making changes:

```bash
# Commit changes
git add .
git commit -m "Update: describe your changes"
git push

# Vercel auto-deploys on push!
# Or manually deploy:
vercel --prod
```

---

## 📱 Share with Investors/Stakeholders

### Share Backend API

- URL: `https://tikkie-iran-abc123.vercel.app`
- Health Check: `https://tikkie-iran-abc123.vercel.app/api/health`
- Demo Users: `https://tikkie-iran-abc123.vercel.app/api/mock/demo-users`

### Share Mobile App

**Option 1: Expo Go (Quick)** Share the Expo Go link:
```
exp://your-project-id.exp.direct:80
```

**Option 2: TestFlight (iOS Professional)**
- Build with `eas build --platform ios`
- Upload to TestFlight
- Share invite link

**Option 3: APK (Android Direct)**
- Build with `eas build --platform android --profile preview`
- Share download link
- Users install APK directly

**Option 4: Web Demo (If using Expo Web)**
```bash
cd mobile
npm run web
# Deploy to Vercel/Netlify
```

---

## 🎬 Demo Script for Investors

1. **Show Backend API** (Browser):
   - Open `https://your-app.vercel.app/api/health`
   - Show "DEMO MODE" indicator
   - Open `https://your-app.vercel.app/api/mock/demo-users`
   - Show demo users

2. **Show Mobile App** (Phone):
   - Open app, show demo banner
   - "این یک نسخه دمو است" (This is a demo version)
   - Tap demo user (علی احمدی)
   - Quick login
   - Show home screen with transactions
   - Navigate to cards screen
   - Show payment requests
   - Create new payment request
   - Show share functionality

3. **Highlight Features**:
   - ✅ Full Persian/Farsi UI
   - ✅ Iranian bank integration (mock)
   - ✅ SMS verification (mock)
   - ✅ Payment processing with Shetab
   - ✅ Payment requests with share links
   - ✅ Transaction history
   - ✅ Multiple cards support

4. **Explain Demo Mode**:
   - No external APIs needed
   - No database setup required
   - All data is realistic but mocked
   - Ready for production with real API integration

---

## 🎉 Success Checklist

- [ ] Backend deployed to Vercel
- [ ] Health check endpoint works
- [ ] Demo users endpoint works
- [ ] Mobile app updated with production URL
- [ ] App tested on phone via Expo Go
- [ ] Can login with demo users
- [ ] All features working (transactions, cards, requests)
- [ ] Demo banner visible
- [ ] Share links generated
- [ ] Ready to demonstrate!

---

## 🆘 Need Help?

### Common Commands

```bash
# View project status
cd "/Users/farazsharifi/tikkie iran"
git status
vercel ls

# View logs
vercel logs --follow

# Redeploy
vercel --prod

# Test mobile app locally
cd mobile
npm start

# Clear Expo cache
cd mobile
npm start -- --clear
```

### Resources

- Vercel Docs: https://vercel.com/docs
- Expo Docs: https://docs.expo.dev
- React Native Docs: https://reactnative.dev

---

## 🎯 Quick Commands Reference

```bash
# Full deployment from scratch
cd "/Users/farazsharifi/tikkie iran"
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/tikkie-iran.git
git push -u origin main

# Deploy to Vercel
npm install -g vercel
vercel
vercel --prod

# Update mobile API URL (edit api.js)
# Then test on phone:
cd mobile
npm start
# Scan QR with Expo Go
```

---

<div dir="rtl">

## 🎭 آماده برای نمایش!

پس از اجرای این مراحل، نسخه دمو شما:
- ✅ در Vercel اجرا می‌شود
- ✅ روی گوشی شما کار می‌کند
- ✅ برای نمایش به سرمایه‌گذاران آماده است
- ✅ بدون نیاز به تنظیمات پیچیده

**موفق باشید! 🚀**

</div>

