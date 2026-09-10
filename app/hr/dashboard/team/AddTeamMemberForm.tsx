"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui, roleLabel } from "@/lib/ui";

export default function AddTeamMemberForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recruiter");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/hr/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, role }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "সমস্যা হয়েছে");
      return;
    }

    setFullName("");
    setEmail("");
    setPassword("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={ui.btnPrimary}>
        + নতুন টিম মেম্বার
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${ui.card} space-y-4`}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={ui.label}>নাম</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={ui.input} />
        </div>
        <div>
          <label className={ui.label}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={ui.input}>
            <option value="hr_manager">{roleLabel.hr_manager}</option>
            <option value="recruiter">{roleLabel.recruiter}</option>
            <option value="interviewer">{roleLabel.interviewer}</option>
            <option value="company_admin">{roleLabel.company_admin}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={ui.label}>ইমেইল</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={ui.input} />
      </div>

      <div>
        <label className={ui.label}>সাময়িক পাসওয়ার্ড</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className={ui.input}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className={ui.btnPrimary}>
          {loading ? "যোগ হচ্ছে..." : "যোগ করুন"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={ui.btnSecondary}>
          বাতিল
        </button>
      </div>
    </form>
  );
}
