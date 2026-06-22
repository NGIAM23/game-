"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isSoundEnabled, setSoundEnabled, playClick } from "@/lib/sound";

const TABS = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/tasks", label: "Tâches", icon: "🎯" },
  { href: "/rank", label: "Rang", icon: "🏅" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
  { href: "/friends", label: "Amis", icon: "👥" },
  { href: "/shop", label: "luavio+", icon: "✨" },
  { href: "/profile", label: "Profil", icon: "🙋" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-[3px] border-outline z-10">
      <div className="flex items-center gap-5 py-2 px-4 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 font-heading text-[10px] uppercase flex-shrink-0"
              style={{ color: active ? "#6750E8" : "#9B9BAE" }}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
        <button
          onClick={() => {
            const next = !soundOn;
            setSoundOn(next);
            setSoundEnabled(next);
            if (next) playClick();
          }}
          className="flex flex-col items-center gap-0.5 font-heading text-[10px] uppercase text-outline opacity-50 flex-shrink-0"
        >
          <span className="text-lg">{soundOn ? "🔊" : "🔇"}</span>
          Son
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 font-heading text-[10px] uppercase text-outline opacity-50 flex-shrink-0"
        >
          <span className="text-lg">🚪</span>
          Quitter
        </button>
      </div>
    </nav>
  );
}
