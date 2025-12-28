import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// For production, set this to your Vercel deployment URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-app.vercel.app/api'; // Production - UPDATE THIS AFTER DEPLOYMENT

const DEMO_MODE = true; // Set to false to use real backend

// Mock demo data for offline mode
const DEMO_USERS = [
  {
    id: 'demo-user-1',
    phone: '09123456789',
    password: 'demo1234',
    firstName: 'علی',
    lastName: 'احمدی',
    nationalId: '0012345678'
  },
  {
    id: 'demo-user-2',
    phone: '09121111111',
    password: 'demo1234',
    firstName: 'سارا',
    lastName: 'محمدی',
    nationalId: '0011111111'
  },
  {
    id: 'demo-user-3',
    phone: '09122222222',
    password: 'demo1234',
    firstName: 'رضا',
    lastName: 'کریمی',
    nationalId: '0022222222'
  }
];

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.demoMode = DEMO_MODE;
    this.currentUser = null;
  }

  // ===== DEMO MODE HELPERS =====

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateId() {
    return `demo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  async getDemoData(key) {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async saveDemoData(key, data) {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }

  async getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    const userData = await AsyncStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
    return this.currentUser;
  }

  async setCurrentUser(user) {
    this.currentUser = user;
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
  }

  // ===== AUTH ENDPOINTS =====

  async login(phone, password) {
    console.log('🔐 API: Login', { phone });

    if (this.demoMode) {
      await this.delay(1000);
      
      const user = DEMO_USERS.find(u => u.phone === phone && u.password === password);
      if (!user) {
        throw new Error('شماره موبایل یا رمز عبور اشتباه است');
      }

      const token = `demo-token-${user.id}`;
      await AsyncStorage.setItem('authToken', token);
      await this.setCurrentUser(user);

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName
          }
        }
      };
    }

    try {
      const response = await this.api.post('/auth/login', { phone, password });
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await this.setCurrentUser(response.data.data.user);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    console.log('📝 API: Register', { phone: userData.phone });

    if (this.demoMode) {
      await this.delay(1500);

      // Check if user exists
      const existing = DEMO_USERS.find(u => u.phone === userData.phone);
      if (existing) {
        throw new Error('این شماره موبایل قبلا ثبت شده است');
      }

      const newUser = {
        id: this.generateId(),
        ...userData
      };

      DEMO_USERS.push(newUser);

      const token = `demo-token-${newUser.id}`;
      await AsyncStorage.setItem('authToken', token);
      await this.setCurrentUser(newUser);

      return {
        success: true,
        data: {
          token,
          user: {
            id: newUser.id,
            phone: newUser.phone,
            firstName: newUser.firstName,
            lastName: newUser.lastName
          }
        }
      };
    }

    try {
      const response = await this.api.post('/auth/register', userData);
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await this.setCurrentUser(response.data.data.user);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('currentUser');
    this.currentUser = null;
  }

  // ===== USER ENDPOINTS =====

  async getProfile() {
    console.log('👤 API: Get Profile');

    if (this.demoMode) {
      await this.delay(500);
      const user = await this.getCurrentUser();
      if (!user) throw new Error('لطفا وارد حساب کاربری خود شوید');

      return {
        success: true,
        data: {
          ...user,
          cardsCount: 2
        }
      };
    }

    try {
      const response = await this.api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCards() {
    console.log('💳 API: Get Cards');

    if (this.demoMode) {
      await this.delay(500);
      const cards = await this.getDemoData('demo_cards') || this.getDefaultDemoCards();
      return { success: true, data: cards };
    }

    try {
      const response = await this.api.get('/user/cards');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addCard(cardData) {
    console.log('💳 API: Add Card');

    if (this.demoMode) {
      await this.delay(1500);

      const cards = await this.getDemoData('demo_cards') || this.getDefaultDemoCards();
      
      const newCard = {
        id: this.generateId(),
        cardNumber: cardData.cardNumber,
        cardNumberFull: cardData.cardNumber,
        bankName: this.getBankName(cardData.cardNumber),
        holderName: 'دارنده کارت',
        isPrimary: cards.length === 0,
        createdAt: new Date().toISOString()
      };

      cards.push(newCard);
      await this.saveDemoData('demo_cards', cards);

      return { success: true, message: 'کارت با موفقیت اضافه شد', data: newCard };
    }

    try {
      const response = await this.api.post('/user/cards', cardData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCard(cardId) {
    console.log('🗑️  API: Delete Card', cardId);

    if (this.demoMode) {
      await this.delay(500);
      let cards = await this.getDemoData('demo_cards') || [];
      cards = cards.filter(c => c.id !== cardId);
      await this.saveDemoData('demo_cards', cards);
      return { success: true, message: 'کارت با موفقیت حذف شد' };
    }

    try {
      const response = await this.api.delete(`/user/cards/${cardId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== PAYMENT ENDPOINTS =====

  async getTransactions(limit = 50) {
    console.log('📋 API: Get Transactions');

    if (this.demoMode) {
      await this.delay(500);
      const transactions = await this.getDemoData('demo_transactions') || this.getDefaultDemoTransactions();
      return { success: true, data: transactions.slice(0, limit) };
    }

    try {
      const response = await this.api.get(`/payments/transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPayment(paymentData) {
    console.log('💸 API: Create Payment', paymentData);

    if (this.demoMode) {
      await this.delay(2500); // Simulate processing time

      // Simulate 90% success rate
      if (Math.random() > 0.9) {
        throw new Error('خطا در اتصال به بانک');
      }

      const transaction = {
        id: this.generateId(),
        type: 'sent',
        otherParty: 'گیرنده',
        amount: paymentData.amount,
        description: paymentData.description,
        trackingCode: this.generateTrackingCode(),
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      // Save to transactions
      const transactions = await this.getDemoData('demo_transactions') || [];
      transactions.unshift(transaction);
      await this.saveDemoData('demo_transactions', transactions);

      return {
        success: true,
        message: 'پرداخت با موفقیت انجام شد',
        data: transaction
      };
    }

    try {
      const response = await this.api.post('/payments/create', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentRequests() {
    console.log('📝 API: Get Payment Requests');

    if (this.demoMode) {
      await this.delay(500);
      const requests = await this.getDemoData('demo_payment_requests') || this.getDefaultDemoPaymentRequests();
      return { success: true, data: requests };
    }

    try {
      const response = await this.api.get('/payments/requests');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPaymentRequest(requestData) {
    console.log('📝 API: Create Payment Request', requestData);

    if (this.demoMode) {
      await this.delay(1000);

      const request = {
        id: this.generateId(),
        amount: requestData.amount,
        description: requestData.description,
        shareCode: this.generateShareCode(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: null,
        paidBy: null
      };

      const requests = await this.getDemoData('demo_payment_requests') || [];
      requests.unshift(request);
      await this.saveDemoData('demo_payment_requests', requests);

      return {
        success: true,
        message: 'درخواست پرداخت ایجاد شد',
        data: {
          ...request,
          shareLink: `tikkie://request/${request.shareCode}`
        }
      };
    }

    try {
      const response = await this.api.post('/payments/requests', requestData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== DEMO DATA GENERATORS =====

  getDefaultDemoCards() {
    return [
      {
        id: 'card-1',
        cardNumber: '603799******1234',
        cardNumberFull: '6037991234567890',
        bankName: 'بانک ملی ایران',
        holderName: 'علی احمدی',
        isPrimary: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'card-2',
        cardNumber: '627961******5678',
        cardNumberFull: '6279615678901234',
        bankName: 'بانک صنعت و معدن',
        holderName: 'علی احمدی',
        isPrimary: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  getDefaultDemoTransactions() {
    const now = Date.now();
    return [
      {
        id: 'tx-1',
        type: 'received',
        otherParty: 'سارا محمدی',
        amount: 500000,
        description: 'هزینه ناهار',
        trackingCode: '123456789012',
        status: 'completed',
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx-2',
        type: 'sent',
        otherParty: 'رضا کریمی',
        amount: 1200000,
        description: 'بدهی قبلی',
        trackingCode: '123456789013',
        status: 'completed',
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx-3',
        type: 'received',
        otherParty: 'مهدی رضایی',
        amount: 750000,
        description: 'خرید مشترک',
        trackingCode: '123456789014',
        status: 'completed',
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  getDefaultDemoPaymentRequests() {
    const now = Date.now();
    return [
      {
        id: 'req-1',
        amount: 350000,
        description: 'هزینه پیتزا',
        shareCode: 'ABC12345',
        status: 'pending',
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: null,
        paidBy: null
      },
      {
        id: 'req-2',
        amount: 600000,
        description: 'شام دیشب',
        shareCode: 'XYZ67890',
        status: 'completed',
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now + 6 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
        paidBy: 'سارا محمدی'
      },
      {
        id: 'req-3',
        amount: 200000,
        description: 'کرایه تاکسی',
        shareCode: 'DEF11111',
        status: 'expired',
        createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: null,
        paidBy: null
      }
    ];
  }

  getBankName(cardNumber) {
    const bin = cardNumber.substring(0, 6);
    const banks = {
      '603799': 'بانک ملی ایران',
      '627961': 'بانک صنعت و معدن',
      '622106': 'بانک پارسیان',
      '627353': 'بانک تجارت',
      '589210': 'بانک سپه'
    };
    return banks[bin] || 'بانک نامشخص';
  }

  generateTrackingCode() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }

  generateShareCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'خطایی رخ داد');
    }
    if (error.request) {
      return new Error('خطا در اتصال به سرور');
    }
    return error;
  }

  // ===== DEMO HELPERS =====

  getDemoUsers() {
    return DEMO_USERS;
  }

  async resetDemoData() {
    await AsyncStorage.multiRemove([
      'demo_cards',
      'demo_transactions',
      'demo_payment_requests'
    ]);
  }
}

export default new ApiService();

