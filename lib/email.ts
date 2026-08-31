// এই ফাইলটা Resend (resend.com) দিয়ে email পাঠায়। ফ্রি ৩০০০ email/মাস পর্যন্ত সাপোর্ট করে।
// RESEND_API_KEY env variable সেট না থাকলে email পাঠানো skip হয়ে শুধু log হবে —
// তাই এখনই সেট না করলেও বাকি সব কোড error ছাড়াই চলবে।

export async function sendReminderEmail(to: string, companyName: string, endDate: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email not configured] Would send reminder to ${to} for ${companyName}`);
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.REMINDER_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: `${companyName} — আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে`,
      html: `
        <p>প্রিয় ${companyName} টিম,</p>
        <p>আপনার Recruitment Platform সাবস্ক্রিপশনের মেয়াদ <b>${endDate}</b> তারিখে শেষ হয়ে গেছে।</p>
        <p>সেবা নিরবচ্ছিন্ন রাখতে অনুগ্রহ করে দ্রুত renew করুন। কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।</p>
      `,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Resend email পাঠানো ব্যর্থ:", errText);
    return { skipped: false, error: errText };
  }

  return { skipped: false, error: null };
}

export async function sendInterviewReminderEmail(
  to: string,
  candidateName: string,
  jobTitle: string,
  scheduledAt: string,
  locationOrLink: string | null
) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email not configured] Would send interview reminder to ${to}`);
    return { skipped: true, error: null };
  }

  const dt = new Date(scheduledAt);
  const dateStr = dt.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = dt.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.REMINDER_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: `Interview Reminder — ${jobTitle}`,
      html: `
        <p>প্রিয় ${candidateName || "প্রার্থী"},</p>
        <p>আপনার <b>${jobTitle}</b> পদের জন্য interview নির্ধারিত আছে:</p>
        <p><b>তারিখ:</b> ${dateStr}<br/><b>সময়:</b> ${timeStr}</p>
        ${locationOrLink ? `<p><b>স্থান/লিংক:</b> ${locationOrLink}</p>` : ""}
        <p>নির্ধারিত সময়ে উপস্থিত থাকার জন্য অনুরোধ করা হলো। ধন্যবাদ।</p>
      `,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Interview reminder email পাঠানো ব্যর্থ:", errText);
    return { skipped: false, error: errText };
  }

  return { skipped: false, error: null };
}
