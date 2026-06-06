-- Migration to support strict Payment Voids
ALTER TABLE payments
ADD COLUMN void_reason TEXT,
ADD COLUMN voided_by UUID REFERENCES users(id),
ADD COLUMN voided_at TIMESTAMP WITH TIME ZONE;
