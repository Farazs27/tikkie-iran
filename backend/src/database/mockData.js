const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const moment = require('moment-jalaali');

/**
 * Iranian Bank BIN (Bank Identification Number) mapping
 */
const IRANIAN_BANKS = {
  '603799': { name: 'بانک ملی ایران', nameEn: 'Bank Melli Iran' },
  '627961': { name: 'بانک صنعت و معدن', nameEn: 'Bank Sanat va Madan' },
  '622106': { name: 'بانک پارسیان', nameEn: 'Parsian Bank' },
  '627353': { name: 'بانک تجارت', nameEn: 'Tejarat Bank' },
  '589210': { name: 'بانک سپه', nameEn: 'Bank Sepah' },
  '627412': { name: 'بانک اقتصاد نوین', nameEn: 'Eghtesad Novin Bank' },
  '639607': { name: 'بانک صادرات', nameEn: 'Bank Saderat' },
  '627488': { name: 'بانک کارآفرین', nameEn: 'Karafarin Bank' },
  '621986': { name: 'بانک سامان', nameEn: 'Saman Bank' },
  '639346': { name: 'بانک سینا', nameEn: 'Sina Bank' },
  '639599': { name: 'بانک قوامین', nameEn: 'Ghavamin Bank' },
  '504862': { name: 'بانک شهر', nameEn: 'Shahr Bank' },
  '636214': { name: 'بانک آینده', nameEn: 'Ayandeh Bank' },
  '505785': { name: 'بانک توسعه تعاون', nameEn: 'Tosee Taavon Bank' }
};

/**
 * Common Iranian first and last names
 */
const PERSIAN_NAMES = {
  firstNames: ['علی', 'محمد', 'حسین', 'رضا', 'حسن', 'احمد', 'مهدی', 'سعید', 'امیر', 'مرتضی', 'سارا', 'فاطمه', 'زهرا', 'مریم', 'نرگس', 'نازنین', 'الهام', 'شیدا', 'نیلوفر', 'پریسا'],
  lastNames: ['احمدی', 'محمدی', 'رضایی', 'حسینی', 'کریمی', 'جعفری', 'موسوی', 'اکبری', 'نوری', 'حیدری', 'کاظمی', 'صادقی', 'علوی', 'ناصری', 'یوسفی', 'رحیمی', 'عباسی', 'خانی', 'شریفی', 'سلیمانی']
};

/**
 * Common Persian payment descriptions
 */
const PERSIAN_DESCRIPTIONS = [
  'هزینه ناهار',
  'بدهی قبلی',
  'خرید مشترک',
  'کمک هزینه',
  'هدیه تولد',
  'شام دیشب',
  'خرید لوازم منزل',
  'کرایه تاکسی',
  'هزینه سفر',
  'پول امانی',
  'وام دوستانه',
  'بدهی ماه قبل',
  'خرید آنلاین',
  'هزینه پیتزا',
  'خرید کتاب',
  'هزینه سینما',
  'پول قرضی',
  'کمک به دوست',
  'خرید کادو',
  'هزینه رستوران'
];

/**
 * Generate mock data for demo mode
 */
class MockDataGenerator {
  
  /**
   * Generate 3 demo users with cards, transactions, and payment requests
   */
  static generateDemoData() {
    console.log('🎭 Generating demo data...');
    
    const users = this.generateUsers();
    const cards = this.generateCards(users);
    const transactions = this.generateTransactions(users, cards);
    const paymentRequests = this.generatePaymentRequests(users);

    console.log(`✅ Generated: ${users.length} users, ${cards.length} cards, ${transactions.length} transactions, ${paymentRequests.length} payment requests`);

    return {
      users,
      cards,
      transactions,
      paymentRequests,
      verificationCodes: []
    };
  }

  /**
   * Generate 3 demo users
   */
  static generateUsers() {
    const demoUsers = [
      {
        id: uuidv4(),
        phone: '09123456789',
        nationalId: '0012345678',
        firstName: 'علی',
        lastName: 'احمدی',
        password: bcrypt.hashSync('demo1234', 10),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
      },
      {
        id: uuidv4(),
        phone: '09121111111',
        nationalId: '0011111111',
        firstName: 'سارا',
        lastName: 'محمدی',
        password: bcrypt.hashSync('demo1234', 10),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
      },
      {
        id: uuidv4(),
        phone: '09122222222',
        nationalId: '0022222222',
        firstName: 'رضا',
        lastName: 'کریمی',
        password: bcrypt.hashSync('demo1234', 10),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
      }
    ];

    return demoUsers;
  }

