import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { extractCvText } from "@/lib/cv-parse";
import { screenCandidateWithAI } from "@/lib/openai";

export async function POST(request: NextRequest, { params }: { params: { jobId: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { data: job } = await supabase.from("jobs").select("*").eq("id", params.jobId).single();

  if (!job) {
    return NextResponse.json({ error: "Job পাওয়া যায়নি (RLS-এর কারণে অন্য company-র হতে পারে)" }, { status: 404 });
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("id, candidate_id, stage, candidates(id, cv_file_url, full_name)")
    .eq("job_id", params.jobId)
    .eq("stage", "applied");

  let processed = 0;
  const failed: { candidate: string; reason: string }[] = [];

  for (const app of applications || []) {
    const candidate = (app as any).candidates;
    if (!candidate?.cv_file_url) continue;

    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("cvs")
        .download(candidate.cv_file_url);

      if (downloadError || !fileData) {
        throw new Error(downloadError?.message || "ফাইল download ব্যর্থ");
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const text = await extractCvText(buffer, candidate.cv_file_url);

      if (!text || text.trim().length < 20) {
        throw new Error("CV থেকে টেক্সট বের করা যায়নি (স্ক্যান করা ছবি হতে পারে)");
      }

      const result = await screenCandidateWithAI(text, job);

      // একই company-তে একই email/phone দিয়ে আগে থেকে কোনো candidate আছে কিনা যাচাই
      let isDuplicateOf: string | null = null;
      if (result.email) {
        const { data: dupes } = await supabase
          .from("candidates")
          .select("id")
          .eq("company_id", job.company_id)
          .eq("email", result.email)
          .neq("id", candidate.id)
          .limit(1);
        if (dupes && dupes.length > 0) isDuplicateOf = dupes[0].id;
      }

      await supabase
        .from("candidates")
        .update({
          full_name: result.full_name || candidate.full_name,
          email: result.email,
          phone: result.phone,
          cv_raw_text: text.slice(0, 5000),
          is_duplicate_of: isDuplicateOf,
        })
        .eq("id", candidate.id);

      await supabase
        .from("applications")
        .update({
          stage: "screening",
          ai_score: result.score,
          ai_summary: result.summary,
          ai_strengths: result.strengths,
          ai_weaknesses: result.weaknesses,
          ai_missing_requirements: result.missing_requirements,
          ai_recommendation: result.recommendation,
        })
        .eq("id", app.id);

      processed++;
    } catch (e: any) {
      failed.push({ candidate: candidate.full_name || candidate.id, reason: e.message });
    }
  }

  return NextResponse.json({ processed, failed });
}
