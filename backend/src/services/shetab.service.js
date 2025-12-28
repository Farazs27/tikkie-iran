const { IRANIAN_BANKS } = require('../database/mockData');

/**
 * Mock Shetab Service - Iranian Banking Network Integration
 * This service simulates the Shetab payment gateway without requiring real API keys
 */
class MockShetabService {
  
  /**
   * Validate card number using Luhn algorithm
   * @param {string} cardNumber - 16-digit card number
   * @returns {boolean} - true if valid
   */
  validateCardNumber(cardNumber) {
    console.log(`🔒 MOCK: Validating card number ${cardNumber.substring(0, 6)}******${cardNumber.substring(12)}`);
    
    // Remove spaces and dashes
    cardNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if 16 digits
    if (!/^\d{16}$/.test(cardNumber)) {
      console.log('❌ MOCK: Invalid card format (not 16 digits)');
      return false;
    }
    
    // Validate using Luhn algorithm
    const isValid = this.luhnCheck(cardNumber);
    console.log(`${isValid ? '✅' : '❌'} MOCK: Card validation ${isValid ? 'passed' : 'failed'}`);
    
    return isValid;
  }

  /**
   * Luhn algorithm implementation
   */
  luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Get bank name from card number BIN (Bank Identification Number)
   * @param {string} cardNumber - 16-digit card number
   * @returns {object} - Bank information or null
   */
  getBankFromCardNumber(cardNumber) {
    const bin = cardNumber.substring(0, 6);
    console.log(`🏦 MOCK: Identifying bank for BIN ${bin}`);
    
    const bank = IRANIAN_BANKS[bin];
    
    if (bank) {
      console.log(`✅ MOCK: Bank identified as ${bank.name} (${bank.nameEn})`);
      return bank;
    }
    
    console.log('⚠️  MOCK: Unknown BIN, returning generic Iranian bank');
    return {
      name: 'بانک ناشناخته',
      nameEn: 'Unknown Bank'
    };
  }

  /**
   * Process payment through Shetab network
   * @param {object} paymentData - Payment details
   * @returns {Promise<object>} - Payment result
   */
  async processPayment(paymentData) {
    const { senderCard, receiverCard, amount, description } = paymentData;
    
    console.log(`💳 MOCK: Processing Shetab payment`);
    console.log(`   From: ${senderCard.substring(0, 6)}******${senderCard.substring(12)}`);
    console.log(`   To: ${receiverCard.substring(0, 6)}******${receiverCard.substring(12)}`);
    console.log(`   Amount: ${amount.toLocaleString('fa-IR')} ریال`);
    console.log(`   Description: ${description}`);
    
    // Simulate network delay
    const delay = parseInt(process.env.MOCK_PAYMENT_DELAY) || 2500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate success rate (90% success by default)
    const successRate = parseFloat(process.env.MOCK_PAYMENT_SUCCESS_RATE) || 0.9;
    const isSuccess = Math.random() < successRate;
    
    if (isSuccess) {
      const trackingCode = this.generateTrackingCode();
      console.log(`✅ MOCK: Payment successful - Tracking code: ${trackingCode}`);
      
      return {
        success: true,
        trackingCode,
        message: 'تراکنش با موفقیت انجام شد',
        timestamp: new Date().toISOString()
      };
    } else {
      console.log('❌ MOCK: Payment failed - Simulated error');
      
      const errors = [
        'موجودی حساب کافی نیست',
        'خطا در اتصال به بانک',
        'کارت مبدا غیرفعال است',
        'محدودیت تراکنش روزانه'
      ];
      
      const errorMessage = errors[Math.floor(Math.random() * errors.length)];
      
      return {
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verify card ownership (mock PIN verification)
   * @param {string} cardNumber - Card number
   * @param {string} cvv2 - CVV2 code
   * @param {string} expiry - Expiry date
   * @returns {Promise<boolean>}
   */
  async verifyCardOwnership(cardNumber, cvv2, expiry) {
    console.log(`🔐 MOCK: Verifying card ownership`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Basic validation
    if (!cvv2 || cvv2.length < 3 || cvv2.length > 4) {
      console.log('❌ MOCK: Invalid CVV2');
      return false;
    }
    
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
      console.log('❌ MOCK: Invalid expiry date format');
      return false;
    }
    
    // In demo mode, always return true for valid formats
    console.log('✅ MOCK: Card ownership verified');
    return true;
  }

  /**
   * Generate 12-digit tracking code
   */
  generateTrackingCode() {
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  /**
   * Check card balance (mock)
   * @param {string} cardNumber
   * @returns {Promise<number>}
   */
  async getCardBalance(cardNumber) {
    console.log(`💰 MOCK: Checking card balance`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return random balance between 1M to 50M Rials
    const balance = (Math.floor(Math.random() * 49) + 1) * 1000000;
    console.log(`✅ MOCK: Balance: ${balance.toLocaleString('fa-IR')} ریال`);
    
    return balance;
  }

  /**
   * Validate IBAN (mock)
   * @param {string} iban - Iranian IBAN
   * @returns {boolean}
   */
  validateIBAN(iban) {
    console.log(`🔍 MOCK: Validating IBAN`);
    
    // Iranian IBAN format: IR + 24 digits
    const isValid = /^IR\d{24}$/.test(iban);
    console.log(`${isValid ? '✅' : '❌'} MOCK: IBAN validation ${isValid ? 'passed' : 'failed'}`);
    
    return isValid;
  }
}

module.exports = new MockShetabService();

