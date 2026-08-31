"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RunScreeningButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failures, setFailures] = useState<{ candidate: string; reason: string }[]>([]);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    setFailures([]);

    const res = await fetch(`/api/hr/jobs/${jobId}/screen`, { method: "POST" });
    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(`ত্রুটি: ${result.error}`);
      return;
    }

    let msg = `${result.processed} জন candidate screen হয়েছে।`;
    if (result.failed?.length > 0) {
      msg += ` ${result.failed.length} জনের ক্ষেত্রে সমস্যা হয়েছে।`;
      setFailures(result.failed);
    }
    setMessage(msg);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{ padding: "8px 16px", background: "#0070f3", color: "#fff", borderRadius: 6, border: "none", fontSize: 14, cursor: "pointer" }}
      >
        {loading ? "AI Screening চলছে..." : "🤖 Run AI Screening"}
      </button>
      {message && <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{message}</p>}
      {failures.length > 0 && (
        <ul style={{ fontSize: 12, color: "#c00", marginTop: 4, paddingLeft: 18 }}>
          {failures.map((f, i) => (
            <li key={i}>
              {f.candidate}: {f.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
