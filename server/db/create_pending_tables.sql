-- Migration: Create pending_registrations and pending_logins tables
-- Purpose: Store unverified user registrations and login OTP sessions

-- Table for storing pending registrations (before email verification)
CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'citizen'
        CHECK (role IN ('citizen', 'officer', 'admin')),
    otp_code VARCHAR(6) NOT NULL,
    otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing pending login OTP sessions
CREATE TABLE IF NOT EXISTS pending_logins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_otp_expires ON pending_registrations(otp_expires_at);

CREATE INDEX IF NOT EXISTS idx_pending_logins_email ON pending_logins(email);
CREATE INDEX IF NOT EXISTS idx_pending_logins_user_id ON pending_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_logins_otp_expires ON pending_logins(otp_expires_at);

-- Success message
SELECT 'Pending tables created successfully!' as status;
