import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 40, maxWidth: 480, margin: "80px auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Recruitment SaaS Platform</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link
          href="/hr/login"
          style={{ padding: "12px 20px", background: "#111", color: "#fff", borderRadius: 8, textDecoration: "none" }}
        >
          Client HR Login
        </Link>
        <Link
          href="/admin/login"
          style={{ padding: "12px 20px", background: "#eee", color: "#111", borderRadius: 8, textDecoration: "none" }}
        >
          Super Admin Login
        </Link>
      </div>
    </main>
  );
}