  /**
   * Generate 2-4 cards per user
   */
  static generateCards(users) {
    const cards = [];
    const bins = Object.keys(IRANIAN_BANKS);

    users.forEach((user, userIndex) => {
      const numCards = 2 + Math.floor(Math.random() * 3); // 2-4 cards
      
      for (let i = 0; i < numCards; i++) {
        const bin = bins[Math.floor(Math.random() * bins.length)];
        const cardNumber = this.generateCardNumber(bin);
        
        cards.push({
          id: uuidv4(),
          userId: user.id,
          cardNumber,
          bankName: IRANIAN_BANKS[bin].name,
          bankNameEn: IRANIAN_BANKS[bin].nameEn,
          holderName: `${user.firstName} ${user.lastName}`,
          isPrimary: i === 0,
          deleted: false,
          createdAt: new Date(Date.now() - (80 - userIndex * 10 - i * 5) * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    return cards;
  }

  /**
   * Generate valid card number with Luhn algorithm
   */
  static generateCardNumber(bin) {
    let cardNumber = bin;
    
    // Generate random 9 digits
    for (let i = 0; i < 9; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    
    // Calculate Luhn check digit
    const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
    cardNumber += checkDigit;
    
    return cardNumber;
  }

  /**
   * Calculate Luhn check digit
   */
  static calculateLuhnCheckDigit(cardNumber) {
    let sum = 0;
    let isEven = true;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return (10 - (sum % 10)) % 10;
  }

  /**
   * Generate 20-30 transactions between users
   */
  static generateTransactions(users, cards) {
    const transactions = [];
    const numTransactions = 20 + Math.floor(Math.random() * 11); // 20-30

    for (let i = 0; i < numTransactions; i++) {
      const sender = users[Math.floor(Math.random() * users.length)];
      let receiver = users[Math.floor(Math.random() * users.length)];
      
      // Ensure sender and receiver are different
      while (receiver.id === sender.id) {
        receiver = users[Math.floor(Math.random() * users.length)];
      }

      const senderCard = cards.find(c => c.userId === sender.id);
      const receiverCard = cards.find(c => c.userId === receiver.id);

      if (!senderCard || !receiverCard) continue;

      const amount = this.generateRealisticAmount();
      const description = PERSIAN_DESCRIPTIONS[Math.floor(Math.random() * PERSIAN_DESCRIPTIONS.length)];
      const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Last 60 days

      transactions.push({
        id: uuidv4(),
        senderId: sender.id,
        receiverId: receiver.id,
        senderCardNumber: senderCard.cardNumber,
        receiverCardNumber: receiverCard.cardNumber,
        amount,
        description,
        trackingCode: this.generateTrackingCode(),
        status: 'completed',
        createdAt: createdAt.toISOString(),
        completedAt: new Date(createdAt.getTime() + 3000).toISOString()
      });
    }

    return transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Generate 5-10 payment requests per user
   */
  static generatePaymentRequests(users) {
    const requests = [];

    users.forEach((user, userIndex) => {
      const numRequests = 5 + Math.floor(Math.random() * 6); // 5-10 requests

      for (let i = 0; i < numRequests; i++) {
        const amount = this.generateRealisticAmount();
        const description = PERSIAN_DESCRIPTIONS[Math.floor(Math.random() * PERSIAN_DESCRIPTIONS.length)];
        const createdAt = new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000); // Last 45 days
        const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after creation
        
        let status;
        if (expiresAt < new Date()) {
          status = 'expired';
        } else {
          const rand = Math.random();
          if (rand < 0.3) status = 'completed';
          else if (rand < 0.6) status = 'pending';
          else status = 'expired';
        }

        requests.push({
          id: uuidv4(),
          requesterId: user.id,
          requesterName: `${user.firstName} ${user.lastName}`,
          amount,
          description,
          shareCode: this.generateShareCode(),
          status,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          paidAt: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
          paidBy: status === 'completed' ? users[(userIndex + 1) % users.length].id : null
        });
      }
    });

    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Generate realistic Iranian Rial amounts
   */
  static generateRealisticAmount() {
    const amounts = [
      50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000,
      600000, 700000, 800000, 900000, 1000000, 1200000, 1500000, 2000000, 2500000,
      3000000, 3500000, 4000000, 4500000, 5000000
    ];
    return amounts[Math.floor(Math.random() * amounts.length)];
  }

  /**
   * Generate 12-digit tracking code
   */
  static generateTrackingCode() {
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  /**
   * Generate 8-character share code
   */
  static generateShareCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Get random Persian name
   */
  static getRandomPersianName() {
    const firstName = PERSIAN_NAMES.firstNames[Math.floor(Math.random() * PERSIAN_NAMES.firstNames.length)];
    const lastName = PERSIAN_NAMES.lastNames[Math.floor(Math.random() * PERSIAN_NAMES.lastNames.length)];
    return { firstName, lastName };
  }
}

module.exports = { MockDataGenerator, IRANIAN_BANKS, PERSIAN_NAMES, PERSIAN_DESCRIPTIONS };

