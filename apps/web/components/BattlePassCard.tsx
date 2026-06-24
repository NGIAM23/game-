"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Progress {
  season_id: string;
  season_name: string;
  ends_on: string;
  season_xp: number;
  level: number;
  xp_into_level: number;
  xp_for_next_level: number;
  is_plus: boolean;
}

export default function BattlePassCard() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    supabase.rpc("get_battle_pass_progress").then(({ data }) => {
      if (data && data.length > 0) setProgress(data[0] as Progress);
    });
  }, []);

  if (!progress) return null;

  const pct = progress.xp_for_next_level > 0 ? Math.min(100, Math.round((progress.xp_into_level / progress.xp_for_next_level) * 100)) : 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(progress.ends_on).getTime() - Date.now()) / 86400000));

  return (
    <div className="mb-6">
      <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-2">🎖️ Battle Pass</h2>
      <motion.button
        onClick={() => router.push("/battle-pass")}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-left bg-secondary text-white border-2 border-outline rounded-sticker p-4 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-0.5 active:shadow-none transition"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-sm">{progress.season_name}</span>
          <span className="font-mono text-[10px] opacity-70">{daysLeft}j restants</span>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-heading text-xs">Niveau {progress.level}</span>
          <span className="font-mono text-[10px] opacity-80">{progress.xp_into_level}/{progress.xp_for_next_level} XP</span>
        </div>
        <div className="h-2.5 bg-black/30 border-2 border-outline rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary" animate={{ width: `${pct}%` }} transition={{ type: "spring", bounce: 0.3 }} />
        </div>
      </motion.button>
    </div>
  );
}
