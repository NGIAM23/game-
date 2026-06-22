"use client";

import { isSunday } from "@luavio/shared";

export default function SundayBanner({ className = "" }: { className?: string }) {
  if (!isSunday()) return null;

  return (
    <div
      className={`bg-secondary text-white border-[3px] border-outline rounded-sticker px-4 py-3 shadow-[0_4px_0_0_#1A1A2E] flex items-center gap-3 ${className}`}
    >
      <span className="text-2xl">☀️</span>
      <div className="text-xs leading-snug font-semibold">
        <strong className="font-heading text-sm block mb-0.5">COURSE DU DIMANCHE</strong>
        XP ×2 toute la journée · Top 10 du jour récompensé en ⚡ Sparks, cosmétiques et pass
      </div>
    </div>
  );
}
