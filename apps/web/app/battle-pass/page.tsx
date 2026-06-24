"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Shell from "@/components/Shell";
import { playClick, playLevelUp } from "@/lib/sound";

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

interface Reward {
  level: number;
  track: "free" | "plus";
  kind: "sparks" | "xp" | "streak_freeze" | "cosmetic";
  amount: number;
  cosmetic_id: string | null;
  claimed: boolean;
}

function rewardLabel(r: Reward) {
  if (r.kind === "sparks") return `⚡ ${r.amount}`;
  if (r.kind === "xp") return `✨ ${r.amount} XP`;
  if (r.kind === "streak_freeze") return `🧊 x${r.amount}`;
  return `🎁 ${r.cosmetic_id}`;
}

export default function BattlePassPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  async function load() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      router.push("/auth");
      return;
    }
    const { data: prog } = await supabase.rpc("get_battle_pass_progress");
    if (!prog || prog.length === 0) {
      setLoading(false);
      return;
    }
    const p = prog[0] as Progress;
    setProgress(p);
    const { data: rew } = await supabase.rpc("get_battle_pass_rewards", { p_season_id: p.season_id });
    setRewards((rew ?? []) as Reward[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function claim(level: number, track: "free" | "plus") {
    setClaiming(`${level}-${track}`);
    const { error } = await supabase.rpc("claim_battle_pass_reward", { p_level: level, p_track: track });
    if (!error) playLevelUp();
    else playClick();
    setClaiming(null);
    load();
  }

  if (loading)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  if (!progress)
    return (
      <Shell>
        <p className="text-center font-heading">Aucune saison active pour le moment.</p>
      </Shell>
    );

  const levels = Array.from({ length: 20 }, (_, i) => i + 1);
  const daysLeft = Math.max(0, Math.ceil((new Date(progress.ends_on).getTime() - Date.now()) / 86400000));

  return (
    <Shell wide>
      <h1 className="font-heading text-3xl text-center mb-1">{progress.season_name}</h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center mb-6">
        {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""} · Niveau {progress.level}/20
      </p>

      <div className="bg-secondary text-white border-[3px] border-outline rounded-sticker p-5 mb-6 shadow-[0_5px_0_0_#1A1A2E]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-sm">Progression</span>
          <span className="font-mono text-[10px] opacity-80">{progress.xp_into_level}/{progress.xp_for_next_level} XP</span>
        </div>
        <div className="h-3 bg-black/30 border-2 border-outline rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress.xp_for_next_level > 0 ? Math.min(100, Math.round((progress.xp_into_level / progress.xp_for_next_level) * 100)) : 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {!progress.is_plus && (
          <button
            onClick={() => router.push("/shop")}
            className="w-full mt-4 font-heading text-xs bg-primary text-outline border-2 border-outline rounded-sticker py-2.5 shadow-[0_2px_0_0_#1A1A2E] active:translate-y-0.5 active:shadow-none transition"
          >
            ✨ Débloquer la voie Plus
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {levels.map((lvl) => {
          const free = rewards.find((r) => r.level === lvl && r.track === "free");
          const plus = rewards.find((r) => r.level === lvl && r.track === "plus");
          const reached = progress.level >= lvl;
          return (
            <div key={lvl} className="bg-surface border-2 border-outline rounded-sticker p-3 flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg border-2 border-outline flex items-center justify-center font-heading text-xs flex-shrink-0 ${
                  reached ? "bg-primary" : "bg-background opacity-50"
                }`}
              >
                {lvl}
              </div>
              {[free, plus].map((r, idx) =>
                r ? (
                  <div
                    key={idx}
                    className={`flex-1 flex items-center justify-between border-2 rounded-sticker px-3 py-2 ${
                      r.track === "plus" ? "border-secondary bg-secondary/10" : "border-outline bg-background"
                    } ${!reached ? "opacity-40" : ""}`}
                  >
                    <span className="font-body text-xs font-semibold">
                      {r.track === "plus" ? "✨ " : ""}{rewardLabel(r)}
                    </span>
                    {r.claimed ? (
                      <span className="font-heading text-[10px] text-secondary">✓</span>
                    ) : reached ? (
                      <button
                        onClick={() => claim(lvl, r.track)}
                        disabled={claiming === `${lvl}-${r.track}` || (r.track === "plus" && !progress.is_plus)}
                        className="font-heading text-[10px] bg-primary border-2 border-outline rounded-full px-2.5 py-1 disabled:opacity-40"
                      >
                        {claiming === `${lvl}-${r.track}` ? "..." : "Prendre"}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div key={idx} className="flex-1" />
                )
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
