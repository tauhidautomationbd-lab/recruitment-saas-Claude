import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: { applicationId: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "Company profile পাওয়া যায়নি" }, { status: 400 });
  }

  const body = await request.json();
  const { scheduledAt, locationOrLink, interviewerId } = body as {
    scheduledAt: string;
    locationOrLink: string;
    interviewerId: string | null;
  };

  if (!scheduledAt) {
    return NextResponse.json({ error: "scheduledAt আবশ্যক" }, { status: 400 });
  }

  const { error: interviewError } = await supabase.from("interviews").insert({
    company_id: profile.company_id,
    application_id: params.applicationId,
    scheduled_at: scheduledAt,
    location_or_link: locationOrLink || null,
    interviewer_id: interviewerId || null,
  });

  if (interviewError) {
    return NextResponse.json({ error: interviewError.message }, { status: 500 });
  }

  const { error: stageError } = await supabase
    .from("applications")
    .update({ stage: "interview" })
    .eq("id", params.applicationId);

  if (stageError) {
    return NextResponse.json({ error: stageError.message }, { status: 500 });
  }

  await logAudit(supabase, {
    companyId: profile.company_id,
    actorUserId: user.id,
    action: "interview.scheduled",
    targetType: "application",
    targetId: params.applicationId,
    metadata: { scheduledAt, locationOrLink },
  });

  return NextResponse.json({ success: true });
}
