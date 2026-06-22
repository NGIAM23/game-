"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES, categoryColors } from "@luavio/shared";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 lg:py-24 max-w-3xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="font-mono text-[11px] uppercase tracking-widest text-secondary bg-white inline-block px-3 py-1.5 rounded-full border-2 border-outline shadow-[0_3px_0_0_#1A1A2E] mb-5">
          — beta privée
        </span>
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

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-14">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 * i }}
            whileHover={{ y: -3 }}
            className="rounded-sticker border-2 border-outline p-4 text-center font-body shadow-[0_4px_0_0_#1A1A2E]"
            style={{ backgroundColor: categoryColors[cat.id] }}
          >
            <div className="text-2xl mb-1">{cat.icon}</div>
            <div className="font-heading text-sm">{cat.label}</div>
          </motion.div>
        ))}
      </section>

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
          Rejoindre la beta
        </Link>
      </motion.section>
    </main>
  );
}
