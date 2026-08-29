import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// এই route session-based client ব্যবহার করে (service-role না) —
// তাই RLS নিজে থেকেই company isolation enforce করে; company_id এখানে
// client থেকে trust করা হয় না, বরং caller-এর profile থেকে server-side বের করা হয়।

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

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
    // ফাইলের নাম থেকে extension বাদ দিয়ে সাময়িক নাম হিসেবে ব্যবহার —
    // AI screening ধাপে CV parse করে আসল নাম/ইমেইল বসানো হবে
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

  return NextResponse.json({ created, errors });
}
