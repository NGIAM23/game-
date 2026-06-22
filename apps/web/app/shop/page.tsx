"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Shell from "@/components/Shell";

interface Profile {
  id: string;
  pseudo: string | null;
  sparks: number;
  is_plus: boolean;
}

export default function Shop() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id, pseudo, sparks, is_plus")
        .eq("id", session.session.user.id)
        .single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function subscribe() {
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ is_plus: true }).eq("id", profile.id);
    setBusy(false);
    if (!error) setProfile({ ...profile, is_plus: true });
  }

  async function unsubscribe() {
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ is_plus: false }).eq("id", profile.id);
    setBusy(false);
    if (!error) setProfile({ ...profile, is_plus: false });
  }

  if (loading || !profile)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  return (
    <Shell>
      <h1 className="font-heading text-3xl text-center mb-1">
        luavio<span className="text-secondary">+</span>
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center mb-6">
        Bêta — simulation, aucun paiement réel
      </p>

      <div className="flex items-center justify-between bg-primary border-2 border-outline rounded-sticker px-4 py-3 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
        <span className="font-body font-semibold text-sm">Tes Sparks</span>
        <span className="font-heading text-base">⚡ {profile.sparks}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-secondary text-white border-[3px] border-outline rounded-sticker p-6 shadow-[0_5px_0_0_#1A1A2E] mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-heading text-xl">luavio+</span>
          {profile.is_plus && (
            <span className="font-heading text-xs bg-primary text-outline border-2 border-outline rounded-full px-3 py-1">
              ✓ Actif
            </span>
          )}
        </div>
        <div className="font-heading text-3xl mb-1">3,99 € / mois</div>
        <p className="font-mono text-[11px] opacity-80 mb-4">Simulation bêta — pas de carte requise.</p>
        <ul className="flex flex-col gap-2 mb-5 text-sm font-body">
          <li>⚡ +10% XP sur chaque tâche</li>
          <li>🔁 Recharge de tâches illimitée</li>
          <li>🎨 Cosmétiques exclusifs pour l'avatar</li>
          <li>📊 Statistiques avancées</li>
        </ul>
        {profile.is_plus ? (
          <button
            onClick={unsubscribe}
            disabled={busy}
            className="w-full font-heading bg-white/15 border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
          >
            Annuler (simulation)
          </button>
        ) : (
          <button
            onClick={subscribe}
            disabled={busy}
            className="w-full font-heading bg-primary text-outline border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
          >
            ✨ Activer luavio+ (simulation)
          </button>
        )}
      </motion.div>

      <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-3">Sparks</h2>
      <p className="text-sm opacity-70 mb-4">
        Les Sparks se gagnent en complétant des tâches. La boutique de cosmétiques arrive bientôt — reviens vite !
      </p>
    </Shell>
  );
}
