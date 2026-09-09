"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/lib/ui";

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
      <button onClick={handleClick} disabled={loading} className={ui.btnPrimary}>
        {loading ? "AI Screening চলছে..." : "🤖 Run AI Screening"}
      </button>
      {message && <p className="mt-2 text-xs text-ink-600">{message}</p>}
      {failures.length > 0 && (
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-red-600">
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
