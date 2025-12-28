/**
 * Validation middleware for request data
 */

/**
 * Validate Iranian national ID (کد ملی)
 * @param {string} nationalId - 10-digit national ID
 * @returns {boolean}
 */
const validateNationalId = (nationalId) => {
  if (!nationalId || nationalId.length !== 10) {
    return false;
  }
  
  // In demo mode, we accept any 10-digit number
  // In production, this would include check digit validation
  return /^\d{10}$/.test(nationalId);
};

/**
 * Validate Iranian phone number
 * @param {string} phone - 11-digit phone starting with 09
 * @returns {boolean}
 */
const validatePhone = (phone) => {
  return /^09\d{9}$/.test(phone);
};

/**
 * Validate card number (16 digits)
 * @param {string} cardNumber
 * @returns {boolean}
 */
const validateCardNumber = (cardNumber) => {
  return /^\d{16}$/.test(cardNumber.replace(/[\s-]/g, ''));
};

/**
 * Validate amount (positive number)
 * @param {number} amount
 * @returns {boolean}
 */
const validateAmount = (amount) => {
  return typeof amount === 'number' && amount > 0 && amount <= 100000000; // Max 100M Rials
};

/**
 * Registration validation middleware
 */
const validateRegistration = (req, res, next) => {
  const { phone, nationalId, firstName, lastName, password } = req.body;
  
  const errors = [];
  
  if (!phone || !validatePhone(phone)) {
    errors.push('شماره موبایل نامعتبر است');
  }
  
  if (!nationalId || !validateNationalId(nationalId)) {
    errors.push('کد ملی نامعتبر است');
  }
  
  if (!firstName || firstName.trim().length < 2) {
    errors.push('نام باید حداقل 2 کاراکتر باشد');
  }
  
  if (!lastName || lastName.trim().length < 2) {
    errors.push('نام خانوادگی باید حداقل 2 کاراکتر باشد');
  }
  
  if (!password || password.length < 6) {
    errors.push('رمز عبور باید حداقل 6 کاراکتر باشد');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }
  
  next();
};

/**
 * Login validation middleware
 */
const validateLogin = (req, res, next) => {
  const { phone, password } = req.body;
  
  if (!phone || !validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'شماره موبایل نامعتبر است'
    });
  }
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'رمز عبور الزامی است'
    });
  }
  
  next();
};

/**
 * Verification code validation middleware
 */
const validateVerificationCode = (req, res, next) => {
  const { phone, code } = req.body;
  
  if (!phone || !validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'شماره موبایل نامعتبر است'
    });
  }
  
  if (!code || !/^\d{5}$/.test(code)) {
    return res.status(400).json({
      success: false,
      message: 'کد تایید باید 5 رقم باشد'
    });
  }
  
  next();
};

/**
 * Card validation middleware
 */
const validateCard = (req, res, next) => {
  const { cardNumber, cvv2, expiry } = req.body;
  
  const errors = [];
  
  if (!cardNumber || !validateCardNumber(cardNumber)) {
    errors.push('شماره کارت نامعتبر است');
  }
  
  if (!cvv2 || !/^\d{3,4}$/.test(cvv2)) {
    errors.push('CVV2 نامعتبر است');
  }
  
  if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.push('تاریخ انقضا نامعتبر است (MM/YY)');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }
  
  next();
};

/**
 * Payment validation middleware
 */
const validatePayment = (req, res, next) => {
  const { receiverCardNumber, amount, description } = req.body;
  
  const errors = [];
  
  if (!receiverCardNumber || !validateCardNumber(receiverCardNumber)) {
    errors.push('شماره کارت مقصد نامعتبر است');
  }
  
  if (!validateAmount(amount)) {
    errors.push('مبلغ نامعتبر است');
  }
  
  if (!description || description.trim().length < 2) {
    errors.push('توضیحات الزامی است');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }
  
  next();
};

/**
 * Payment request validation middleware
 */
const validatePaymentRequest = (req, res, next) => {
  const { amount, description } = req.body;
  
  const errors = [];
  
  if (!validateAmount(amount)) {
    errors.push('مبلغ نامعتبر است');
  }
  
  if (!description || description.trim().length < 2) {
    errors.push('توضیحات الزامی است');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateVerificationCode,
  validateCard,
  validatePayment,
  validatePaymentRequest,
  validateNationalId,
  validatePhone,
  validateCardNumber,
  validateAmount
};

