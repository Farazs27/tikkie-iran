/**
 * Mock SMS Service - Iranian SMS Gateway Integration
 * This service simulates SMS sending via Kavenegar/Ghasedak without requiring real API keys
 */
class MockSmsService {
  
  constructor() {
    this.sentMessages = []; // Store for debugging
  }

  /**
   * Send verification code via SMS
   * @param {string} phone - Mobile number
   * @param {string} code - Verification code
   * @returns {Promise<object>}
   */
  async sendVerificationCode(phone, code) {
    console.log('\n📱 ========================================');
    console.log('📱 MOCK SMS SERVICE');
    console.log('📱 ========================================');
    console.log(`📱 To: ${phone}`);
    console.log(`📱 Code: ${code}`);
    console.log(`📱 Message: کد تایید شما: ${code}`);
    console.log('📱 ========================================\n');
    
    // Store the message
    this.sentMessages.push({
      phone,
      code,
      type: 'verification',
      timestamp: new Date().toISOString()
    });
    
    // Simulate network delay
    const delay = parseInt(process.env.MOCK_SMS_DELAY) || 5000;
    await new Promise(resolve => setTimeout(resolve, Math.min(delay, 1000))); // Max 1 second for sending
    
    console.log(`✅ MOCK: SMS sent successfully to ${phone}`);
    console.log(`⏱️  MOCK: Code will auto-verify after ${delay / 1000} seconds in demo mode\n`);
    
    return {
      success: true,
      messageId: this.generateMessageId(),
      message: 'پیامک با موفقیت ارسال شد'
    };
  }

  /**
   * Send payment notification
   * @param {string} phone - Mobile number
   * @param {object} paymentData - Payment details
   * @returns {Promise<object>}
   */
  async sendPaymentNotification(phone, paymentData) {
    const { amount, senderName, description } = paymentData;
    const amountFormatted = amount.toLocaleString('fa-IR');
    
    console.log('\n💸 ========================================');
    console.log('💸 MOCK SMS SERVICE - PAYMENT NOTIFICATION');
    console.log('💸 ========================================');
    console.log(`💸 To: ${phone}`);
    console.log(`💸 Sender: ${senderName}`);
    console.log(`💸 Amount: ${amountFormatted} ریال`);
    console.log(`💸 Description: ${description}`);
    console.log(`💸 Message: ${senderName} مبلغ ${amountFormatted} ریال به شما واریز کرد. ${description}`);
    console.log('💸 ========================================\n');
    
    this.sentMessages.push({
      phone,
      type: 'payment_notification',
      data: paymentData,
      timestamp: new Date().toISOString()
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ MOCK: Payment notification sent to ${phone}\n`);
    
    return {
      success: true,
      messageId: this.generateMessageId(),
      message: 'پیامک اطلاع‌رسانی ارسال شد'
    };
  }

  /**
   * Send payment request notification
   * @param {string} phone - Mobile number
   * @param {object} requestData - Payment request details
   * @returns {Promise<object>}
   */
  async sendPaymentRequestNotification(phone, requestData) {
    const { amount, requesterName, shareCode } = requestData;
    const amountFormatted = amount.toLocaleString('fa-IR');
    
    console.log('\n💰 ========================================');
    console.log('💰 MOCK SMS SERVICE - PAYMENT REQUEST');
    console.log('💰 ========================================');
    console.log(`💰 To: ${phone}`);
    console.log(`💰 Requester: ${requesterName}`);
    console.log(`💰 Amount: ${amountFormatted} ریال`);
    console.log(`💰 Share Code: ${shareCode}`);
    console.log(`💰 Message: ${requesterName} درخواست پرداخت ${amountFormatted} ریال دارد. کد: ${shareCode}`);
    console.log('💰 ========================================\n');
    
    this.sentMessages.push({
      phone,
      type: 'payment_request',
      data: requestData,
      timestamp: new Date().toISOString()
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ MOCK: Payment request notification sent to ${phone}\n`);
    
    return {
      success: true,
      messageId: this.generateMessageId(),
      message: 'پیامک درخواست پرداخت ارسال شد'
    };
  }

  /**
   * Send welcome SMS to new users
   * @param {string} phone - Mobile number
   * @param {string} name - User name
   * @returns {Promise<object>}
   */
  async sendWelcomeSMS(phone, name) {
    console.log('\n👋 ========================================');
    console.log('👋 MOCK SMS SERVICE - WELCOME MESSAGE');
    console.log('👋 ========================================');
    console.log(`👋 To: ${phone}`);
    console.log(`👋 Name: ${name}`);
    console.log(`👋 Message: ${name} عزیز، به تیکی ایران خوش آمدید!`);
    console.log('👋 ========================================\n');
    
    this.sentMessages.push({
      phone,
      type: 'welcome',
      name,
      timestamp: new Date().toISOString()
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ MOCK: Welcome SMS sent to ${phone}\n`);
    
    return {
      success: true,
      messageId: this.generateMessageId(),
      message: 'پیامک خوش‌آمدگویی ارسال شد'
    };
  }

  /**
   * Generate random message ID
   */
  generateMessageId() {
    return `SMS-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get sent messages (for debugging)
   */
  getSentMessages(phone = null) {
    if (phone) {
      return this.sentMessages.filter(msg => msg.phone === phone);
    }
    return this.sentMessages;
  }

  /**
   * Clear sent messages history
   */
  clearHistory() {
    console.log('🗑️  MOCK: Clearing SMS history');
    this.sentMessages = [];
  }

  /**
   * Validate Iranian phone number
   * @param {string} phone
   * @returns {boolean}
   */
  validatePhoneNumber(phone) {
    // Iranian mobile format: 09xx xxx xxxx (11 digits starting with 09)
    const isValid = /^09\d{9}$/.test(phone);
    
    if (!isValid) {
      console.log(`❌ MOCK: Invalid phone number format: ${phone}`);
    }
    
    return isValid;
  }
}

module.exports = new MockSmsService();

