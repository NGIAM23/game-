"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logo from "./Logo";

const TABS = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/tasks", label: "Tâches", icon: "🎯" },
  { href: "/rank", label: "Mon rang", icon: "🏅" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r-[3px] border-outline bg-surface px-5 py-7">
      <div className="mb-10 px-1">
        <Logo size={26} />
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 font-heading text-sm px-3.5 py-3 rounded-sticker border-2 transition ${
                active
                  ? "bg-primary border-outline shadow-[0_3px_0_0_#1A1A2E] translate-y-0"
                  : "border-transparent opacity-60 hover:opacity-100 hover:bg-background"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 font-heading text-sm px-3.5 py-3 rounded-sticker border-2 border-transparent opacity-50 hover:opacity-100 hover:bg-background transition"
      >
        <span className="text-lg">🚪</span>
        Quitter
      </button>
    </aside>
  );
}
