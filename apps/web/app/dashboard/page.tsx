"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { levelFromTotalXp, rankFromLevel, colors } from "@luavio/shared";
import Nav from "@/components/Nav";

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

  return (
    <main className="min-h-screen px-6">
      <Nav />
      <div className="flex flex-col items-center justify-center gap-4 mt-8">
        <p className="font-body opacity-60">@{profile.pseudo}</p>
        <h1 className="font-heading text-3xl" style={{ color: colors.outline }}>
          Niveau {level}
        </h1>
        <p className="font-heading text-xl" style={{ color: colors.secondary }}>
          {rank}
        </p>
        <p className="text-sm opacity-60">
          {xpIntoLevel} / {xpForNextLevel} XP
        </p>
        {profile.current_streak > 0 && (
          <p className="text-sm" style={{ color: colors.primary, textShadow: "0 0 0 1px #1A1A2E" }}>
            🔥 {profile.current_streak} jour{profile.current_streak > 1 ? "s" : ""} de suite
          </p>
        )}
      </div>
    </main>
  );
}
