const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const shetabService = require('../services/shetab.service');

/**
 * User Controller - Handles user profile and card management
 */
class UserController {
  
  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.userId;
      
      const user = db.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'کاربر یافت نشد'
        });
      }
      
      // Get user's cards
      const cards = db.findCardsByUserId(userId);
      
      res.json({
        success: true,
        data: {
          id: user.id,
          phone: user.phone,
          nationalId: user.nationalId,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          cardsCount: cards.length
        }
      });
      
    } catch (error) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت اطلاعات کاربر'
      });
    }
  }
  
  /**
   * Get user cards
   */
  async getCards(req, res) {
    try {
      const userId = req.userId;
      
      const cards = db.findCardsByUserId(userId);
      
      // Format cards for response
      const formattedCards = cards.map(card => ({
        id: card.id,
        cardNumber: this.maskCardNumber(card.cardNumber),
        cardNumberFull: card.cardNumber,
        bankName: card.bankName,
        bankNameEn: card.bankNameEn,
        holderName: card.holderName,
        isPrimary: card.isPrimary,
        createdAt: card.createdAt
      }));
      
      res.json({
        success: true,
        data: formattedCards
      });
      
    } catch (error) {
      console.error('❌ Get cards error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت کارت‌ها'
      });
    }
  }
  
  /**
   * Add new card
   */
  async addCard(req, res) {
    try {
      const userId = req.userId;
      const { cardNumber, cvv2, expiry } = req.body;
      
      console.log(`💳 Adding card for user ${userId}`);
      
      // Validate card number
      if (!shetabService.validateCardNumber(cardNumber)) {
        return res.status(400).json({
          success: false,
          message: 'شماره کارت نامعتبر است'
        });
      }
      
      // Check if card already exists
      const existingCard = db.findCardByNumber(cardNumber);
      if (existingCard) {
        return res.status(400).json({
          success: false,
          message: 'این کارت قبلا اضافه شده است'
        });
      }
      
      // Verify card ownership (mock)
      const isOwner = await shetabService.verifyCardOwnership(cardNumber, cvv2, expiry);
      if (!isOwner) {
        return res.status(400).json({
          success: false,
          message: 'اطلاعات کارت صحیح نیست'
        });
      }
      
      // Get bank info
      const bank = shetabService.getBankFromCardNumber(cardNumber);
      
      // Get user info
      const user = db.findUserById(userId);
      
      // Check if this is first card
      const existingCards = db.findCardsByUserId(userId);
      const isPrimary = existingCards.length === 0;
      
      // Create card
      const card = {
        id: uuidv4(),
        userId,
        cardNumber,
        bankName: bank.name,
        bankNameEn: bank.nameEn,
        holderName: `${user.firstName} ${user.lastName}`,
        isPrimary,
        deleted: false,
        createdAt: new Date().toISOString()
      };
      
      db.createCard(card);
      
      console.log(`✅ Card added successfully: ${bank.name}`);
      
      res.status(201).json({
        success: true,
        message: 'کارت با موفقیت اضافه شد',
        data: {
          id: card.id,
          cardNumber: this.maskCardNumber(card.cardNumber),
          bankName: card.bankName,
          isPrimary: card.isPrimary
        }
      });
      
    } catch (error) {
      console.error('❌ Add card error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در افزودن کارت'
      });
    }
  }
  
  /**
   * Delete card
   */
  async deleteCard(req, res) {
    try {
      const userId = req.userId;
      const { cardId } = req.params;
      
      console.log(`🗑️  Deleting card ${cardId} for user ${userId}`);
      
      const success = db.deleteCard(cardId, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'کارت یافت نشد'
        });
      }
      
      console.log(`✅ Card deleted successfully`);
      
      res.json({
        success: true,
        message: 'کارت با موفقیت حذف شد'
      });
      
    } catch (error) {
      console.error('❌ Delete card error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در حذف کارت'
      });
    }
  }
  
  /**
   * Set primary card
   */
  async setPrimaryCard(req, res) {
    try {
      const userId = req.userId;
      const { cardId } = req.params;
      
      const cards = db.findCardsByUserId(userId);
      const targetCard = cards.find(c => c.id === cardId);
      
      if (!targetCard) {
        return res.status(404).json({
          success: false,
          message: 'کارت یافت نشد'
        });
      }
      
      // Set all cards to non-primary
      cards.forEach(card => {
        db.updateUser(card.id, { isPrimary: false });
      });
      
      // Set target card as primary
      targetCard.isPrimary = true;
      
      res.json({
        success: true,
        message: 'کارت اصلی با موفقیت تغییر کرد'
      });
      
    } catch (error) {
      console.error('❌ Set primary card error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در تنظیم کارت اصلی'
      });
    }
  }
  
  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber) {
    return `${cardNumber.substring(0, 6)}******${cardNumber.substring(12)}`;
  }
}

module.exports = new UserController();

