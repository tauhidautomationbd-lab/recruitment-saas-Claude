"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function NewJobPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user!.id)
      .single();

    if (!profile?.company_id) {
      setError("আপনার company profile পাওয়া যায়নি।");
      setLoading(false);
      return;
    }

    const { data: job, error: insertError } = await supabase
      .from("jobs")
      .insert({
        company_id: profile.company_id,
        title,
        description,
        responsibilities,
        required_skills: requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        education,
        location,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        created_by: user!.id,
      })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/hr/dashboard/jobs/${job.id}`);
  }

  return (
    <main style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>নতুন Job Posting তৈরি করুন</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Job Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={inputStyle} />
        </label>

        <label>
          Responsibilities
          <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={3} style={inputStyle} />
        </label>

        <label>
          Required Skills (কমা দিয়ে আলাদা করুন)
          <input
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="যেমন: Excel, Communication, Sales"
            style={inputStyle}
          />
        </label>

        <label>
          Education
          <input value={education} onChange={(e) => setEducation(e.target.value)} style={inputStyle} />
        </label>

        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ flex: 1 }}>
            Salary (Min)
            <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ flex: 1 }}>
            Salary (Max)
            <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} style={inputStyle} />
          </label>
        </div>

        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 12, borderRadius: 6, background: "#111", color: "#fff", border: "none", marginTop: 8 }}
        >
          {loading ? "তৈরি হচ্ছে..." : "Job Post করুন"}
        </button>
      </form>
    </main>
  );
}
