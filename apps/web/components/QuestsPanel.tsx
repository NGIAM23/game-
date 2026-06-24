"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { playClick, playLevelUp } from "@/lib/sound";

interface Quest {
  quest_id: string;
  scope: "weekly" | "monthly";
  label: string;
  target: number;
  reward_xp: number;
  reward_sparks: number;
  progress: number;
  claimed: boolean;
}

export default function QuestsPanel() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.rpc("get_active_quests");
    if (data) setQuests(data as Quest[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function claim(questId: string) {
    setClaiming(questId);
    const { error } = await supabase.rpc("claim_quest", { p_quest_id: questId });
    if (!error) playLevelUp();
    else playClick();
    setClaiming(null);
    load();
  }

  if (loading || quests.length === 0) return null;

  const weekly = quests.filter((q) => q.scope === "weekly");
  const monthly = quests.filter((q) => q.scope === "monthly");

  function renderQuest(q: Quest) {
    const done = q.progress >= q.target;
    const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
    return (
      <motion.div
        key={q.quest_id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border-2 border-outline rounded-sticker p-3"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-body text-xs font-semibold">{q.label}</span>
          <span className="font-mono text-[10px] opacity-60">{q.progress}/{q.target}</span>
        </div>
        <div className="h-2 bg-surface border-2 border-outline rounded-full overflow-hidden mb-2">
          <motion.div
            className={`h-full ${done ? "bg-primary" : "bg-secondary"}`}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", bounce: 0.3 }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] opacity-50">🎁 +{q.reward_xp} XP · +{q.reward_sparks} ⚡</span>
          {q.claimed ? (
            <span className="font-heading text-[10px] text-secondary">✓ Récupéré</span>
          ) : done ? (
            <button
              onClick={() => claim(q.quest_id)}
              disabled={claiming === q.quest_id}
              className="font-heading text-[10px] bg-primary border-2 border-outline rounded-sticker px-2.5 py-1 shadow-[0_2px_0_0_#1A1A2E] active:translate-y-0.5 active:shadow-none transition disabled:opacity-50"
            >
              Récupérer
            </button>
          ) : null}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
      <h2 className="font-heading text-base mb-3">🗒️ Quêtes</h2>
      {weekly.length > 0 && (
        <>
          <h3 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-2">Cette semaine</h3>
          <div className="flex flex-col gap-2 mb-4">{weekly.map(renderQuest)}</div>
        </>
      )}
      {monthly.length > 0 && (
        <>
          <h3 className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-2">Ce mois-ci</h3>
          <div className="flex flex-col gap-2">{monthly.map(renderQuest)}</div>
        </>
      )}
    </div>
  );
}
