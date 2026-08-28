-- এই ফাইলটা Supabase SQL Editor-এ paste করে Run করুন।
-- এটা companies টেবিলে নতুন কলাম যোগ করবে (আগের data মুছবে না)।

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS subscription_price NUMERIC,
    ADD COLUMN IF NOT EXISTS subscription_start_date DATE,
    ADD COLUMN IF NOT EXISTS subscription_end_date DATE,
    ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;

-- expiry অনুযায়ী দ্রুত খোঁজার জন্য index
CREATE INDEX IF NOT EXISTS idx_companies_subscription_end ON companies(subscription_end_date);
