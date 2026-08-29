"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function CvLink({ storagePath }: { storagePath: string }) {
  const supabase = createSupabaseBrowserClient();

  async function handleClick() {
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(storagePath, 60);

    if (error || !data?.signedUrl) {
      alert("ফাইল খুলতে সমস্যা হয়েছে: " + (error?.message || "unknown error"));
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  return (
    <button
      onClick={handleClick}
      style={{ color: "#0070f3", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", fontSize: 14 }}
    >
      CV দেখুন
    </button>
  );
}
