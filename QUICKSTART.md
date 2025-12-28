# Tikkie Iran - Quick Start Guide

## English Version

### Prerequisites
- Node.js 16+ and npm
- Expo CLI (for mobile): `npm install -g expo-cli`

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server runs on http://localhost:3000

### Mobile Setup
```bash
cd mobile
npm install
npm start
```

### Demo Accounts
- Phone: 09123456789, Password: demo1234
- Phone: 09121111111, Password: demo1234
- Phone: 09122222222, Password: demo1234

### Features
✅ Full P2P payment system
✅ Iranian card validation (Luhn algorithm)
✅ Mock Shetab integration
✅ Mock SMS service (console output)
✅ In-memory database with JSON persistence
✅ JWT authentication
✅ Persian/Farsi UI
✅ Realistic demo data

### API Endpoints
- POST /api/auth/login - Login
- POST /api/auth/register - Register
- GET /api/user/cards - Get cards
- POST /api/payments/create - Create payment
- POST /api/payments/requests - Create payment request
- POST /api/mock/reset - Reset demo data

### Demo Mode
This version works WITHOUT:
- ❌ Real database (uses in-memory storage)
- ❌ Real Shetab API (mocked)
- ❌ Real SMS service (console logs)
- ❌ External APIs

Everything is self-contained and ready to demo!

---

## نسخه فارسی

### پیش‌نیازها
- Node.js نسخه 16 یا بالاتر
- Expo CLI برای موبایل: `npm install -g expo-cli`

### نصب Backend
```bash
cd backend
npm install
npm run dev
```
سرور روی http://localhost:3000 اجرا می‌شود

### نصب Mobile
```bash
cd mobile
npm install
npm start
```

### حساب‌های دمو
- موبایل: 09123456789، رمز: demo1234
- موبایل: 09121111111، رمز: demo1234
- موبایل: 09122222222، رمز: demo1234

### امکانات
✅ سیستم کامل پرداخت P2P
✅ اعتبارسنجی کارت ایرانی
✅ یکپارچگی موک شتاب
✅ سرویس موک پیامک
✅ پایگاه داده حافظه‌ای
✅ احراز هویت JWT
✅ رابط فارسی
✅ داده‌های دمو واقع‌گرایانه

### حالت دمو
این نسخه بدون نیاز به موارد زیر کار می‌کند:
- ❌ پایگاه داده واقعی
- ❌ API واقعی شتاب
- ❌ سرویس واقعی پیامک
- ❌ API های خارجی

همه چیز آماده برای نمایش است!

