"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ui } from "@/lib/ui";

type PooledCandidate = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  cv_file_url: string | null;
  source: string | null;
  created_at: string;
};

export default function TalentPoolPage() {
  const supabase = createSupabaseBrowserClient();
  const [candidates, setCandidates] = useState<PooledCandidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(query: string) {
    setLoading(true);
    let q = supabase
      .from("candidates")
      .select("id, full_name, email, phone, cv_file_url, source, created_at")
      .eq("in_talent_pool", true)
      .order("created_at", { ascending: false });

    if (query.trim()) {
      q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,cv_raw_text.ilike.%${query}%`);
    }

    const { data } = await q;
    setCandidates(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load("");
  }, []);

  async function handleViewCv(storagePath: string) {
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(storagePath, 60);
    if (error || !data?.signedUrl) {
      alert("ফাইল খুলতে সমস্যা হয়েছে");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  return (
    <div>
      <h1 className={ui.pageTitle}>Talent Pool</h1>
      <p className="mt-1 text-sm text-ink-500">ভবিষ্যতের job-এর জন্য রাখা candidate-দের database</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, ইমেইল, অথবা CV-এর keyword দিয়ে খুঁজুন..."
          className={ui.input}
        />
        <button type="submit" className={ui.btnSecondary}>
          খুঁজুন
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-ink-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-ink-50">
              <th className={ui.tableHeadCell}>নাম</th>
              <th className={ui.tableHeadCell}>যোগাযোগ</th>
              <th className={ui.tableHeadCell}>Source</th>
              <th className={ui.tableHeadCell}>CV</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className={ui.tableRow}>
                <td className={`${ui.tableCell} font-medium text-ink-900`}>{c.full_name || "নাম নেই"}</td>
                <td className={`${ui.tableCell} text-xs`}>
                  {c.email && <div>{c.email}</div>}
                  {c.phone && <div className="text-ink-500">{c.phone}</div>}
                </td>
                <td className={ui.tableCell}>{c.source}</td>
                <td className={ui.tableCell}>
                  {c.cv_file_url ? (
                    <button
                      onClick={() => handleViewCv(c.cv_file_url!)}
                      className="text-xs font-medium text-brand-600 underline"
                    >
                      CV দেখুন
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!loading && candidates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-500">
                  Talent Pool-এ এখনো কোনো candidate নেই।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
