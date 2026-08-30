// OpenAI API দিয়ে CV screen করার helper — job info + CV text দিয়ে
// structured JSON বিশ্লেষণ ফেরত দেয়।

interface JobInfo {
  title: string;
  description: string | null;
  responsibilities: string | null;
  required_skills: string[] | null;
  education: string | null;
  experience_years_min: number | null;
  experience_years_max: number | null;
}

export interface ScreeningResult {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  score: number;
  summary: string;
  strengths: string;
  weaknesses: string;
  missing_requirements: string;
  recommendation: string;
}

export async function screenCandidateWithAI(cvText: string, job: JobInfo): Promise<ScreeningResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY সেট করা নেই");
  }

  const prompt = `তুমি একজন অভিজ্ঞ HR recruitment assistant। নিচের Job এবং CV দেখে বিশ্লেষণ করে শুধু JSON ফরম্যাটে উত্তর দাও, অন্য কোনো লেখা/ব্যাখ্যা যোগ কোরো না।

Job Title: ${job.title}
Job Description: ${job.description || "N/A"}
Responsibilities: ${job.responsibilities || "N/A"}
Required Skills: ${(job.required_skills || []).join(", ") || "N/A"}
Education: ${job.education || "N/A"}
Experience Required: ${job.experience_years_min ?? "?"} - ${job.experience_years_max ?? "?"} years

CV Text:
"""
${cvText.slice(0, 8000)}
"""

ঠিক এই JSON structure-এ উত্তর দাও:
{
  "full_name": string বা null (CV থেকে candidate-এর নাম),
  "email": string বা null,
  "phone": string বা null,
  "score": 0 থেকে 100 এর মধ্যে একটা সংখ্যা (job-এর সাথে candidate কতটা মানানসই),
  "summary": দুই-তিন বাক্যের সারমর্ম (বাংলায়),
  "strengths": candidate-এর মূল শক্তির দিক (বাংলায়),
  "weaknesses": দুর্বলতা/ঘাটতি (বাংলায়),
  "missing_requirements": job-এর কোন requirement candidate-এর মধ্যে নেই (বাংলায়),
  "recommendation": "shortlist" অথবা "consider" অথবা "reject" — তারপর সংক্ষিপ্ত কারণ (বাংলায়)
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI থেকে খালি উত্তর এসেছে");
  }

  return JSON.parse(content);
}
