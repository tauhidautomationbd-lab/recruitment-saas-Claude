import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("company_id, role").eq("id", user.id).single();

  if (profile?.role === "interviewer") {
    return NextResponse.json({ error: "Interviewer role-এর এই কাজের অনুমতি নেই" }, { status: 403 });
  }

  if (!profile?.company_id) {
    return NextResponse.json({ error: "Company profile পাওয়া যায়নি" }, { status: 400 });
  }

  const body = await request.json();
  const { jobId, files } = body as { jobId: string; files: { fileName: string; storagePath: string }[] };

  if (!jobId || !files || files.length === 0) {
    return NextResponse.json({ error: "jobId এবং files আবশ্যক" }, { status: 400 });
  }

  let created = 0;
  const errors: string[] = [];

  for (const file of files) {
    const tentativeName = file.fileName.replace(/\.[^/.]+$/, "");

    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .insert({
        company_id: profile.company_id,
        full_name: tentativeName,
        cv_file_url: file.storagePath,
        source: "bulk_upload",
      })
      .select()
      .single();

    if (candidateError) {
      errors.push(`${file.fileName}: ${candidateError.message}`);
      continue;
    }

    const { error: applicationError } = await supabase.from("applications").insert({
      company_id: profile.company_id,
      job_id: jobId,
      candidate_id: candidate.id,
      stage: "applied",
    });

    if (applicationError) {
      errors.push(`${file.fileName}: ${applicationError.message}`);
      continue;
    }

    created++;
  }

  if (created > 0) {
    await logAudit(supabase, {
      companyId: profile.company_id,
      actorUserId: user.id,
      action: "candidates.bulk_uploaded",
      targetType: "job",
      targetId: jobId,
      metadata: { count: created },
    });
  }

  return NextResponse.json({ created, errors });
}
