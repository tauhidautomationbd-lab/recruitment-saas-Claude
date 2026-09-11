import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateJobDescription } from "@/lib/jd-generator";

export async function POST(request: NextRequest) {
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
  const { title } = body as { title: string };

  if (!title || title.trim().length < 2) {
    return NextResponse.json({ error: "একটা valid Job Title দিন" }, { status: 400 });
  }

  try {
    const jd = await generateJobDescription(title);
    return NextResponse.json(jd);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
