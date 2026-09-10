"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ui } from "@/lib/ui";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user!.id).single();

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
    <div className="mx-auto max-w-xl">
      <Link href="/hr/dashboard" className={ui.backLink}>
        ← Dashboard
      </Link>
      <h1 className={`${ui.pageTitle} mb-6`}>নতুন Job Posting তৈরি করুন</h1>

      <form onSubmit={handleSubmit} className={`${ui.card} space-y-4`}>
        <div>
          <label className={ui.label}>Job Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={ui.input} />
        </div>

        <div>
          <label className={ui.label}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={ui.input} />
        </div>

        <div>
          <label className={ui.label}>Responsibilities</label>
          <textarea
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            rows={3}
            className={ui.input}
          />
        </div>

        <div>
          <label className={ui.label}>Required Skills (কমা দিয়ে আলাদা করুন)</label>
          <input
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="যেমন: Excel, Communication, Sales"
            className={ui.input}
          />
        </div>

        <div>
          <label className={ui.label}>Education</label>
          <input value={education} onChange={(e) => setEducation(e.target.value)} className={ui.input} />
        </div>

        <div>
          <label className={ui.label}>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={ui.input} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={ui.label}>Salary (Min)</label>
            <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={ui.input} />
          </div>
          <div>
            <label className={ui.label}>Salary (Max)</label>
            <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className={ui.input} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
          {loading ? "তৈরি হচ্ছে..." : "Job Post করুন"}
        </button>
      </form>
    </div>
  );
}
