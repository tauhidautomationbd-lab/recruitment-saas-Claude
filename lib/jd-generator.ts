// শুধু Job Title দিয়ে পুরো Job Description তৈরি করার helper (Gemini দিয়ে)

export interface GeneratedJD {
  description: string;
  responsibilities: string;
  requiredSkills: string[];
  education: string;
}

export async function generateJobDescription(jobTitle: string): Promise<GeneratedJD> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY সেট করা নেই");
  }

  const prompt = `তুমি একজন অভিজ্ঞ HR professional, বাংলাদেশের প্রেক্ষাপটে কাজ করো। "${jobTitle}" পদের জন্য একটা professional Job Description তৈরি করো।

শুধু এই JSON structure-এ উত্তর দাও, অন্য কিছু লিখো না:
{
  "description": "পদের সংক্ষিপ্ত বিবরণ (২-৩ বাক্য, বাংলায়)",
  "responsibilities": "মূল দায়িত্বগুলো (bullet-এর মতো লাইন আলাদা করে, বাংলায়)",
  "requiredSkills": ["skill1", "skill2", "skill3", "..."],
  "education": "প্রয়োজনীয় শিক্ষাগত যোগ্যতা (সংক্ষেপে, বাংলায়)"
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
