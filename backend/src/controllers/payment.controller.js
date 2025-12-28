const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const shetabService = require('../services/shetab.service');
const smsService = require('../services/sms.service');

/**
 * Payment Controller - Handles payments, transactions, and payment requests
 */
class PaymentController {
  
  /**
   * Get user transactions
   */
  async getTransactions(req, res) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit) || 50;
      
      const transactions = db.findTransactionsByUserId(userId, limit);
      
      // Get user info for each transaction
      const formattedTransactions = transactions.map(tx => {
        const sender = db.findUserById(tx.senderId);
        const receiver = db.findUserById(tx.receiverId);
        
        return {
          id: tx.id,
          type: tx.senderId === userId ? 'sent' : 'received',
          otherParty: tx.senderId === userId 
            ? `${receiver.firstName} ${receiver.lastName}`
            : `${sender.firstName} ${sender.lastName}`,
          amount: tx.amount,
          description: tx.description,
          trackingCode: tx.trackingCode,
          status: tx.status,
          createdAt: tx.createdAt,
          completedAt: tx.completedAt
        };
      });
      
      res.json({
        success: true,
        data: formattedTransactions
      });
      
    } catch (error) {
      console.error('❌ Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تراکنش‌ها'
      });
    }
  }
  
  /**
   * Create payment
   */
  async createPayment(req, res) {
    try {
      const userId = req.userId;
      const { senderCardId, receiverCardNumber, amount, description } = req.body;
      
      console.log(`💸 Creating payment: ${amount} Rials`);
      
      // Get sender card
      const senderCards = db.findCardsByUserId(userId);
      let senderCard;
      
      if (senderCardId) {
        senderCard = senderCards.find(c => c.id === senderCardId);
      } else {
        senderCard = senderCards.find(c => c.isPrimary) || senderCards[0];
      }
      
      if (!senderCard) {
        return res.status(400).json({
          success: false,
          message: 'کارت مبدا یافت نشد. لطفا ابتدا کارت خود را اضافه کنید'
        });
      }
      
      // Validate receiver card
      const receiverCard = db.findCardByNumber(receiverCardNumber);
      if (!receiverCard) {
        return res.status(400).json({
          success: false,
          message: 'کارت مقصد یافت نشد'
        });
      }
      
      // Check if not sending to self
      if (senderCard.userId === receiverCard.userId) {
        return res.status(400).json({
          success: false,
          message: 'امکان انتقال وجه به کارت خود وجود ندارد'
        });
      }
      
      // Process payment through Shetab
      const paymentResult = await shetabService.processPayment({
        senderCard: senderCard.cardNumber,
        receiverCard: receiverCard.cardNumber,
        amount,
        description
      });
      
      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: paymentResult.message
        });
      }
      
      // Create transaction record
      const transaction = {
        id: uuidv4(),
        senderId: userId,
        receiverId: receiverCard.userId,
        senderCardNumber: senderCard.cardNumber,
        receiverCardNumber: receiverCard.cardNumber,
        amount,
        description,
        trackingCode: paymentResult.trackingCode,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      
      db.createTransaction(transaction);
      
      // Send notification to receiver
      const sender = db.findUserById(userId);
      const receiver = db.findUserById(receiverCard.userId);
      
      await smsService.sendPaymentNotification(receiver.phone, {
        amount,
        senderName: `${sender.firstName} ${sender.lastName}`,
        description
      });
      
      console.log(`✅ Payment completed successfully: ${paymentResult.trackingCode}`);
      
      res.status(201).json({
        success: true,
        message: 'پرداخت با موفقیت انجام شد',
        data: {
          transactionId: transaction.id,
          trackingCode: paymentResult.trackingCode,
          amount,
          receiver: `${receiver.firstName} ${receiver.lastName}`,
          timestamp: transaction.completedAt
        }
      });
      
    } catch (error) {
      console.error('❌ Create payment error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در انجام پرداخت'
      });
    }
  }
  
  /**
   * Get payment requests
   */
  async getPaymentRequests(req, res) {
    try {
      const userId = req.userId;
      
      const requests = db.findPaymentRequestsByUserId(userId);
      
      const formattedRequests = requests.map(req => ({
        id: req.id,
        amount: req.amount,
        description: req.description,
        shareCode: req.shareCode,
        status: req.status,
        createdAt: req.createdAt,
        expiresAt: req.expiresAt,
        paidAt: req.paidAt,
        paidBy: req.paidBy ? this.getUserName(req.paidBy) : null
      }));
      
      res.json({
        success: true,
        data: formattedRequests
      });
      
    } catch (error) {
      console.error('❌ Get payment requests error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت درخواست‌های پرداخت'
      });
    }
  }
  
  /**
   * Create payment request
   */
  async createPaymentRequest(req, res) {
    try {
      const userId = req.userId;
      const { amount, description, expiryDays } = req.body;
      
      console.log(`📝 Creating payment request: ${amount} Rials`);
      
      const user = db.findUserById(userId);
      
      // Generate share code
      const shareCode = this.generateShareCode();
      
      // Calculate expiry date
      const days = expiryDays || 7;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      
      // Create payment request
      const request = {
        id: uuidv4(),
        requesterId: userId,
        requesterName: `${user.firstName} ${user.lastName}`,
        amount,
        description,
        shareCode,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        paidAt: null,
        paidBy: null
      };
      
      db.createPaymentRequest(request);
      
      console.log(`✅ Payment request created: ${shareCode}`);
      
      res.status(201).json({
        success: true,
        message: 'درخواست پرداخت ایجاد شد',
        data: {
          id: request.id,
          shareCode: request.shareCode,
          amount: request.amount,
          description: request.description,
          expiresAt: request.expiresAt,
          shareLink: `tikkie://request/${request.shareCode}`
        }
      });
      
    } catch (error) {
      console.error('❌ Create payment request error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ایجاد درخواست پرداخت'
      });
    }
  }
  
  /**
   * Get payment request by share code
   */
  async getPaymentRequestByCode(req, res) {
    try {
      const { shareCode } = req.params;
      
      const request = db.findPaymentRequestByShareCode(shareCode);
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'درخواست پرداخت یافت نشد'
        });
      }
      
      // Check if expired
      if (new Date(request.expiresAt) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'این درخواست منقضی شده است'
        });
      }
      
      // Check if already paid
      if (request.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'این درخواست قبلا پرداخت شده است'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: request.id,
          requesterName: request.requesterName,
          amount: request.amount,
          description: request.description,
          createdAt: request.createdAt,
          expiresAt: request.expiresAt
        }
      });
      
    } catch (error) {
      console.error('❌ Get payment request by code error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت درخواست پرداخت'
      });
    }
  }
  
  /**
   * Pay payment request
   */
  async payPaymentRequest(req, res) {
    try {
      const userId = req.userId;
      const { requestId, senderCardId } = req.body;
      
      console.log(`💰 Paying payment request: ${requestId}`);
      
      const request = db.findPaymentRequestById(requestId);
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'درخواست پرداخت یافت نشد'
        });
      }
      
      // Validate request
      if (request.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'این درخواست قبلا پرداخت شده است'
        });
      }
      
      if (new Date(request.expiresAt) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'این درخواست منقضی شده است'
        });
      }
      
      if (request.requesterId === userId) {
        return res.status(400).json({
          success: false,
          message: 'شما نمی‌توانید درخواست خود را پرداخت کنید'
        });
      }
      
      // Get requester's primary card
      const requesterCards = db.findCardsByUserId(request.requesterId);
      const requesterCard = requesterCards.find(c => c.isPrimary) || requesterCards[0];
      
      if (!requesterCard) {
        return res.status(400).json({
          success: false,
          message: 'کارت گیرنده یافت نشد'
        });
      }
      
      // Get payer card
      const payerCards = db.findCardsByUserId(userId);
      let payerCard;
      
      if (senderCardId) {
        payerCard = payerCards.find(c => c.id === senderCardId);
      } else {
        payerCard = payerCards.find(c => c.isPrimary) || payerCards[0];
      }
      
      if (!payerCard) {
        return res.status(400).json({
          success: false,
          message: 'کارت شما یافت نشد. لطفا ابتدا کارت خود را اضافه کنید'
        });
      }
      
      // Process payment
      const paymentResult = await shetabService.processPayment({
        senderCard: payerCard.cardNumber,
        receiverCard: requesterCard.cardNumber,
        amount: request.amount,
        description: request.description
      });
      
      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: paymentResult.message
        });
      }
      
      // Create transaction
      const transaction = {
        id: uuidv4(),
        senderId: userId,
        receiverId: request.requesterId,
        senderCardNumber: payerCard.cardNumber,
        receiverCardNumber: requesterCard.cardNumber,
        amount: request.amount,
        description: request.description,
        trackingCode: paymentResult.trackingCode,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      
      db.createTransaction(transaction);
      
      // Update payment request
      db.updatePaymentRequest(requestId, {
        status: 'completed',
        paidAt: new Date().toISOString(),
        paidBy: userId
      });
      
      // Send notification
      const payer = db.findUserById(userId);
      const requester = db.findUserById(request.requesterId);
      
      await smsService.sendPaymentNotification(requester.phone, {
        amount: request.amount,
        senderName: `${payer.firstName} ${payer.lastName}`,
        description: request.description
      });
      
      console.log(`✅ Payment request paid successfully: ${paymentResult.trackingCode}`);
      
      res.json({
        success: true,
        message: 'پرداخت با موفقیت انجام شد',
        data: {
          transactionId: transaction.id,
          trackingCode: paymentResult.trackingCode,
          amount: request.amount,
          receiver: request.requesterName
        }
      });
      
    } catch (error) {
      console.error('❌ Pay payment request error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در پرداخت درخواست'
      });
    }
  }
  
  /**
   * Generate 8-character share code
   */
  generateShareCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
  
  /**
   * Get user full name
   */
  getUserName(userId) {
    const user = db.findUserById(userId);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  }
}

module.exports = new PaymentController();

