import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendReminderEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: expiredCompanies, error } = await admin
    .from("companies")
    .select("id, name, contact_email, contact_phone, subscription_end_date, last_reminder_sent_at")
    .lte("subscription_end_date", today)
    .not("subscription_end_date", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const remindersSent: string[] = [];
  const remindersFailed: { name: string; reason: string }[] = [];

  for (const company of expiredCompanies || []) {
    const alreadySentToday = company.last_reminder_sent_at?.slice(0, 10) === today;
    if (alreadySentToday) continue;

    const message = `${company.name}, আপনার Recruitment Platform সাবস্ক্রিপশনের মেয়াদ ${company.subscription_end_date} তারিখে শেষ হয়েছে। সেবা চালু রাখতে renew করুন।`;

    let emailOk = true;
    let emailErrorReason = "";

    if (company.contact_email) {
      const result = await sendReminderEmail(company.contact_email, company.name, company.subscription_end_date);
      if (result.error) {
        emailOk = false;
        emailErrorReason = String(result.error);
      }
    }

    if (company.contact_phone) {
      try {
        await sendSMS(company.contact_phone, message);
      } catch (e) {
        console.log(`SMS পাঠানো যায়নি (${company.name}):`, e);
      }
    }

    // শুধু email সফল হলেই (বা contact_email না থাকলে) last_reminder_sent_at আপডেট করছি —
    // ব্যর্থ হলে পরের বার আবার চেষ্টা করবে, silently "sent" mark হবে না
    if (emailOk) {
      await admin
        .from("companies")
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq("id", company.id);
      remindersSent.push(company.name);
    } else {
      remindersFailed.push({ name: company.name, reason: emailErrorReason });
    }
  }

  return NextResponse.json({ remindersSent, remindersFailed });
}
