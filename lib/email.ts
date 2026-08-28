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
