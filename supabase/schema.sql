-- ============================================================
-- এই পুরো ফাইলটা Supabase Dashboard > SQL Editor -এ paste করে
-- "Run" চাপলেই সব টেবিল, security rule, ইত্যাদি তৈরি হয়ে যাবে।
-- কোনো টার্মিনাল/কমান্ড লাইন লাগবে না।
-- ============================================================

-- ------------------------------------------------------------
-- 1. Companies (tenants)
-- ------------------------------------------------------------
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    industry        VARCHAR(100),
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'trial',
    subscription_status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_quota     INT DEFAULT 500,
    sms_quota       INT DEFAULT 200,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE user_role AS ENUM ('super_admin', 'company_admin', 'hr_manager', 'recruiter', 'interviewer');

-- profiles টেবিল Supabase-এর নিজস্ব auth.users টেবিলের সাথে যুক্ত (id মিলিয়ে)
-- নতুন কেউ signup করলে auth.users-এ ঢোকে, আমরা trigger দিয়ে এখানেও একটা row বানাব
CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id      UUID REFERENCES companies(id) ON DELETE CASCADE, -- super_admin এর জন্য NULL
    full_name       VARCHAR(255),
    role            user_role NOT NULL DEFAULT 'hr_manager',
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Helper functions: RLS policy-তে বারবার subquery না লিখে এগুলো ব্যবহার করব
CREATE OR REPLACE FUNCTION my_company_id() RETURNS UUID AS $$
    SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
    SELECT role = 'super_admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------
-- 2. Jobs
-- ------------------------------------------------------------
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    responsibilities TEXT,
    required_skills TEXT[],
    education       VARCHAR(255),
    experience_years_min INT,
    experience_years_max INT,
    location        VARCHAR(255),
    salary_min      NUMERIC,
    salary_max      NUMERIC,
    screening_criteria JSONB,
    status          VARCHAR(20) DEFAULT 'open',
    ingestion_mode  VARCHAR(20) DEFAULT 'both',
    created_by      UUID REFERENCES profiles(id),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. Candidates & Applications
-- ------------------------------------------------------------
CREATE TABLE candidates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name       VARCHAR(255),
    email           VARCHAR(255),
    phone           VARCHAR(50),
    cv_file_url     TEXT,
    cv_raw_text     TEXT,
    source          VARCHAR(30),
    is_duplicate_of UUID REFERENCES candidates(id),
    in_talent_pool  BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, email, phone)
);

CREATE TYPE pipeline_stage AS ENUM (
    'applied', 'screening', 'shortlisted', 'interview',
    'selected', 'rejected', 'hired', 'no_show'
);

CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    stage           pipeline_stage NOT NULL DEFAULT 'applied',
    ai_score        NUMERIC,
    ai_summary      TEXT,
    ai_strengths    TEXT,
    ai_weaknesses   TEXT,
    ai_missing_requirements TEXT,
    ai_recommendation TEXT,
    hr_approved_shortlist BOOLEAN DEFAULT false,
    approved_by     UUID REFERENCES profiles(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (job_id, candidate_id)
);

-- ------------------------------------------------------------
-- 4. Interviews
-- ------------------------------------------------------------
CREATE TABLE interviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    location_or_link TEXT,
    interviewer_id  UUID REFERENCES profiles(id),
    status          VARCHAR(20) DEFAULT 'scheduled',
    evaluation_score NUMERIC,
    evaluation_notes TEXT,
    ai_evaluation_recommendation TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 5. Communications
-- ------------------------------------------------------------
CREATE TABLE communications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    application_id  UUID REFERENCES applications(id) ON DELETE CASCADE,
    channel         VARCHAR(10) NOT NULL,
    template_type   VARCHAR(50),
    content         TEXT,
    approved_by     UUID REFERENCES profiles(id),
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 6. Audit Log
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
    actor_user_id   UUID REFERENCES profiles(id),
    action          VARCHAR(100) NOT NULL,
    target_type     VARCHAR(50),
    target_id       UUID,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW-LEVEL SECURITY — এটাই মূল নিরাপত্তা যা এক কোম্পানিকে
-- আরেক কোম্পানির data দেখা থেকে আটকায়
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles: নিজের row দেখতে পারবে, super_admin সবার দেখতে পারবে
CREATE POLICY profiles_select ON profiles FOR SELECT
    USING (id = auth.uid() OR is_super_admin());
CREATE POLICY profiles_update ON profiles FOR UPDATE
    USING (id = auth.uid() OR is_super_admin());

-- companies: super_admin সব দেখবে, company user শুধু নিজেরটা
CREATE POLICY companies_select ON companies FOR SELECT
    USING (id = my_company_id() OR is_super_admin());
CREATE POLICY companies_update ON companies FOR UPDATE
    USING (is_super_admin());

-- বাকি সব business টেবিলের জন্য একই প্যাটার্ন: company_id মিলতে হবে, নয়তো super_admin হতে হবে
CREATE POLICY jobs_all ON jobs FOR ALL
    USING (company_id = my_company_id() OR is_super_admin());

CREATE POLICY candidates_all ON candidates FOR ALL
    USING (company_id = my_company_id() OR is_super_admin());

CREATE POLICY applications_all ON applications FOR ALL
    USING (company_id = my_company_id() OR is_super_admin());

CREATE POLICY interviews_all ON interviews FOR ALL
    USING (company_id = my_company_id() OR is_super_admin());

CREATE POLICY communications_all ON communications FOR ALL
    USING (company_id = my_company_id() OR is_super_admin());

CREATE POLICY audit_logs_all ON audit_logs FOR ALL
    USING (company_id = my_company_id() OR is_super_admin());

-- ------------------------------------------------------------
-- নতুন কেউ Supabase Auth-এ signup করলে (auth.users এ row তৈরি হলে),
-- স্বয়ংক্রিয়ভাবে profiles টেবিলেও একটা matching row তৈরি হবে
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, company_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'hr_manager'),
        (NEW.raw_user_meta_data->>'company_id')::uuid
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_candidates_company ON candidates(company_id);
CREATE INDEX idx_applications_company_job ON applications(company_id, job_id);
CREATE INDEX idx_applications_stage ON applications(company_id, stage);
CREATE INDEX idx_audit_logs_company_created ON audit_logs(company_id, created_at DESC);

-- ============================================================
-- প্রথম Super Admin ম্যানুয়ালি বানানোর নিয়ম (এই ফাইল Run করার পর):
-- 1. Supabase Dashboard > Authentication > Users > Add User দিয়ে
--    নিজের ইমেইল/পাসওয়ার্ড দিয়ে একটা user বানান
-- 2. তারপর SQL Editor-এ এই কমান্ডটা চালান (আপনার ইমেইল বসিয়ে):
--
--    UPDATE profiles SET role = 'super_admin', company_id = NULL
--    WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
--
-- এটা করলে আপনি admin panel-এ super_admin হিসেবে লগইন করতে পারবেন।
-- ============================================================
