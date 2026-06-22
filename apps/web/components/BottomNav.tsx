"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TABS = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/rank", label: "Rang", icon: "🏅" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t-[3px] border-outline z-10">
      <div className="max-w-xl mx-auto flex items-center justify-around py-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 font-heading text-[10px] uppercase"
              style={{ color: active ? "#6750E8" : "#9B9BAE" }}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 font-heading text-[10px] uppercase text-outline opacity-50"
        >
          <span className="text-lg">🚪</span>
          Quitter
        </button>
      </div>
    </nav>
  );
}
