-- Sprint 4: Add lead_source to leads table
-- Since this is greenfield and not deployed, we can technically modify initial schema,
-- but to adhere strictly to additive migrations, we create a new migration.

ALTER TABLE leads 
ADD COLUMN source VARCHAR(50) NOT NULL DEFAULT 'WALK_IN'; -- WALK_IN, REFERRAL, WHATSAPP, INSTAGRAM, OTHER

-- We must prevent duplicate active leads for the same phone in the same gym.
-- If a lead is 'CONVERTED' or 'LOST', we could theoretically allow a new lead 
-- with the same phone later, but for V1 simplicity and safety, we enforce a strict unique constraint.
-- If they come back, staff should update the existing lead.

ALTER TABLE leads 
ADD CONSTRAINT unique_gym_phone_lead UNIQUE (gym_id, phone);
