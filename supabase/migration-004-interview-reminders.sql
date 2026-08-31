-- এই ফাইলটা Supabase SQL Editor-এ paste করে Run করুন।

ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_status ON interviews(scheduled_at, status);
