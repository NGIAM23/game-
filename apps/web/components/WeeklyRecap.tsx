"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@luavio/shared";

interface RecapData {
  this_week_tasks: number;
  last_week_tasks: number;
  this_week_xp: number;
  top_category: string | null;
  top_category_count: number | null;
  current_streak: number;
}

export default function WeeklyRecap() {
  const [recap, setRecap] = useState<RecapData | null>(null);

  useEffect(() => {
    supabase.rpc("get_weekly_recap").then(({ data }) => {
      const row = (data ?? [])[0] as RecapData | undefined;
      if (row) setRecap(row);
    });
  }, []);

  if (!recap || recap.this_week_tasks === 0) return null;

  const diff = recap.this_week_tasks - recap.last_week_tasks;
  const topLabel = CATEGORIES.find((c) => c.id === recap.top_category)?.label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary text-white border-[3px] border-outline rounded-sticker p-5 shadow-[0_4px_0_0_#1A1A2E] mb-6"
    >
      <h2 className="font-heading text-base mb-2">📊 Ta semaine</h2>
      <p className="font-body text-sm mb-1">
        <strong>{recap.this_week_tasks}</strong> tâches complétées
        {recap.last_week_tasks > 0 && (
          <span className="opacity-80">
            {" "}
            ({diff >= 0 ? "+" : ""}{diff} vs semaine dernière)
          </span>
        )}
      </p>
      <p className="font-body text-sm mb-1"><strong>{recap.this_week_xp}</strong> XP gagnés</p>
      {topLabel && (
        <p className="font-body text-sm mb-1">
          Catégorie favorite : <strong>{topLabel}</strong> ({recap.top_category_count})
        </p>
      )}
      <p className="font-body text-sm">Série en cours : <strong>🔥 {recap.current_streak}</strong></p>
    </motion.div>
  );
}
