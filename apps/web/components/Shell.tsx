"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { NAV_TABS } from "@/lib/navTabs";

const SWIPE_THRESHOLD = 60;

export default function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    if ((e.target as HTMLElement).closest(".overflow-x-auto")) {
      touchStart.current = null;
      return;
    }
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    const index = NAV_TABS.findIndex((tab) => tab.href === pathname);
    if (index === -1) return;
    const nextIndex = dx < 0 ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= NAV_TABS.length) return;
    router.push(NAV_TABS[nextIndex].href);
  }

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 px-6 pb-28 lg:pb-12" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`mx-auto pt-8 lg:pt-12 ${wide ? "max-w-5xl" : "max-w-xl"}`}
        >
          {children}
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
}
