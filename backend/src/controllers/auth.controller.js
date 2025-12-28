const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const smsService = require('../services/sms.service');

/**
 * Auth Controller - Handles registration, login, and verification
 */
class AuthController {
  
  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const { phone, nationalId, firstName, lastName, password } = req.body;
      
      console.log(`📝 Registration attempt for phone: ${phone}`);
      
      // Check if user already exists
      const existingUser = db.findUserByPhone(phone);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'این شماره موبایل قبلا ثبت شده است'
        });
      }
      
      // Check if national ID is already used
      const existingNationalId = db.findUserByNationalId(nationalId);
      if (existingNationalId) {
        return res.status(400).json({
          success: false,
          message: 'این کد ملی قبلا ثبت شده است'
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = {
        id: uuidv4(),
        phone,
        nationalId,
        firstName,
        lastName,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      
      db.createUser(user);
      
      // Send welcome SMS
      await smsService.sendWelcomeSMS(phone, firstName);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      console.log(`✅ User registered successfully: ${firstName} ${lastName}`);
      
      res.status(201).json({
        success: true,
        message: 'ثبت نام با موفقیت انجام شد',
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ثبت نام. لطفا مجددا تلاش کنید'
      });
    }
  }
  
  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { phone, password } = req.body;
      
      console.log(`🔐 Login attempt for phone: ${phone}`);
      
      // Find user
      const user = db.findUserByPhone(phone);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'شماره موبایل یا رمز عبور اشتباه است'
        });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'شماره موبایل یا رمز عبور اشتباه است'
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      console.log(`✅ User logged in successfully: ${user.firstName} ${user.lastName}`);
      
      res.json({
        success: true,
        message: 'ورود موفقیت‌آمیز بود',
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ورود. لطفا مجددا تلاش کنید'
      });
    }
  }
  
  /**
   * Send verification code
   */
  async sendVerificationCode(req, res) {
    try {
      const { phone } = req.body;
      
      console.log(`📲 Sending verification code to: ${phone}`);
      
      // Generate 5-digit code
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      
      // Store verification code
      const verificationCode = {
        phone,
        code,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      
      db.createVerificationCode(verificationCode);
      
      // Send SMS
      await smsService.sendVerificationCode(phone, code);
      
      res.json({
        success: true,
        message: 'کد تایید ارسال شد',
        data: {
          expiresIn: 300 // seconds
        }
      });
      
    } catch (error) {
      console.error('❌ Send verification code error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ارسال کد تایید'
      });
    }
  }
  
  /**
   * Verify code
   */
  async verifyCode(req, res) {
    try {
      const { phone, code } = req.body;
      
      console.log(`✅ Verifying code for phone: ${phone}`);
      
      // Find verification code
      const verificationCode = db.findVerificationCode(phone, code);
      
      if (!verificationCode) {
        return res.status(400).json({
          success: false,
          message: 'کد تایید نامعتبر یا منقضی شده است'
        });
      }
      
      // Delete used code
      db.deleteVerificationCode(phone, code);
      
      console.log(`✅ Code verified successfully for: ${phone}`);
      
      res.json({
        success: true,
        message: 'کد تایید با موفقیت تایید شد'
      });
      
    } catch (error) {
      console.error('❌ Verify code error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در تایید کد'
      });
    }
  }
}

module.exports = new AuthController();

