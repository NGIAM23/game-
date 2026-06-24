"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { levelFromTotalXp, rankFromLevel, randomAvatarSeed, CATEGORIES, categoryColors } from "@luavio/shared";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
import CategoryIcon from "@/components/CategoryIcon";
import StreakCalendar from "@/components/StreakCalendar";
import WeeklyRecap from "@/components/WeeklyRecap";
import { isSoundEnabled, setSoundEnabled, playClick, startAmbientMusic, stopAmbientMusic } from "@/lib/sound";

function seedFromPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 8;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no canvas context");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          hash = (hash * 31 + data[i]) | 0;
        }
        resolve(Math.abs(hash).toString(36));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid image"));
    };
    img.src = url;
  });
}

interface ProfileData {
  pseudo: string;
  avatar_seed: string | null;
  total_xp: number;
  current_streak: number;
  streak_freezes: number;
  sparks: number;
  is_plus: boolean;
  xp_boost_until: string | null;
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
  const [soundOn, setSoundOn] = useState(true);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInput = useRef<HTMLInputElement | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkNotice, setLinkNotice] = useState<string | null>(null);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }
      setIsAnonymous(session.session.user.is_anonymous ?? false);
      const { data } = await supabase
        .from("profiles")
        .select("pseudo, avatar_seed, total_xp, current_streak, streak_freezes, sparks, is_plus, xp_boost_until")
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

  async function linkAccount() {
    if (!linkEmail.trim() || linkPassword.length < 6) {
      setLinkNotice("Renseigne un email valide et un mot de passe de 6 caractères minimum.");
      return;
    }
    setLinkBusy(true);
    setLinkNotice(null);
    const { error } = await supabase.auth.updateUser(
      { email: linkEmail.trim(), password: linkPassword },
      { emailRedirectTo: `${origin}/profile` }
    );
    setLinkBusy(false);
    if (error) {
      setLinkNotice(error.message.includes("already") ? "Cet email est déjà utilisé par un autre compte." : "Impossible de lier cet email, réessaie.");
      return;
    }
    setLinkNotice("Vérifie ta boîte mail et clique sur le lien de confirmation pour activer la récupération multi-appareils.");
    setLinkEmail("");
    setLinkPassword("");
  }

  async function handlePhotoToAvatar(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    setNotice(null);
    try {
      const seed = await seedFromPhoto(file);
      setSeedInput(seed);
      setNotice("Avatar généré à partir de ta photo — la photo n'a pas été envoyée ni enregistrée, tout reste sur ton appareil.");
    } catch {
      setNotice("Impossible de lire cette photo, réessaie avec une autre.");
    }
    setPhotoBusy(false);
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
  const boostActive = profile.xp_boost_until && new Date(profile.xp_boost_until).getTime() > Date.now();
  const boostMinutesLeft = boostActive
    ? Math.max(1, Math.ceil((new Date(profile.xp_boost_until as string).getTime() - Date.now()) / 60000))
    : 0;

  return (
    <Shell wide>
      <h1 className="font-heading text-3xl text-center mb-6">
        Mon <span className="text-secondary">profil</span>
      </h1>

      {boostActive && (
        <div className="bg-primary border-2 border-outline rounded-sticker p-3 mb-6 text-center font-heading text-sm shadow-[0_3px_0_0_#1A1A2E]">
          ⚡ Boost XP x2 actif — {boostMinutesLeft} min restantes
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:items-start">
        <div className="lg:sticky lg:top-12">
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

          <WeeklyRecap />
          <StreakCalendar freezes={profile.streak_freezes} />

          <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E] flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base">🔊 Son</h2>
              <p className="font-mono text-[10px] opacity-50">Active ou coupe les sons de l'app.</p>
            </div>
            <button
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                setSoundEnabled(next);
                if (next) {
                  playClick();
                  startAmbientMusic();
                } else {
                  stopAmbientMusic();
                }
              }}
              className="font-heading text-sm bg-background border-2 border-outline rounded-sticker px-4 py-2 shadow-[0_2px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
            >
              {soundOn ? "🔊 Activé" : "🔇 Coupé"}
            </button>
          </div>

          {isAnonymous && (
            <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
              <h2 className="font-heading text-base mb-1">🔐 Sécuriser mon compte</h2>
              <p className="font-mono text-[10px] opacity-50 leading-snug mb-3">
                Ton Luavio ID est lié à cet appareil. Ajoute un email + mot de passe pour retrouver ta progression sur un autre
                appareil.
              </p>
              <input
                type="email"
                placeholder="ton@email.fr"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body mb-2"
              />
              <input
                type="password"
                placeholder="Mot de passe (6 caractères min.)"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body mb-3"
              />
              <button
                onClick={linkAccount}
                disabled={linkBusy}
                className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
              >
                {linkBusy ? "..." : "Lier cet email à mon compte"}
              </button>
              {linkNotice && <p className="text-xs text-center mt-2 font-body font-semibold">{linkNotice}</p>}
            </div>
          )}

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
        </div>

        <div>
          <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
            <h2 className="font-heading text-base mb-3">✏️ Modifier mon profil</h2>
            <div className="lg:grid lg:grid-cols-2 lg:gap-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1">Pseudo</label>
                <input
                  value={pseudoInput}
                  onChange={(e) => setPseudoInput(e.target.value)}
                  className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body mb-3"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1">Seed avatar</label>
                <input
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body mb-3"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Avatar seed={seedInput || profile.pseudo} size={48} />
              <button
                onClick={() => setSeedInput(randomAvatarSeed())}
                className="flex-1 font-heading text-xs bg-background border-2 border-outline rounded-sticker py-2 shadow-[0_2px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
              >
                🎲 Avatar aléatoire
              </button>
              <input
                ref={photoInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoToAvatar(e.target.files?.[0])}
              />
              <button
                onClick={() => photoInput.current?.click()}
                disabled={photoBusy}
                className="flex-1 font-heading text-xs bg-background border-2 border-outline rounded-sticker py-2 shadow-[0_2px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
              >
                {photoBusy ? "..." : "📷 Depuis une photo"}
              </button>
            </div>
            <p className="font-mono text-[10px] opacity-50 leading-snug mb-3">
              🔒 Ta photo est traitée uniquement sur ton appareil pour générer un avatar : elle n'est jamais envoyée ni stockée
              par Luavio.
            </p>

            <button
              onClick={save}
              disabled={saving}
              className="w-full lg:w-auto lg:px-10 font-heading bg-primary border-2 border-outline rounded-sticker py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
            {notice && <p className="text-xs text-center mt-2 font-body font-semibold">{notice}</p>}
          </div>

          <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
            <h2 className="font-heading text-base mb-3">📊 Mes statistiques</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.id] ?? 0;
                const pct = totalCompletions > 0 ? Math.round((count / totalCompletions) * 100) : 0;
                return (
                  <div
                    key={cat.id}
                    className="border-2 border-outline rounded-lg p-2 text-center"
                    style={{ backgroundColor: categoryColors[cat.id] }}
                  >
                    <div className="flex justify-center mb-0.5">
                      <CategoryIcon id={cat.id} size={20} />
                    </div>
                    <div className="font-heading text-[11px]">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
