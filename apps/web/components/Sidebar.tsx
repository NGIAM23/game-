"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NAV_TABS } from "@/lib/navTabs";
import Logo from "./Logo";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";

const TABS = NAV_TABS;

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
          href="/profile"
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
        onClick={handleLogout}
        className="flex items-center gap-3 font-heading text-sm px-3.5 py-3 rounded-sticker border-2 border-transparent opacity-50 hover:opacity-100 hover:bg-background transition"
      >
        <span className="text-lg">🚪</span>
        Quitter
      </button>

      <div className="flex items-center gap-2 px-3.5 pt-2 font-mono text-[10px] uppercase tracking-widest opacity-40">
        <Link href="/cgu" className="hover:opacity-100 transition">
          CGU
        </Link>
        <span>·</span>
        <Link href="/confidentialite" className="hover:opacity-100 transition">
          Confidentialité
        </Link>
      </div>
    </aside>
  );
}
