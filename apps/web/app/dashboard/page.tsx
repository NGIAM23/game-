"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { levelFromTotalXp, rankFromLevel } from "@luavio/shared";
import BottomNav from "@/components/BottomNav";

interface Profile {
  id: string;
  pseudo: string | null;
  total_xp: number;
  current_streak: number;
}

export default function Dashboard() {
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
        .select("id, pseudo, total_xp, current_streak")
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
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <main className="min-h-screen flex items-center justify-center">Chargement...</main>;
  if (error) return <main className="min-h-screen flex items-center justify-center">{error}</main>;
  if (!profile) return <main className="min-h-screen flex items-center justify-center">Profil introuvable.</main>;

  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(profile.total_xp);
  const rank = rankFromLevel(level);
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <main className="min-h-screen px-6 pb-28">
      <div className="max-w-xl mx-auto pt-8">
        <div className="font-heading text-2xl mb-1">
          Salut, <span className="text-secondary">{profile.pseudo}</span> 👋
        </div>
        <p className="font-mono text-xs uppercase tracking-widest opacity-50 mb-6">
          Jour {profile.current_streak} · Streak en cours
        </p>

        {/* Level card */}
        <div className="relative overflow-hidden bg-secondary border-[3px] border-outline rounded-sticker p-5 mb-5 shadow-[0_5px_0_0_#1A1A2E] text-white">
          <div className="flex items-start justify-between mb-3">
            <span className="font-heading text-xs bg-primary text-outline border-2 border-outline rounded-full px-3 py-1 shadow-[0_2px_0_0_#1A1A2E]">
              ⭐ {rank}
            </span>
            {profile.current_streak > 0 && (
              <span className="font-heading text-sm bg-black/25 border-2 border-outline rounded-full px-3 py-1 flex items-center gap-1">
                🔥 {profile.current_streak}
              </span>
            )}
          </div>
          <div className="font-heading leading-none mb-1" style={{ fontSize: 72 }}>
            {level}
          </div>
          <div className="text-xs uppercase tracking-widest opacity-85 font-semibold mb-3">Niveau</div>
          <div className="h-3.5 bg-black/35 border-2 border-outline rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary border-r-2 border-outline"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="font-mono text-xs flex justify-between opacity-90">
            <span>{rank}</span>
            <span>
              <strong className="text-primary">{xpIntoLevel}</strong> / {xpForNextLevel} XP
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/tasks")}
            className="font-heading bg-primary border-2 border-outline rounded-sticker py-4 shadow-[0_4px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
          >
            🎯 Tâches du jour
          </button>
          <button
            onClick={() => router.push("/rank")}
            className="font-heading bg-surface border-2 border-outline rounded-sticker py-4 shadow-[0_4px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
          >
            🏅 Mon rang
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
