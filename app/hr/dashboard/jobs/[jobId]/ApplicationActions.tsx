"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ApplicationActions({ applicationId, stage }: { applicationId: string; stage: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStage(newStage: string) {
    setLoading(true);
    const res = await fetch(`/api/hr/applications/${applicationId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const result = await res.json();
      alert(result.error || "সমস্যা হয়েছে");
    }
  }

  if (stage === "screening") {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => updateStage("shortlisted")}
          disabled={loading}
          style={{ padding: "4px 10px", background: "#0a7d3c", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer" }}
        >
          Shortlist
        </button>
        <button
          onClick={() => updateStage("rejected")}
          disabled={loading}
          style={{ padding: "4px 10px", background: "#c00", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer" }}
        >
          Reject
        </button>
      </div>
    );
  }

  if (stage === "shortlisted") {
    return (
      <Link
        href={`/hr/dashboard/applications/${applicationId}/interview`}
        style={{ padding: "4px 10px", background: "#0070f3", color: "#fff", borderRadius: 4, fontSize: 12, textDecoration: "none" }}
      >
        Schedule Interview
      </Link>
    );
  }

  return null;
}
