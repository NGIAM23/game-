"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { categoryColors, type CategoryId } from "@luavio/shared";
import CategoryIcon from "@/components/CategoryIcon";

interface CoachTipData {
  category: CategoryId;
  label: string;
  recent_count: number;
  suggested_task_id: string | null;
  suggested_label: string | null;
}

export default function CoachTip() {
  const router = useRouter();
  const [tip, setTip] = useState<CoachTipData | null>(null);

  useEffect(() => {
    supabase.rpc("get_coach_tip").then(({ data }) => {
      const row = (data ?? [])[0] as CoachTipData | undefined;
      if (row) setTip(row);
    });
  }, []);

  if (!tip) return null;

  return (
    <motion.button
      onClick={() => router.push("/tasks")}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center gap-3 bg-surface border-2 border-outline rounded-sticker p-4 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition mb-6 text-left"
    >
      <span
        className="w-10 h-10 rounded-lg border-2 border-outline flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: categoryColors[tip.category] }}
      >
        <CategoryIcon id={tip.category} size={22} />
      </span>
      <div className="flex-1">
        <p className="font-heading text-xs mb-0.5">🧭 Conseil du coach</p>
        <p className="font-body text-xs opacity-70">
          {tip.recent_count === 0
            ? `Tu n'as fait aucune tâche ${tip.label} depuis 2 semaines.`
            : `Tu as un peu négligé ${tip.label} ces 2 dernières semaines.`}
          {tip.suggested_label && ` Essaie : "${tip.suggested_label}"`}
        </p>
      </div>
    </motion.button>
  );
}
