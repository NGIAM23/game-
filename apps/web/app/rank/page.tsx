"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  levelFromTotalXp,
  rankFromLevel,
  RANK_TIERS,
  tierForLevel,
  subTierForLevel,
  TIER_COLORS,
  TIER_ABBR,
} from "@luavio/shared";
import Shell from "@/components/Shell";

interface Profile {
  total_xp: number;
}

export default function RankPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("total_xp")
        .eq("id", session.session.user.id)
        .single();

      if (fetchError) {
        setError("Impossible de charger ton rang.");
        setLoading(false);
        return;
      }
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );
  if (error || !profile)
    return (
      <Shell>
        <p className="text-center">{error}</p>
      </Shell>
    );

  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(profile.total_xp);
  const rank = rankFromLevel(level);
  const currentTier = tierForLevel(level);
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <Shell wide>
      <h1 className="font-heading text-3xl text-center lg:text-left mb-1">
        Mon <span className="text-secondary">rang</span>
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center lg:text-left mb-6">
        11 paliers × 4 niveaux
      </p>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
        {/* current rank banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-secondary border-[3px] border-outline rounded-sticker p-6 lg:p-8 text-center text-white shadow-[0_5px_0_0_#1A1A2E] lg:sticky lg:top-12"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 100%, rgba(255,212,59,0.4), transparent 60%)" }}
          />
          <div className="relative">
            <motion.div
              initial={{ rotate: -8, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-[3px] border-outline flex items-center justify-center font-heading text-2xl text-outline shadow-[0_4px_0_0_#1A1A2E]"
              style={{ backgroundColor: "#FFD43B" }}
            >
              {TIER_ABBR[currentTier.name]}
            </motion.div>
            <div className="font-heading text-2xl mb-1">{rank}</div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-85 mb-3">
              Niveau {level} · {profile.total_xp} XP
            </div>
            <div className="h-3 bg-black/30 border-2 border-outline rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-primary border-r-2 border-outline"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
            <div className="font-mono text-[11px] flex justify-between opacity-90">
              <span>{rank}</span>
              <span>
                <strong className="text-primary">{xpIntoLevel}</strong> / {xpForNextLevel} XP
              </span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-1.5">
          {RANK_TIERS.map((tier, i) => {
            const isCurrent = tier.name === currentTier.name;
            const isPast = level > tier.maxLevel;
            const sub = isCurrent ? subTierForLevel(level, tier) : null;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={`flex items-center gap-3 p-2.5 bg-surface border-2 border-outline rounded-sticker ${
                  isCurrent ? "shadow-[0_4px_0_0_#1A1A2E] border-[3px]" : "shadow-[0_2px_0_0_#1A1A2E]"
                } ${!isCurrent && !isPast ? "opacity-40" : ""}`}
                style={isCurrent ? { backgroundColor: "#FFD43B" } : undefined}
              >
                <div
                  className="w-9 h-9 rounded-lg border-2 border-outline flex items-center justify-center font-heading text-xs text-white flex-shrink-0"
                  style={{ backgroundColor: TIER_COLORS[tier.name] }}
                >
                  {TIER_ABBR[tier.name]}
                </div>
                <div className="flex-1">
                  <div className="font-heading text-sm leading-none mb-0.5">{tier.name} I → IV</div>
                  <div className="font-mono text-[10px] opacity-60">
                    Niv. {tier.minLevel}-{tier.maxLevel === Infinity ? "+" : tier.maxLevel}
                  </div>
                </div>
                <div
                  className={`font-mono text-[10px] font-semibold px-2 py-1 rounded-full border ${
                    isCurrent ? "bg-secondary text-white border-secondary" : "bg-background border-outline"
                  }`}
                >
                  {isCurrent ? `EN COURS · ${sub}` : isPast ? "✓ Acquis" : "À venir"}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
