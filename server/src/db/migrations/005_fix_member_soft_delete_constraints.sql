-- Drop the overly aggressive unique constraint
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_gym_id_phone_key;

-- Replace with partial unique index to support soft-deletes safely
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_gym_phone_member 
ON members (gym_id, phone) 
WHERE deleted_at IS NULL;
