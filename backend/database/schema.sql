-- Tikkie Iran Database Schema
-- This is for reference only. The demo version uses in-memory storage.
-- For production, use this schema with PostgreSQL.

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(11) UNIQUE NOT NULL,
    national_id VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_number VARCHAR(16) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_name_en VARCHAR(100),
    holder_name VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_number)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    sender_card_number VARCHAR(16) NOT NULL,
    receiver_card_number VARCHAR(16) NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    tracking_code VARCHAR(12) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Payment requests table
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES users(id),
    requester_name VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    share_code VARCHAR(8) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    paid_at TIMESTAMP,
    paid_by UUID REFERENCES users(id)
);

-- Verification codes table (temporary storage)
CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(11) NOT NULL,
    code VARCHAR(5) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_payment_requests_requester ON payment_requests(requester_id);
CREATE INDEX idx_payment_requests_share_code ON payment_requests(share_code);
CREATE INDEX idx_verification_codes_phone ON verification_codes(phone);

