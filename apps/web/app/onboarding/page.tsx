"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { randomAvatarSeed } from "@luavio/shared";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";

// Format autorisé cf docs/20_decisions_finales_checklist.md §B : a-z, 0-9, _, ., 3-20 chars
const PSEUDO_REGEX = /^[a-z0-9_.]{3,20}$/;

function generateSeeds(): string[] {
  return Array.from({ length: 6 }, randomAvatarSeed);
}

export default function Onboarding() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [seeds, setSeeds] = useState<string[]>(generateSeeds());
  const [avatarSeed, setAvatarSeed] = useState(seeds[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/auth");
    });
  }, [router]);

  function reroll() {
    const fresh = generateSeeds();
    setSeeds(fresh);
    setAvatarSeed(fresh[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = pseudo.toLowerCase();
    if (!PSEUDO_REGEX.test(normalized)) {
      setError("3-20 caractères : lettres, chiffres, _ ou .");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: session } = await supabase.auth.getSession();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ pseudo: normalized, avatar_seed: avatarSeed })
      .eq("id", session.session!.user.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message.includes("duplicate") ? "Ce pseudo est déjà pris." : updateError.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border-[3px] border-outline rounded-sticker p-7 shadow-[0_5px_0_0_#1A1A2E]"
      >
        <div className="text-center mb-6">
          <Logo size={28} />
        </div>
        <h1 className="font-heading text-2xl text-center mb-2">Choisis ton pseudo</h1>
        <p className="text-sm text-center opacity-60 mb-6">Visible sur ton profil public</p>

        <input
          type="text"
          placeholder="pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          required
          className="w-full border-2 border-outline rounded-sticker px-4 py-2.5 mb-6 outline-none focus:border-secondary transition"
        />

        <div className="flex items-center justify-between mb-3">
          <span className="font-heading text-sm">Ton avatar</span>
          <button
            type="button"
            onClick={reroll}
            className="font-mono text-[10px] uppercase tracking-wide text-secondary underline"
          >
            🔀 relancer
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {seeds.map((seed) => (
            <button
              key={seed}
              type="button"
              onClick={() => setAvatarSeed(seed)}
              className={`flex items-center justify-center rounded-sticker p-1.5 border-2 transition ${
                avatarSeed === seed ? "border-secondary bg-background shadow-[0_3px_0_0_#6750E8]" : "border-outline"
              }`}
            >
              <Avatar seed={seed} size={56} />
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-3 shadow-[0_4px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
        >
          {loading ? "..." : "Valider"}
        </button>

        {error && <p className="text-sm text-center mt-4 text-cat-corps">{error}</p>}
      </motion.form>
    </main>
  );
}
