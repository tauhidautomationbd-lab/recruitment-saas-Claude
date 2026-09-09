import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500 text-lg font-bold text-white">
            R
          </div>
          <h1 className="text-lg font-semibold text-white">Recruitment Platform</h1>
          <p className="mt-1 text-sm text-ink-300">AI-assisted hiring for growing teams</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/hr/login"
            className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900 px-5 py-4 text-white transition-colors hover:border-brand-500"
          >
            <span>
              <span className="block text-sm font-medium">Client HR Login</span>
              <span className="block text-xs text-ink-300">Manage jobs, candidates, interviews</span>
            </span>
            <span aria-hidden>›</span>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center justify-between rounded-lg border border-ink-800 bg-transparent px-5 py-4 text-ink-300 transition-colors hover:border-ink-600 hover:text-white"
          >
            <span>
              <span className="block text-sm font-medium">Super Admin Login</span>
              <span className="block text-xs text-ink-500">Platform operator access</span>
            </span>
            <span aria-hidden>›</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
