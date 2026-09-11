// candidate-কে পাঠানোর জন্য email draft তৈরি করার helper (Gemini দিয়ে)

export type EmailTemplateType = "interview_invite" | "rejection" | "selection";

export async function draftCandidateEmail(
  templateType: EmailTemplateType,
  context: {
    candidateName: string | null;
    jobTitle: string;
    companyName: string;
    interviewDate?: string | null;
    interviewLocation?: string | null;
  }
): Promise<{ subject: string; body: string }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY সেট করা নেই");
  }

  const templateInstructions: Record<EmailTemplateType, string> = {
    interview_invite: `একটা professional interview invitation email লিখো। candidate-কে interview-এর তারিখ (${context.interviewDate}) ও স্থান/লিংক (${context.interviewLocation}) জানাতে হবে। বিনয়ী ও উৎসাহব্যঞ্জক সুরে লিখবে।`,
    rejection: `একটা বিনয়ী rejection email লিখো। candidate-কে জানাতে হবে যে এই মুহূর্তে তাকে নির্বাচন করা যায়নি, কিন্তু ভবিষ্যতে আবেদনের জন্য উৎসাহিত করতে হবে। সংক্ষিপ্ত ও মর্যাদাপূর্ণ রাখবে, নেতিবাচক details এড়িয়ে যাবে।`,
    selection: `একটা congratulatory selection/offer email লিখো। candidate-কে জানাতে হবে সে নির্বাচিত হয়েছে এবং HR শীঘ্রই পরবর্তী ধাপ (offer letter, joining) নিয়ে যোগাযোগ করবে।`,
  };

  const prompt = `তুমি একজন HR communication assistant। নিচের তথ্যের ভিত্তিতে একটা email লিখো — বাংলায়, professional কিন্তু উষ্ণ সুরে।

Candidate নাম: ${context.candidateName || "প্রার্থী"}
Job Title: ${context.jobTitle}
Company: ${context.companyName}

নির্দেশনা: ${templateInstructions[templateType]}

শুধু এই JSON structure-এ উত্তর দাও:
{
  "subject": "email-এর subject line",
  "body": "email-এর মূল অংশ (HTML paragraph ট্যাগ ব্যবহার করে, greeting ও sign-off সহ)"
}`;

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${errText}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("Gemini থেকে খালি উত্তর এসেছে");
  }

  return JSON.parse(content);
}
