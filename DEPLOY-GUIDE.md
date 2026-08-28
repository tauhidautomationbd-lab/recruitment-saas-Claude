# Deploy করার ধাপে ধাপে গাইড (কোনো coding জ্ঞান লাগবে না)

এই গাইডটা অনুসরণ করলে আপনার Super Admin login এবং Client HR login কাজ করা একটা live website পাবেন। প্রতিটা ধাপ শুধু ক্লিক করে করে করা যায়।

## ধাপ ১: Supabase Account বানান (Database + Login সিস্টেম)
1. https://supabase.com এ যান, "Start your project" ক্লিক করুন, GitHub/Google দিয়ে sign up করুন (ফ্রি)।
2. "New Project" ক্লিক করুন। নাম দিন (যেমন `recruitment-saas`), একটা database password সেট করুন (এটা মনে রাখুন), region হিসেবে Singapore বেছে নিন (Bangladesh-এর কাছে)।
3. প্রজেক্ট তৈরি হতে ১-২ মিনিট লাগবে।

## ধাপ ২: Database Schema বসান
1. বাম পাশের মেনু থেকে **SQL Editor** ক্লিক করুন।
2. **New Query** ক্লিক করুন।
3. এই প্রজেক্টের `supabase/schema.sql` ফাইলের পুরো লেখা কপি করে এখানে paste করুন।
4. **Run** বাটনে ক্লিক করুন। "Success" দেখালে সব টেবিল তৈরি হয়ে গেছে।

## ধাপ ৩: আপনার API Keys সংগ্রহ করুন
1. বাম মেনুতে **Project Settings > API** এ যান।
2. দুইটা জিনিস কপি করে রাখুন: **Project URL** এবং **anon public key**।

## ধাপ ৪: কোড GitHub-এ আপলোড করুন (কোনো command line লাগবে না)
1. https://github.com এ ফ্রি account বানান।
2. **New Repository** ক্লিক করুন, নাম দিন `recruitment-saas`, Create করুন।
3. এই প্রজেক্টের সব ফাইল/ফোল্ডার (zip টা extract করে) সেই repository পেজে **"uploading an existing file"** লিংক থেকে drag & drop করে আপলোড করুন। Commit করুন।

## ধাপ ৫: Vercel দিয়ে Deploy করুন
1. https://vercel.com এ যান, GitHub দিয়ে sign up করুন (ফ্রি)।
2. **Add New > Project** ক্লিক করুন, আপনার `recruitment-saas` GitHub repo সিলেক্ট করুন, **Import** ক্লিক করুন।
3. Deploy করার আগে **Environment Variables** সেকশনে গিয়ে যোগ করুন:
   - `NEXT_PUBLIC_SUPABASE_URL` = (ধাপ ৩-এর Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (ধাপ ৩-এর anon public key)
4. **Deploy** ক্লিক করুন। ২-৩ মিনিট পর একটা লিংক পাবেন (যেমন `recruitment-saas.vercel.app`) — এটাই আপনার live website।

## ধাপ ৬: নিজেকে Super Admin বানান
1. Supabase Dashboard > **Authentication > Users > Add User** — নিজের ইমেইল/পাসওয়ার্ড দিয়ে একটা user বানান।
2. Supabase **SQL Editor**-এ গিয়ে এই কমান্ডটা চালান (নিজের ইমেইল বসিয়ে):
   ```sql
   UPDATE profiles SET role = 'super_admin', company_id = NULL
   WHERE id = (SELECT id FROM auth.users WHERE email = 'আপনার-ইমেইল@example.com');
   ```
3. এখন আপনার website লিংকে গিয়ে `/admin/login` পেজে সেই ইমেইল/পাসওয়ার্ড দিয়ে লগইন করুন।

## ধাপ ৭: একটা টেস্ট ক্লায়েন্ট কোম্পানি ও HR ইউজার বানান
1. Supabase SQL Editor-এ:
   ```sql
   INSERT INTO companies (name) VALUES ('Test Company Ltd') RETURNING id;
   -- উপরের কমান্ড থেকে যে id পাবেন সেটা পরের ধাপে লাগবে
   ```
2. Authentication > Users > Add User দিয়ে একটা HR ইউজার বানান (আলাদা ইমেইল)।
3. SQL Editor-এ:
   ```sql
   UPDATE profiles SET role = 'company_admin', company_id = 'উপরের-company-id'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'hr-user-email@example.com');
   ```
4. এখন `/hr/login` পেজে সেই HR ইউজার দিয়ে লগইন করলে শুধু "Test Company Ltd"-এর dashboard দেখাবে।

---

এই ৭ ধাপ শেষ হলে আপনার কাছে থাকবে:
- একটা live website, দুইটা আলাদা লগইন (Super Admin, Client HR)
- Database-level security (RLS) — এক কোম্পানি আরেক কোম্পানির data দেখতে পারবে না
- পরবর্তী ধাপে (Phase 2) আমরা এতে Job posting তৈরি, Bulk CV upload, এবং AI screening যোগ করব

কোনো ধাপে আটকালে আমাকে জানান — screenshot বা error message পাঠালেও চলবে, আমি ঠিক করে দেব।
