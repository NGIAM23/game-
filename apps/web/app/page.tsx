"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const TIPS = [
  "💡 Ajoute une photo preuve sur une tâche pour gagner +15% XP en plus.",
  "🔥 Complète une tâche chaque jour pour faire grimper ta série.",
  "⚡ Le dimanche, toutes les tâches rapportent le double d'XP.",
  "🏆 Grimpe dans le classement pour débloquer de nouveaux rangs.",
  "🎨 Dépense tes Sparks pour personnaliser ton avatar dans la boutique.",
  "🤝 Ajoute des amis pour vous motiver mutuellement chaque semaine.",
];

function LaunchScreen() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
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
  );
}

export default function Home() {
  const [launching, setLaunching] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLaunching(false), 4200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>{launching && <LaunchScreen />}</AnimatePresence>

      <main className="min-h-screen px-6 py-16 lg:py-24 max-w-3xl mx-auto flex flex-col">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h1
            className="font-heading text-6xl lg:text-8xl leading-[0.9] mb-4"
            style={{ textShadow: "4px 4px 0 #FFD43B" }}
          >
            luav<span className="text-secondary" style={{ display: "inline-block", transform: "rotate(-2deg)" }}>i</span>o
          </h1>
          <p className="text-lg text-outline/70 max-w-md mx-auto">
            Le seul jeu où tu gagnes des niveaux dans la vraie vie, avec preuve.
          </p>
          <p className="font-heading text-secondary mt-3 text-xl">Devenir meilleur, pour de vrai.</p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/auth"
            className="inline-block font-heading bg-primary border-2 border-outline rounded-sticker px-8 py-4 text-lg shadow-[0_4px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition hover:-translate-y-0.5"
          >
            Commencer l'aventure
          </Link>
        </motion.section>

        <footer className="mt-auto pt-16 text-center font-mono text-[11px] uppercase tracking-widest opacity-50 flex items-center justify-center gap-4">
          <Link href="/cgu" className="hover:opacity-100 transition">
            CGU
          </Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:opacity-100 transition">
            Confidentialité
          </Link>
        </footer>
      </main>
    </>
  );
}
