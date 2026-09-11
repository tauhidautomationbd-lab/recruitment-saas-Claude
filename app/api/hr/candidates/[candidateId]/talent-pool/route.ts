import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: { candidateId: string } }) {
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

  const { data: candidate } = await supabase
    .from("candidates")
    .select("company_id, full_name, in_talent_pool")
    .eq("id", params.candidateId)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Candidate পাওয়া যায়নি" }, { status: 404 });
  }

  const newValue = !candidate.in_talent_pool;

  const { error } = await supabase
    .from("candidates")
    .update({ in_talent_pool: newValue })
    .eq("id", params.candidateId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit(supabase, {
    companyId: candidate.company_id,
    actorUserId: user.id,
    action: newValue ? "candidate.added_to_talent_pool" : "candidate.removed_from_talent_pool",
    targetType: "candidate",
    targetId: params.candidateId,
    metadata: { candidateName: candidate.full_name },
  });

  return NextResponse.json({ success: true, in_talent_pool: newValue });
}
