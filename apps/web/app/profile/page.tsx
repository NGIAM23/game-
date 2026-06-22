"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { levelFromTotalXp, rankFromLevel, CATEGORIES, categoryColors } from "@luavio/shared";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";

interface ProfileData {
  pseudo: string;
  avatar_seed: string | null;
  total_xp: number;
  current_streak: number;
  sparks: number;
  is_plus: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pseudoInput, setPseudoInput] = useState("");
  const [seedInput, setSeedInput] = useState("");
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("pseudo, avatar_seed, total_xp, current_streak, sparks, is_plus")
        .eq("id", session.session.user.id)
        .single();
      if (data) {
        setProfile(data);
        setPseudoInput(data.pseudo ?? "");
        setSeedInput(data.avatar_seed ?? data.pseudo ?? "");
      }

      const { data: completions } = await supabase.from("task_completions").select("tasks(category)");
      const counts: Record<string, number> = {};
      for (const row of (completions ?? []) as unknown as { tasks: { category: string } | { category: string }[] | null }[]) {
        const tasksField = row.tasks;
        const cat = Array.isArray(tasksField) ? tasksField[0]?.category : tasksField?.category;
        if (cat) counts[cat] = (counts[cat] ?? 0) + 1;
      }
      setCategoryCounts(counts);
      setLoading(false);
    }
    load();
  }, [router]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    setNotice(null);
    const { error } = await supabase
      .from("profiles")
      .update({ pseudo: pseudoInput.trim(), avatar_seed: seedInput.trim() })
      .eq("pseudo", profile.pseudo);
    setSaving(false);
    if (error) {
      setNotice("Ce pseudo est déjà pris ou invalide.");
    } else {
      setProfile({ ...profile, pseudo: pseudoInput.trim(), avatar_seed: seedInput.trim() });
      setNotice("Profil mis à jour !");
    }
  }

  if (loading || !profile)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  const { level } = levelFromTotalXp(profile.total_xp);
  const rank = rankFromLevel(level);
  const totalCompletions = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const profileUrl = origin ? `${origin}/u/${profile.pseudo}` : "";

  return (
    <Shell>
      <h1 className="font-heading text-3xl text-center mb-6">
        Mon <span className="text-secondary">profil</span>
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary text-white border-[3px] border-outline rounded-sticker p-6 shadow-[0_5px_0_0_#1A1A2E] text-center mb-6"
      >
        <div className="flex justify-center mb-3">
          <Avatar seed={profile.avatar_seed || profile.pseudo} size={72} />
        </div>
        <div className="font-heading text-xl mb-0.5">@{profile.pseudo}</div>
        <div className="font-mono text-xs uppercase tracking-widest opacity-80 mb-3">{rank}</div>
        <div className="flex items-center justify-center gap-4 font-heading text-sm">
          <span>Niv. {level}</span>
          <span>🔥 {profile.current_streak}</span>
          <span>⚡ {profile.sparks}</span>
        </div>
      </motion.div>

      <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
        <h2 className="font-heading text-base mb-3">✏️ Modifier mon profil</h2>
        <label className="block font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1">Pseudo</label>
        <input
          value={pseudoInput}
          onChange={(e) => setPseudoInput(e.target.value)}
          className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body mb-3"
        />
        <label className="block font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1">Seed avatar</label>
        <input
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
          className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body mb-3"
        />
        <button
          onClick={save}
          disabled={saving}
          className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
        >
          {saving ? "..." : "Enregistrer"}
        </button>
        {notice && <p className="text-xs text-center mt-2 font-body font-semibold">{notice}</p>}
      </div>

      <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
        <h2 className="font-heading text-base mb-3">📊 Mes statistiques</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const pct = totalCompletions > 0 ? Math.round((count / totalCompletions) * 100) : 0;
            return (
              <div
                key={cat.id}
                className="border-2 border-outline rounded-lg p-2 text-center"
                style={{ backgroundColor: categoryColors[cat.id] }}
              >
                <div className="text-lg">{cat.icon}</div>
                <div className="font-heading text-[11px]">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {profileUrl && (
        <div className="bg-surface border-2 border-outline rounded-sticker p-4 text-center shadow-[0_3px_0_0_#1A1A2E]">
          <h2 className="font-heading text-base mb-3">📱 Mon QR code ami</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(profileUrl)}`}
            alt="QR code de mon profil"
            width={180}
            height={180}
            className="mx-auto border-2 border-outline rounded-lg mb-2"
          />
          <p className="font-mono text-[11px] opacity-50">Fais scanner ce code pour qu'on t'ajoute en ami.</p>
        </div>
      )}
    </Shell>
  );
}
