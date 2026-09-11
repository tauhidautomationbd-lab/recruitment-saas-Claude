"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ui } from "@/lib/ui";

export default function ApplicationActions({
  applicationId,
  stage,
  canManage,
}: {
  applicationId: string;
  stage: string;
  canManage: boolean;
}) {
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

  const emailLink = canManage ? (
    <Link
      href={`/hr/dashboard/applications/${applicationId}/compose-email`}
      className="text-xs font-medium text-brand-600 underline hover:text-brand-700"
    >
      ✉ Email
    </Link>
  ) : null;

  const questionsLink = (
    <Link
      href={`/hr/dashboard/applications/${applicationId}/interview-questions`}
      className="text-xs font-medium text-accent-600 underline hover:text-teal-700"
    >
      🎯 Questions
    </Link>
  );

  if (stage === "screening" && canManage) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => updateStage("shortlisted")} disabled={loading} className={ui.btnSuccess}>
          Shortlist
        </button>
        <button onClick={() => updateStage("rejected")} disabled={loading} className={ui.btnDanger}>
          Reject
        </button>
        {emailLink}
      </div>
    );
  }

  if (stage === "shortlisted") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {canManage && (
          <Link
            href={`/hr/dashboard/applications/${applicationId}/interview`}
            className="inline-flex items-center rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
          >
            Schedule Interview
          </Link>
        )}
        {questionsLink}
        {emailLink}
      </div>
    );
  }

  if (stage === "interview") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {canManage && (
          <>
            <button onClick={() => updateStage("selected")} disabled={loading} className={ui.btnSuccess}>
              Select
            </button>
            <button onClick={() => updateStage("rejected")} disabled={loading} className={ui.btnDanger}>
              Reject
            </button>
          </>
        )}
        {questionsLink}
        {emailLink}
      </div>
    );
  }

  if ((stage === "selected" || stage === "rejected") && canManage) {
    return emailLink;
  }

  if (stage === "no_show") {
    return <span className="text-xs text-orange-600">Interview miss করেছে</span>;
  }

  return <span className="text-xs text-ink-400">—</span>;
}
