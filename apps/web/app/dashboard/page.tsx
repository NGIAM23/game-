"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { levelFromTotalXp, rankFromLevel, CATEGORIES, categoryColors } from "@luavio/shared";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
import SundayBanner from "@/components/SundayBanner";

interface Profile {
  id: string;
  pseudo: string | null;
  avatar_seed: string | null;
  total_xp: number;
  current_streak: number;
  sparks: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [doneToday, setDoneToday] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
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
        .select("id, pseudo, avatar_seed, total_xp, current_streak, sparks")
        .eq("id", session.session.user.id)
        .single();

      if (fetchError) {
        setError("Impossible de charger ton profil. Réessaie.");
        setLoading(false);
        return;
      }

      if (data && !data.pseudo) {
        router.push("/onboarding");
        return;
      }
      setProfile(data);

      const { data: completions } = await supabase
        .from("task_completions")
        .select("task_id")
        .eq("completed_on", new Date().toISOString().slice(0, 10));
      const { count } = await supabase.from("tasks").select("id", { count: "exact", head: true });
      setDoneToday(completions?.length ?? 0);
      setTotalToday(Math.min(3, count ?? 3));

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
  if (error)
    return (
      <Shell>
        <p className="text-center">{error}</p>
      </Shell>
    );
  if (!profile)
    return (
      <Shell>
        <p className="text-center">Profil introuvable.</p>
      </Shell>
    );

  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(profile.total_xp);
  const rank = rankFromLevel(level);
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <Shell wide>
      <div className="flex items-center gap-3 mb-1">
        <Avatar seed={profile.avatar_seed || profile.pseudo || "luavio"} size={44} />
        <div>
          <div className="font-heading text-2xl lg:text-3xl leading-none">
            Salut, <span className="text-secondary">{profile.pseudo}</span> 👋
          </div>
          <p className="font-mono text-xs uppercase tracking-widest opacity-50">
            Jour {profile.current_streak} · Streak en cours
          </p>
        </div>
      </div>

      <SundayBanner className="mt-5 mb-1" />

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5 lg:gap-6 items-start mt-6">
        {/* Level card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-secondary border-[3px] border-outline rounded-sticker p-5 lg:p-8 shadow-[0_5px_0_0_#1A1A2E] text-white"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 100%, rgba(255,212,59,0.35), transparent 60%)" }}
          />
          <div className="relative flex items-start justify-between mb-3">
            <span className="font-heading text-xs bg-primary text-outline border-2 border-outline rounded-full px-3 py-1 shadow-[0_2px_0_0_#1A1A2E]">
              ⭐ {rank}
            </span>
            {profile.current_streak > 0 && (
              <span className="font-heading text-sm bg-black/25 border-2 border-outline rounded-full px-3 py-1 flex items-center gap-1">
                🔥 {profile.current_streak}
              </span>
            )}
          </div>
          <div className="relative font-heading leading-none mb-1" style={{ fontSize: 72 }}>
            {level}
          </div>
          <div className="relative text-xs uppercase tracking-widest opacity-85 font-semibold mb-3">Niveau</div>
          <div className="relative h-3.5 bg-black/35 border-2 border-outline rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-primary border-r-2 border-outline"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            />
          </div>
          <div className="relative font-mono text-xs flex justify-between opacity-90">
            <span>{rank}</span>
            <span>
              <strong className="text-primary">{xpIntoLevel}</strong> / {xpForNextLevel} XP
            </span>
          </div>
        </motion.div>

        {/* Today card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-surface border-2 border-outline rounded-sticker p-5 lg:p-6 shadow-[0_4px_0_0_#1A1A2E] flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-heading text-sm">Aujourd'hui</span>
            <span className="font-heading text-xs bg-background border-2 border-outline rounded-full px-2.5 py-0.5">
              {doneToday} / {totalToday}
            </span>
          </div>
          <div className="flex items-center justify-between bg-primary border-2 border-outline rounded-sticker px-3.5 py-2.5 shadow-[0_2px_0_0_#1A1A2E]">
            <span className="font-body font-semibold text-xs">Tes Sparks</span>
            <span className="font-heading text-sm">⚡ {profile.sparks}</span>
          </div>
          <button
            onClick={() => router.push("/tasks")}
            className="font-heading bg-primary border-2 border-outline rounded-sticker py-3.5 shadow-[0_4px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
          >
            🎯 Faire mes tâches
          </button>
          <button
            onClick={() => router.push("/rank")}
            className="font-heading bg-background border-2 border-outline rounded-sticker py-3.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
          >
            🏅 Voir mon rang
          </button>
          <button
            onClick={() => router.push("/leaderboard")}
            className="font-heading bg-background border-2 border-outline rounded-sticker py-3.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
          >
            🏆 Classement
          </button>
        </motion.div>
      </div>

      <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mt-8 mb-3">7 catégories XP</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.03 * i }}
            className="flex items-center gap-2.5 bg-surface border-2 border-outline rounded-sticker p-3 shadow-[0_2px_0_0_#1A1A2E]"
          >
            <span
              className="w-9 h-9 rounded-lg border-2 border-outline flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: categoryColors[cat.id] }}
            >
              {cat.icon}
            </span>
            <span className="font-body font-semibold text-xs">{cat.label}</span>
          </motion.div>
        ))}
      </div>
    </Shell>
  );
}
