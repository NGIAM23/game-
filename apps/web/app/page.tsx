"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const TIPS = [
  "💡 Ajoute une photo preuve sur une tâche pour gagner +15% XP en plus.",
  "🔥 Complète une tâche chaque jour pour faire grimper ta série.",
  "⚡ Le dimanche, toutes les tâches rapportent le double d'XP.",
  "🏆 Grimpe dans le classement pour débloquer de nouveaux rangs.",
  "🎨 Dépense tes Sparks pour personnaliser ton avatar dans la boutique.",
  "🤝 Ajoute des amis pour vous motiver mutuellement chaque semaine.",
];

const LOADING_MS = 5000;
const TIP_INTERVAL_MS = 2000;

export default function Home() {
  const router = useRouter();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), TIP_INTERVAL_MS);

    let cancelled = false;
    async function resolveDestination() {
      const { data } = await supabase.auth.getSession();
      const destination = data.session ? "/dashboard" : "/auth";
      const elapsed = performance.now();
      const remaining = Math.max(0, LOADING_MS - elapsed);
      setTimeout(() => {
        if (!cancelled) router.replace(destination);
      }, remaining);
    }
    resolveDestination();

    return () => {
      cancelled = true;
      clearInterval(tipTimer);
    };
  }, [router]);

  return (
    <AnimatePresence>
      <motion.div
        key="launch"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          className="font-heading text-5xl mb-6"
          style={{ textShadow: "4px 4px 0 #FFD43B" }}
        >
          luav<span className="text-secondary">i</span>o
        </motion.div>
        <div className="w-40 h-2.5 rounded-full bg-surface border-2 border-outline overflow-hidden mb-5">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-secondary"
          />
        </div>
        <div className="h-10 max-w-sm text-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="font-body text-sm opacity-70"
            >
              {TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest opacity-50 mt-4">Chargement...</p>
      </motion.div>
    </AnimatePresence>
  );
}
