import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateInterviewQuestions } from "@/lib/interview-questions";

// প্রশ্ন তৈরি করা একটা read/prep action, pipeline পরিবর্তন করে না —
// তাই Interviewer role সহ সবাই এটা ব্যবহার করতে পারবে।

export async function POST(request: NextRequest, { params }: { params: { applicationId: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { data: application } = await supabase
    .from("applications")
    .select("ai_summary, ai_weaknesses, jobs(title, description, required_skills)")
    .eq("id", params.applicationId)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Application পাওয়া যায়নি" }, { status: 404 });
  }

  try {
    const questions = await generateInterviewQuestions({
      jobTitle: (application as any).jobs?.title || "",
      jobDescription: (application as any).jobs?.description || null,
      requiredSkills: (application as any).jobs?.required_skills || null,
      candidateSummary: application.ai_summary,
      candidateWeaknesses: application.ai_weaknesses,
    });

    return NextResponse.json(questions);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
