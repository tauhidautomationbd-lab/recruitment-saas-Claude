"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseNavItems = [
  { href: "/hr/dashboard", label: "জব ও ক্যান্ডিডেট", icon: "📋", exact: true },
  { href: "/hr/dashboard/talent-pool", label: "Talent Pool", icon: "⭐" },
  { href: "/hr/dashboard/analytics", label: "অ্যানালিটিক্স", icon: "📊" },
  { href: "/hr/dashboard/audit-log", label: "অডিট লগ", icon: "🕒" },
];

export default function SidebarNav({ role }: { role?: string }) {
  const pathname = usePathname();

  const navItems =
    role === "company_admin"
      ? [...baseNavItems, { href: "/hr/dashboard/team", label: "টিম", icon: "👥" }]
      : baseNavItems;

  return (
    <nav className="flex-1 space-y-1 px-3">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              active ? "bg-brand-500 text-white" : "text-ink-300 hover:bg-ink-800 hover:text-white"
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
