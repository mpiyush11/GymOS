-- GYMOS V1 Database Schema
-- Optimized for PostgreSQL
-- Target: 50 Gyms, ~25,000 members

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GYMS
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, GRACE, RESTRICTED, DISABLED
    subscription_end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS (Staff & Admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE, -- Nullable ONLY for Platform Admin
    role VARCHAR(20) NOT NULL, -- ADMIN, OWNER, MANAGER, RECEPTION
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete to preserve audit logs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_gym_id ON users(gym_id);

-- 3. SESSIONS (DB-backed session management)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);

-- 4. MEMBERS
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    registration_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, FROZEN
    membership_end_date DATE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete to preserve payments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gym_id, phone), -- Prevent duplicate phones in the same gym
    UNIQUE(gym_id, registration_id) -- Prevent duplicate IDs in the same gym
);
CREATE INDEX idx_members_gym_id ON members(gym_id);

-- 5. LEADS
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- NEW, CONTACTED, CONVERTED, DEAD
    next_followup DATE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_leads_gym_id ON leads(gym_id);

-- 6. PAYMENTS (Financial Integrity)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id), -- NO CASCADE DELETE. Member deletion blocked if payments exist, or handled via soft-delete.
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL, -- CASH, UPI, CARD, BANK_TRANSFER
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, VOID, REFUNDED (Soft delete strategy)
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    idempotency_key UUID NOT NULL, 
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gym_id, idempotency_key) -- Scoped idempotency per tenant
);
CREATE INDEX idx_payments_gym_id ON payments(gym_id);
CREATE INDEX idx_payments_member_id ON payments(member_id);

-- 7. ATTENDANCE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id), -- NO CASCADE DELETE.
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gym_id, member_id, date) -- One check-in per member per day allowed in V1
);
CREATE INDEX idx_attendance_gym_id_date ON attendance(gym_id, date);

-- 8. AUDIT LOGS (Immutable tracking)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id), -- NO CASCADE.
    action VARCHAR(50) NOT NULL, 
    entity VARCHAR(50) NOT NULL, 
    entity_id UUID NOT NULL,
    details JSONB, 
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_gym_id ON audit_logs(gym_id);
