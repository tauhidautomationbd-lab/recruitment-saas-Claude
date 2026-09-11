import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { draftCandidateEmail, type EmailTemplateType } from "@/lib/candidate-email";

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
  const { templateType } = body as { templateType: EmailTemplateType };

  const { data: application } = await supabase
    .from("applications")
    .select("id, candidates(full_name), jobs(title, company_id, companies(name))")
    .eq("id", params.applicationId)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Application পাওয়া যায়নি" }, { status: 404 });
  }

  const { data: interview } = await supabase
    .from("interviews")
    .select("scheduled_at, location_or_link")
    .eq("application_id", params.applicationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  try {
    const draft = await draftCandidateEmail(templateType, {
      candidateName: (application as any).candidates?.full_name,
      jobTitle: (application as any).jobs?.title || "",
      companyName: (application as any).jobs?.companies?.name || "",
      interviewDate: interview?.scheduled_at
        ? new Date(interview.scheduled_at).toLocaleString("bn-BD")
        : null,
      interviewLocation: interview?.location_or_link || null,
    });

    return NextResponse.json(draft);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
