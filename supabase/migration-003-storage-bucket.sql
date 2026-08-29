-- এই ফাইলটা Supabase SQL Editor-এ paste করে Run করুন।
-- এটা CV ফাইল রাখার জন্য একটা storage bucket তৈরি করে, এবং নিশ্চিত করে
-- যে একটা company শুধু নিজের ফোল্ডারেই CV upload/দেখতে পারবে।

INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Path convention: cvs/{company_id}/{job_id}/{filename}
-- (storage.foldername(name))[1] দিয়ে path-এর প্রথম অংশ (company_id) বের করা হয়

CREATE POLICY "company_upload_own_cvs" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'cvs'
    AND (
        (storage.foldername(name))[1] = my_company_id()::text
        OR is_super_admin()
    )
);

CREATE POLICY "company_read_own_cvs" ON storage.objects
FOR SELECT
USING (
    bucket_id = 'cvs'
    AND (
        (storage.foldername(name))[1] = my_company_id()::text
        OR is_super_admin()
    )
);

CREATE POLICY "company_delete_own_cvs" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'cvs'
    AND (
        (storage.foldername(name))[1] = my_company_id()::text
        OR is_super_admin()
    )
);
