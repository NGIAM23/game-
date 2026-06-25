"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NAV_TABS } from "@/lib/navTabs";
import Logo from "./Logo";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";
import NavIcon from "./NavIcon";

const TABS = NAV_TABS;

interface MiniProfile {
  pseudo: string | null;
  avatar_seed: string | null;
  sparks: number;
  is_admin?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
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

      <nav className="flex flex-col gap-2 flex-1 p-2.5 rounded-sticker border-2 border-outline bg-background">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex items-center gap-3 font-heading text-sm px-3.5 py-3 rounded-sticker border-2 transition-transform"
              style={{
                background: active
                  ? "linear-gradient(180deg, #FFE17D 0%, #FFD43B 55%, #E8A800 100%)"
                  : "transparent",
                color: "#1A1A2E",
                borderColor: active ? "#1A1A2E" : "transparent",
                boxShadow: active ? "0 3px 0 0 #1A1A2E, inset 0 2px 0 0 rgba(255,255,255,0.6)" : "none",
                opacity: active ? 1 : 0.75,
              }}
            >
              {active && (
                <span
                  className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-outline"
                  style={{ backgroundColor: "#6750E8" }}
                />
              )}
              <NavIcon id={tab.icon} size={20} />
              {tab.label}
            </Link>
          );
        })}
        {profile?.is_admin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 font-heading text-sm px-3.5 py-3 rounded-sticker border-2 transition-transform"
            style={
              pathname === "/admin"
                ? {
                    background: "linear-gradient(180deg, #FFE17D 0%, #FFD43B 55%, #E8A800 100%)",
                    color: "#1A1A2E",
                    borderColor: "#1A1A2E",
                    boxShadow: "0 3px 0 0 #1A1A2E, inset 0 2px 0 0 rgba(255,255,255,0.6)",
                  }
                : {
                    background: "transparent",
                    color: "#1A1A2E",
                    borderColor: "transparent",
                    opacity: 0.75,
                  }
            }
          >
            <NavIcon id="admin" size={20} />
            Stats (admin)
          </Link>
        )}
      </nav>

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
