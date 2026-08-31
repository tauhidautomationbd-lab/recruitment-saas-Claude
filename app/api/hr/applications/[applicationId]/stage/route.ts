import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

// এই route-ই "human approval layer" — AI শুধু recommend করে, কিন্তু
// shortlist/reject-এর সিদ্ধান্ত এখানে HR ইউজার নিজে দেয়।

export async function POST(request: NextRequest, { params }: { params: { applicationId: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await request.json();
  const { stage } = body as { stage: string };

  const allowedStages = ["shortlisted", "rejected", "screening", "selected"];
  if (!allowedStages.includes(stage)) {
    return NextResponse.json({ error: "অবৈধ stage" }, { status: 400 });
  }

  const { data: existingApp } = await supabase
    .from("applications")
    .select("company_id, stage, candidates(full_name)")
    .eq("id", params.applicationId)
    .single();

  const updates: Record<string, any> = { stage };

  if (stage === "shortlisted") {
    updates.hr_approved_shortlist = true;
    updates.approved_by = user.id;
  }

  // RLS নিজে থেকেই নিশ্চিত করবে যে HR ইউজার শুধু নিজের company-র application-ই আপডেট করতে পারবে
  const { error } = await supabase.from("applications").update(updates).eq("id", params.applicationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existingApp) {
    await logAudit(supabase, {
      companyId: existingApp.company_id,
      actorUserId: user.id,
      action: `application.${stage}`,
      targetType: "application",
      targetId: params.applicationId,
      metadata: {
        candidateName: (existingApp as any).candidates?.full_name,
        fromStage: existingApp.stage,
        toStage: stage,
      },
    });
  }

  return NextResponse.json({ success: true });
}
