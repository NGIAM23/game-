"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { levelFromTotalXp, rankFromLevel, colors } from "@luavio/shared";

interface Profile {
  id: string;
  pseudo: string | null;
  total_xp: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, pseudo, total_xp")
        .eq("id", session.session.user.id)
        .single();

      if (!error && data) setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center">Chargement...</main>;
  if (!profile) return <main className="min-h-screen flex items-center justify-center">Profil introuvable.</main>;

  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(profile.total_xp);
  const rank = rankFromLevel(level);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <h1 className="font-heading text-3xl" style={{ color: colors.outline }}>
        Niveau {level}
      </h1>
      <p className="font-heading text-xl" style={{ color: colors.secondary }}>
        {rank}
      </p>
      <p className="text-sm opacity-60">
        {xpIntoLevel} / {xpForNextLevel} XP
      </p>

      <button onClick={handleLogout} className="text-sm underline mt-8" style={{ color: colors.secondary }}>
        Se déconnecter
      </button>
    </main>
  );
}
