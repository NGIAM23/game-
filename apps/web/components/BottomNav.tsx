"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NAV_TABS as TABS } from "@/lib/navTabs";
import NavIcon from "./NavIcon";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-10 border-t-[3px] border-outline"
      style={{
        background: "linear-gradient(180deg, #3B2E63 0%, #2A2150 70%, #1A1A2E 100%)",
      }}
    >
      <div className="flex items-end gap-2 py-2.5 px-3 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              ref={active ? activeRef : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 font-heading text-[9px] uppercase flex-shrink-0 w-16 py-2 rounded-2xl border-2 transition-transform ${
                active ? "-translate-y-1.5 border-outline" : "border-transparent opacity-70"
              }`}
              style={{
                background: active
                  ? "linear-gradient(180deg, #FFE17D 0%, #FFD43B 55%, #E8A800 100%)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                color: active ? "#1A1A2E" : "#FFF8E7",
                boxShadow: active
                  ? "0 4px 0 0 #1A1A2E, inset 0 2px 0 0 rgba(255,255,255,0.6)"
                  : "inset 0 1px 0 0 rgba(255,255,255,0.08)",
              }}
            >
              {active && (
                <span
                  className="absolute -top-2 w-2.5 h-2.5 rounded-full border-2 border-outline"
                  style={{ backgroundColor: "#6750E8" }}
                />
              )}
              <NavIcon id={tab.icon} size={20} />
              <span className="leading-none">{tab.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-0.5 font-heading text-[9px] uppercase flex-shrink-0 w-16 py-2 rounded-2xl border-2 border-transparent opacity-60"
          style={{ color: "#FFF8E7" }}
        >
          <NavIcon id="logout" size={20} />
          <span className="leading-none">Quitter</span>
        </button>
      </div>
    </nav>
  );
}
