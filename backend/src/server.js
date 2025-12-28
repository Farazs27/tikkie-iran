require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database/connection');
const { MockDataGenerator } = require('./database/mockData');

// Controllers
const authController = require('./controllers/auth.controller');
const userController = require('./controllers/user.controller');
const paymentController = require('./controllers/payment.controller');

// Middleware
const authMiddleware = require('./middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validateVerificationCode,
  validateCard,
  validatePayment,
  validatePaymentRequest
} = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`\n📡 ${req.method} ${req.path}`);
  next();
});

// ===== INITIALIZE DEMO DATA =====
console.log('\n🎭 ================================');
console.log('🎭 TIKKIE IRAN - DEMO MODE');
console.log('🎭 ================================\n');

// Check if we need to generate demo data
const existingData = db.getAllData();
if (!existingData.users || existingData.users.length === 0) {
  console.log('📦 Generating initial demo data...\n');
  const demoData = MockDataGenerator.generateDemoData();
  db.resetData(demoData);
} else {
  console.log('📦 Using existing demo data\n');
  console.log(`   Users: ${existingData.users.length}`);
  console.log(`   Cards: ${existingData.cards.length}`);
  console.log(`   Transactions: ${existingData.transactions.length}`);
  console.log(`   Payment Requests: ${existingData.paymentRequests.length}\n`);
}

// ===== AUTH ROUTES =====
app.post('/api/auth/register', validateRegistration, authController.register.bind(authController));
app.post('/api/auth/login', validateLogin, authController.login.bind(authController));
app.post('/api/auth/send-code', authController.sendVerificationCode.bind(authController));
app.post('/api/auth/verify-code', validateVerificationCode, authController.verifyCode.bind(authController));

// ===== USER ROUTES =====
app.get('/api/user/profile', authMiddleware, userController.getProfile.bind(userController));
app.get('/api/user/cards', authMiddleware, userController.getCards.bind(userController));
app.post('/api/user/cards', authMiddleware, validateCard, userController.addCard.bind(userController));
app.delete('/api/user/cards/:cardId', authMiddleware, userController.deleteCard.bind(userController));
app.put('/api/user/cards/:cardId/primary', authMiddleware, userController.setPrimaryCard.bind(userController));

// ===== PAYMENT ROUTES =====
app.get('/api/payments/transactions', authMiddleware, paymentController.getTransactions.bind(paymentController));
app.post('/api/payments/create', authMiddleware, validatePayment, paymentController.createPayment.bind(paymentController));

app.get('/api/payments/requests', authMiddleware, paymentController.getPaymentRequests.bind(paymentController));
app.post('/api/payments/requests', authMiddleware, validatePaymentRequest, paymentController.createPaymentRequest.bind(paymentController));
app.get('/api/payments/requests/:shareCode', paymentController.getPaymentRequestByCode.bind(paymentController));
app.post('/api/payments/requests/pay', authMiddleware, paymentController.payPaymentRequest.bind(paymentController));

// ===== MOCK/DEMO ROUTES =====
app.post('/api/mock/reset', (req, res) => {
  console.log('🔄 Resetting demo data...');
  const demoData = MockDataGenerator.generateDemoData();
  db.resetData(demoData);
  
  res.json({
    success: true,
    message: 'داده‌های دمو بازنشانی شد',
    data: {
      users: demoData.users.length,
      cards: demoData.cards.length,
      transactions: demoData.transactions.length,
      paymentRequests: demoData.paymentRequests.length
    }
  });
});

app.get('/api/mock/demo-users', (req, res) => {
  const users = db.getAllData().users;
  const demoUsers = users.map(u => ({
    phone: u.phone,
    password: 'demo1234',
    name: `${u.firstName} ${u.lastName}`
  }));
  
  res.json({
    success: true,
    data: demoUsers
  });
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tikkie Iran API is running in DEMO mode',
    mode: 'DEMO',
    version: '1.0.0'
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'خطای سرور. لطفا بعدا تلاش کنید'
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log('🎭 ================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🎭 Mode: DEMO (No external APIs)');
  console.log('🎭 ================================\n');
  console.log('📱 Demo Users:');
  console.log('   Phone: 09123456789, Password: demo1234');
  console.log('   Phone: 09121111111, Password: demo1234');
  console.log('   Phone: 09122222222, Password: demo1234\n');
  console.log('🔗 API: http://localhost:' + PORT);
  console.log('🔗 Health: http://localhost:' + PORT + '/api/health');
  console.log('🔗 Reset Demo: POST http://localhost:' + PORT + '/api/mock/reset\n');
});

module.exports = app;

