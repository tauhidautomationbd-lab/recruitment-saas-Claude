// Job + candidate profile অনুযায়ী interview প্রশ্ন তৈরি করার helper

export interface InterviewQuestions {
  technical: string[];
  behavioral: string[];
  competency: string[];
}

export async function generateInterviewQuestions(context: {
  jobTitle: string;
  jobDescription: string | null;
  requiredSkills: string[] | null;
  candidateSummary: string | null;
  candidateWeaknesses: string | null;
}): Promise<InterviewQuestions> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY সেট করা নেই");
  }

  const prompt = `তুমি একজন অভিজ্ঞ interview panel-এর সদস্য। নিচের Job ও Candidate তথ্যের ভিত্তিতে interview প্রশ্ন তৈরি করো (বাংলায়)।

Job Title: ${context.jobTitle}
Job Description: ${context.jobDescription || "N/A"}
Required Skills: ${(context.requiredSkills || []).join(", ") || "N/A"}
Candidate সম্পর্কে AI-এর সারমর্ম: ${context.candidateSummary || "N/A"}
Candidate-এর সম্ভাব্য দুর্বলতা: ${context.candidateWeaknesses || "N/A"}

শুধু এই JSON structure-এ উত্তর দাও:
{
  "technical": ["প্রশ্ন ১", "প্রশ্ন ২", "প্রশ্ন ৩", "প্রশ্ন ৪"],
  "behavioral": ["প্রশ্ন ১", "প্রশ্ন ২", "প্রশ্ন ৩"],
  "competency": ["প্রশ্ন ১", "প্রশ্ন ২", "প্রশ্ন ৩"]
}

candidate-এর দুর্বলতা থাকলে সেটা যাচাই করার জন্য অন্তত একটা প্রশ্ন রাখবে।`;

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.5 },
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
