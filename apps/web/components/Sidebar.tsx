"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isSoundEnabled, setSoundEnabled, playClick } from "@/lib/sound";
import Logo from "./Logo";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";

const TABS = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/tasks", label: "Tâches", icon: "🎯" },
  { href: "/rank", label: "Mon rang", icon: "🏅" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
  { href: "/friends", label: "Amis", icon: "👥" },
  { href: "/shop", label: "luavio+", icon: "✨" },
];

interface MiniProfile {
  pseudo: string | null;
  avatar_seed: string | null;
  sparks: number;
  is_admin?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<MiniProfile | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      const { data } = await supabase
        .from("profiles")
        .select("pseudo, avatar_seed, sparks, is_admin")
        .eq("id", session.session.user.id)
        .single();
      if (data) setProfile(data);
    }
    load();
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r-[3px] border-outline bg-surface px-5 py-7">
      <div className="mb-8 px-1 flex items-center justify-between">
        <Logo size={26} />
        <NotificationBell />
      </div>

      {profile?.pseudo && (
        <Link
          href={`/u/${profile.pseudo}`}
          className="flex items-center gap-2.5 mb-8 bg-background border-2 border-outline rounded-sticker p-2.5"
        >
          <Avatar seed={profile.avatar_seed || profile.pseudo} size={36} />
          <div className="flex-1 overflow-hidden">
            <div className="font-body font-semibold text-xs truncate">@{profile.pseudo}</div>
            <div className="font-mono text-[10px] text-secondary font-semibold">⚡ {profile.sparks}</div>
          </div>
        </Link>
      )}

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
        {profile?.is_admin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 font-heading text-sm px-3.5 py-3 rounded-sticker border-2 transition ${
              pathname === "/admin"
                ? "bg-primary border-outline shadow-[0_3px_0_0_#1A1A2E] translate-y-0"
                : "border-transparent opacity-60 hover:opacity-100 hover:bg-background"
            }`}
          >
            <span className="text-lg">📊</span>
            Stats (admin)
          </Link>
        )}
      </nav>

      <button
        onClick={() => {
          const next = !soundOn;
          setSoundOn(next);
          setSoundEnabled(next);
          if (next) playClick();
        }}
        className="flex items-center gap-3 font-heading text-sm px-3.5 py-3 rounded-sticker border-2 border-transparent opacity-50 hover:opacity-100 hover:bg-background transition"
      >
        <span className="text-lg">{soundOn ? "🔊" : "🔇"}</span>
        {soundOn ? "Son activé" : "Son coupé"}
      </button>

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
