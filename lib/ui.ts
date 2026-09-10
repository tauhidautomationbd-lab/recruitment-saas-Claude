// পুরো অ্যাপে consistent দেখানোর জন্য reusable className — যেকোনো component-এ import করে ব্যবহার করুন

export const ui = {
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-md border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50",
  btnSuccess:
    "inline-flex items-center justify-center gap-2 rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50",
  // "ফিরে যান" লিংক — আগে হালকা ধূসর লেখা ছিল, এখন একটা স্পষ্ট চিপ/বাটনের মতো দেখাবে
  backLink:
    "mb-4 inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50",
  card: "rounded-xl border border-ink-200 bg-white p-6",
  cardFlat: "rounded-lg border border-ink-200 bg-white p-4",
  input:
    "w-full rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
  label: "mb-1.5 block text-sm font-medium text-ink-700",
  pageTitle: "text-xl font-semibold text-ink-900",
  sectionTitle: "text-sm font-semibold uppercase tracking-wide text-ink-500",
  tableHeadCell: "px-4 py-3 text-left text-xs font-semibold text-ink-500",
  tableCell: "px-4 py-3 text-sm text-ink-800",
  tableRow: "border-t border-ink-100",
};

export const stageBadge: Record<string, string> = {
  applied: "bg-ink-100 text-ink-700",
  screening: "bg-brand-100 text-brand-700",
  shortlisted: "bg-accent-100 text-accent-600",
  interview: "bg-amber-100 text-amber-700",
  selected: "bg-emerald-100 text-emerald-700",
  hired: "bg-emerald-600 text-white",
  rejected: "bg-red-100 text-red-700",
  no_show: "bg-orange-100 text-orange-700",
};

export const stageLabel: Record<string, string> = {
  applied: "Applied",
  screening: "Screened",
  shortlisted: "Shortlisted",
  interview: "Interview",
  selected: "Selected",
  hired: "Hired",
  rejected: "Rejected",
  no_show: "No Show",
};

export const roleLabel: Record<string, string> = {
  company_admin: "Company Admin",
  hr_manager: "HR Manager",
  recruiter: "Recruiter",
  interviewer: "Interviewer",
};

export const roleBadge: Record<string, string> = {
  company_admin: "bg-brand-100 text-brand-700",
  hr_manager: "bg-accent-100 text-accent-600",
  recruiter: "bg-amber-100 text-amber-700",
  interviewer: "bg-ink-100 text-ink-700",
};
