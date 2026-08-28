import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  // ১. প্রথমে যাচাই করি যে যিনি call করছেন তিনি আসলেই লগইন করা super_admin কি না
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return NextResponse.json({ error: "শুধু Super Admin এই কাজ করতে পারবে" }, { status: 403 });
  }

  // ২. ফর্ম থেকে আসা data নেওয়া
  const body = await request.json();
  const { companyName, subscriptionPlan, hrFullName, hrEmail, hrPassword } = body;

  if (!companyName || !hrEmail || !hrPassword) {
    return NextResponse.json({ error: "companyName, hrEmail, hrPassword আবশ্যক" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // ৩. কোম্পানি তৈরি (RLS bypass করার জন্য service-role client ব্যবহার হচ্ছে)
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: companyName, subscription_plan: subscriptionPlan || "trial" })
    .select()
    .single();

  if (companyError) {
    return NextResponse.json({ error: `Company তৈরি ব্যর্থ: ${companyError.message}` }, { status: 500 });
  }

  // ৪. HR admin ইউজার তৈরি (Supabase Auth Admin API দিয়ে)
  const { data: newUser, error: userError } = await admin.auth.admin.createUser({
    email: hrEmail,
    password: hrPassword,
    email_confirm: true,
    user_metadata: {
      full_name: hrFullName || "",
      role: "company_admin",
      company_id: company.id,
    },
  });

  if (userError) {
    // user তৈরি ব্যর্থ হলে company-টাও মুছে দিচ্ছি, যাতে অসম্পূর্ণ data না থাকে
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json({ error: `HR user তৈরি ব্যর্থ: ${userError.message}` }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    company,
    hrUserId: newUser.user.id,
  });
}
