import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendCandidateEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

// এই route-ই "human approval layer" — email content আগে HR দেখে/edit করে,
// তারপর এখানে পাঠানো হয়। কোনো bulk email approval ছাড়া যাবে না।

export async function POST(request: NextRequest, { params }: { params: { applicationId: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "interviewer") {
    return NextResponse.json({ error: "Interviewer role-এর এই কাজের অনুমতি নেই" }, { status: 403 });
  }

  const body = await request.json();
  const { subject, htmlBody, templateType } = body as {
    subject: string;
    htmlBody: string;
    templateType: string;
  };

  if (!subject || !htmlBody) {
    return NextResponse.json({ error: "subject ও htmlBody আবশ্যক" }, { status: 400 });
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id, company_id, candidates(full_name, email)")
    .eq("id", params.applicationId)
    .single();

  const candidateEmail = (application as any)?.candidates?.email;

  if (!application || !candidateEmail) {
    return NextResponse.json({ error: "Candidate-এর ইমেইল পাওয়া যায়নি" }, { status: 400 });
  }

  const result = await sendCandidateEmail(candidateEmail, subject, htmlBody);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  await supabase.from("communications").insert({
    company_id: application.company_id,
    application_id: params.applicationId,
    channel: "email",
    template_type: templateType,
    content: htmlBody,
    approved_by: user.id,
    sent_at: new Date().toISOString(),
  });

  await logAudit(supabase, {
    companyId: application.company_id,
    actorUserId: user.id,
    action: "communication.email_sent",
    targetType: "application",
    targetId: params.applicationId,
    metadata: { templateType, candidateName: (application as any).candidates?.full_name },
  });

  return NextResponse.json({ success: true, skipped: result.skipped });
}
