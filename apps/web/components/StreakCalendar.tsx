"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface DayCell {
  day: string;
  completed: boolean;
}

export default function StreakCalendar({ freezes }: { freezes: number }) {
  const [days, setDays] = useState<DayCell[]>([]);

  useEffect(() => {
    supabase.rpc("get_streak_calendar").then(({ data }) => {
      if (data) setDays(data as DayCell[]);
    });
  }, []);

  if (days.length === 0) return null;

  return (
    <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-base">🔥 Série</h2>
        <span className="font-mono text-[10px] opacity-60">❄️ {freezes} freeze{freezes > 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div
            key={d.day}
            title={d.day}
            className={`aspect-square rounded-md border-2 border-outline ${
              d.completed ? "bg-primary" : "bg-background"
            }`}
          />
        ))}
      </div>
      <p className="font-mono text-[10px] opacity-50 mt-2">35 derniers jours · une case = un jour avec au moins une tâche.</p>
    </div>
  );
}
