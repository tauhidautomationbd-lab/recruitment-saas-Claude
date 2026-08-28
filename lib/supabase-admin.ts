// এই ফাইলটা শুধু server-side (API routes) থেকে ব্যবহার হবে।
// SUPABASE_SERVICE_ROLE_KEY কখনো browser/client-এ পাঠানো হবে না —
// শুধু server-এ থেকেই এই key দিয়ে privileged action (যেমন নতুন user বানানো) করা হয়।

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
