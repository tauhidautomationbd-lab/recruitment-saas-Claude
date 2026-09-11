"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TalentPoolToggle({
  candidateId,
  inPool,
}: {
  candidateId: string;
  inPool: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/hr/candidates/${candidateId}/talent-pool`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const result = await res.json();
      alert(result.error || "সমস্যা হয়েছে");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-xs font-medium ${inPool ? "text-amber-600" : "text-ink-400 hover:text-amber-600"}`}
      title={inPool ? "Talent Pool থেকে সরান" : "Talent Pool-এ যোগ করুন"}
    >
      {inPool ? "★ Pool-এ আছে" : "☆ Pool-এ যোগ করুন"}
    </button>
  );
}
