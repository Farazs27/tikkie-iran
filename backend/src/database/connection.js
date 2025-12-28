const fs = require('fs');
const path = require('path');

/**
 * In-Memory Database for Demo Mode
 * Provides CRUD operations with optional persistence to JSON file
 */
class InMemoryDatabase {
  constructor() {
    this.data = {
      users: [],
      cards: [],
      transactions: [],
      paymentRequests: [],
      verificationCodes: []
    };
    
    this.dataPath = path.join(__dirname, '../../data/demo-data.json');
    this.loadData();
  }

  /**
   * Load data from JSON file if it exists
   */
  loadData() {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dataPath)) {
        const fileData = fs.readFileSync(this.dataPath, 'utf8');
        this.data = JSON.parse(fileData);
        console.log('📦 Loaded demo data from file');
      } else {
        console.log('📦 No existing demo data found, will create new');
      }
    } catch (error) {
      console.error('❌ Error loading demo data:', error.message);
    }
  }

  /**
   * Save data to JSON file for persistence
   */
  saveData() {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf8');
      console.log('💾 Saved demo data to file');
    } catch (error) {
      console.error('❌ Error saving demo data:', error.message);
    }
  }

  // ===== USERS =====
  
  createUser(user) {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByPhone(phone) {
    return this.data.users.find(u => u.phone === phone);
  }

  findUserByNationalId(nationalId) {
    return this.data.users.find(u => u.nationalId === nationalId);
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      this.saveData();
      return this.data.users[index];
    }
    return null;
  }

  // ===== CARDS =====
  
  createCard(card) {
    this.data.cards.push(card);
    this.saveData();
    return card;
  }

  findCardsByUserId(userId) {
    return this.data.cards.filter(c => c.userId === userId && !c.deleted);
  }

  findCardByNumber(cardNumber) {
    return this.data.cards.find(c => c.cardNumber === cardNumber && !c.deleted);
  }

  deleteCard(id, userId) {
    const index = this.data.cards.findIndex(c => c.id === id && c.userId === userId);
    if (index !== -1) {
      this.data.cards[index].deleted = true;
      this.saveData();
      return true;
    }
    return false;
  }

  // ===== TRANSACTIONS =====
  
  createTransaction(transaction) {
    this.data.transactions.push(transaction);
    this.saveData();
    return transaction;
  }

  findTransactionsByUserId(userId, limit = 50) {
    return this.data.transactions
      .filter(t => t.senderId === userId || t.receiverId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  findTransactionById(id) {
    return this.data.transactions.find(t => t.id === id);
  }

  // ===== PAYMENT REQUESTS =====
  
  createPaymentRequest(request) {
    this.data.paymentRequests.push(request);
    this.saveData();
    return request;
  }

  findPaymentRequestsByUserId(userId) {
    return this.data.paymentRequests
      .filter(pr => pr.requesterId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findPaymentRequestById(id) {
    return this.data.paymentRequests.find(pr => pr.id === id);
  }

  findPaymentRequestByShareCode(shareCode) {
    return this.data.paymentRequests.find(pr => pr.shareCode === shareCode);
  }

  updatePaymentRequest(id, updates) {
    const index = this.data.paymentRequests.findIndex(pr => pr.id === id);
    if (index !== -1) {
      this.data.paymentRequests[index] = { ...this.data.paymentRequests[index], ...updates };
      this.saveData();
      return this.data.paymentRequests[index];
    }
    return null;
  }

  // ===== VERIFICATION CODES =====
  
  createVerificationCode(code) {
    // Remove old codes for this phone
    this.data.verificationCodes = this.data.verificationCodes.filter(
      vc => vc.phone !== code.phone
    );
    this.data.verificationCodes.push(code);
    // Don't save verification codes to file (temporary data)
    return code;
  }

  findVerificationCode(phone, code) {
    const now = Date.now();
    return this.data.verificationCodes.find(
      vc => vc.phone === phone && vc.code === code && vc.expiresAt > now
    );
  }

  deleteVerificationCode(phone, code) {
    this.data.verificationCodes = this.data.verificationCodes.filter(
      vc => !(vc.phone === phone && vc.code === code)
    );
  }

  // ===== UTILITY =====
  
  resetData(newData) {
    this.data = newData;
    this.saveData();
  }

  getAllData() {
    return this.data;
  }
}

// Export singleton instance
module.exports = new InMemoryDatabase();

