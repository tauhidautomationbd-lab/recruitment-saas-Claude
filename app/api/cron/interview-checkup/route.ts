import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendInterviewReminderEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

// প্রতিদিন একবার চলে (vercel.json দেখুন)। দুইটা কাজ করে:
// ১. আগামী ৪৮ ঘণ্টার মধ্যে যেসব interview আছে এবং যাদের এখনো reminder পাঠানো হয়নি — candidate-কে email/SMS পাঠায়
// ২. যেসব interview-এর সময় পার হয়ে গেছে (২ ঘণ্টার বেশি) কিন্তু এখনো "scheduled" অবস্থায় আছে —
//    সেগুলোকে স্বয়ংক্রিয়ভাবে "no_show" হিসেবে mark করে

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

  // ---------- ধাপ ১: Reminder পাঠানো ----------
  const { data: upcomingInterviews, error: upcomingError } = await admin
    .from("interviews")
    .select(
      "id, scheduled_at, location_or_link, reminder_sent_at, application_id, applications(id, job_id, candidate_id, jobs(title), candidates(full_name, email, phone))"
    )
    .eq("status", "scheduled")
    .is("reminder_sent_at", null)
    .lte("scheduled_at", in48h)
    .gte("scheduled_at", now.toISOString());

  const remindersSent: string[] = [];

  if (!upcomingError) {
    for (const interview of upcomingInterviews || []) {
      const app = (interview as any).applications;
      const candidate = app?.candidates;
      const jobTitle = app?.jobs?.title || "Job";

      if (candidate?.email) {
        await sendInterviewReminderEmail(
          candidate.email,
          candidate.full_name,
          jobTitle,
          interview.scheduled_at,
          interview.location_or_link
        );
      }

      if (candidate?.phone) {
        try {
          await sendSMS(
            candidate.phone,
            `${jobTitle} পদের জন্য আপনার interview আছে ${new Date(interview.scheduled_at).toLocaleString("bn-BD")}`
          );
        } catch (e) {
          console.log("Interview SMS পাঠানো যায়নি:", e);
        }
      }

      await admin.from("interviews").update({ reminder_sent_at: new Date().toISOString() }).eq("id", interview.id);
      remindersSent.push(candidate?.full_name || interview.id);
    }
  }

  // ---------- ধাপ ২: No-show auto-detect ----------
  const { data: pastInterviews, error: pastError } = await admin
    .from("interviews")
    .select("id, application_id")
    .eq("status", "scheduled")
    .lt("scheduled_at", twoHoursAgo);

  const markedNoShow: string[] = [];

  if (!pastError) {
    for (const interview of pastInterviews || []) {
      await admin.from("interviews").update({ status: "no_show" }).eq("id", interview.id);
      await admin.from("applications").update({ stage: "no_show" }).eq("id", interview.application_id);
      markedNoShow.push(interview.id);
    }
  }

  return NextResponse.json({ remindersSent, markedNoShow });
}
