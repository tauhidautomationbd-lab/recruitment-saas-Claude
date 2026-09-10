import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", user.id).single();

  // শুধু Company Admin নতুন টিম মেম্বার যোগ করতে পারবে
  if (profile?.role !== "company_admin") {
    return NextResponse.json({ error: "শুধু Company Admin নতুন টিম মেম্বার যোগ করতে পারবে" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, fullName, role } = body as {
    email: string;
    password: string;
    fullName: string;
    role: string;
  };

  const allowedRoles = ["hr_manager", "recruiter", "interviewer", "company_admin"];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "অবৈধ role" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "email ও password আবশ্যক" }, { status: 400 });
  }

  // নতুন Auth user তৈরি করতে service-role key লাগে (privileged action) —
  // company_id client থেকে trust না করে caller-এর নিজের profile থেকে নেওয়া হচ্ছে
  const admin = createSupabaseAdminClient();

  const { data: newUser, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || "",
      role,
      company_id: profile.company_id,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit(supabase, {
    companyId: profile.company_id,
    actorUserId: user.id,
    action: "team.member_added",
    targetType: "profile",
    targetId: newUser.user.id,
    metadata: { email, role, fullName },
  });

  return NextResponse.json({ success: true });
}
