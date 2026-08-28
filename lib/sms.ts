// এই ফাইলটা SMS পাঠানোর জন্য একটা "রেডি" ইন্টারফেস।
// এখনই কোনো SMS provider configure করা নেই — তাই এই ফাংশন কল হলে শুধু
// console-এ log করবে, কোনো error দেবে না, বাকি সিস্টেম স্বাভাবিকভাবে চলবে।
//
// ভবিষ্যতে SMS চালু করতে:
// ১. Vercel-এ SMS_PROVIDER env variable বসান: 'alpha_sms' অথবা 'ssl_wireless' অথবা 'elite_buzztech'
// ২. সেই provider-এর নিজস্ব API key/credential env variable হিসেবে যোগ করুন
// ৩. নিচের সংশ্লিষ্ট ব্লকে সেই provider-এর actual API call বসিয়ে দিন (আমাকে বললে আমি করে দেব)

export async function sendSMS(phone: string, message: string) {
  const provider = process.env.SMS_PROVIDER; // 'alpha_sms' | 'ssl_wireless' | 'elite_buzztech'

  if (!provider) {
    console.log(`[SMS not configured] Would send to ${phone}: ${message}`);
    return { skipped: true };
  }

  if (provider === "alpha_sms") {
    // TODO: Alpha SMS (sms.net.bd) API integration বসবে এখানে
    // প্রয়োজনীয় env: ALPHA_SMS_API_KEY, ALPHA_SMS_SENDER_ID
    // const res = await fetch("https://api.sms.net.bd/sendsms", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     api_key: process.env.ALPHA_SMS_API_KEY,
    //     senderid: process.env.ALPHA_SMS_SENDER_ID,
    //     to: phone,
    //     msg: message,
    //   }),
    // });
    throw new Error("Alpha SMS integration এখনো configure করা হয়নি — লাইব্রেরি/credential যোগ করার পর কাজ করবে");
  }

  if (provider === "ssl_wireless") {
    // TODO: SSL Wireless API integration বসবে এখানে
    // প্রয়োজনীয় env: SSL_WIRELESS_API_TOKEN, SSL_WIRELESS_SID
    throw new Error("SSL Wireless integration এখনো configure করা হয়নি");
  }

  if (provider === "elite_buzztech") {
    // TODO: Elite BuzzTech API integration বসবে এখানে
    // প্রয়োজনীয় env: ELITE_BUZZTECH_API_KEY
    throw new Error("Elite BuzzTech integration এখনো configure করা হয়নি");
  }

  throw new Error(`অজানা SMS provider: ${provider}`);
}
