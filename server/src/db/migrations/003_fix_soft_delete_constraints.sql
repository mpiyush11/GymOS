-- FIX: Drop standard unique constraint on leads
ALTER TABLE leads DROP CONSTRAINT unique_gym_phone_lead;

-- Add partial unique constraint that ignores soft-deleted leads
CREATE UNIQUE INDEX unique_active_gym_phone_lead ON leads (gym_id, phone) WHERE deleted_at IS NULL;
