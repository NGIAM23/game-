"use client";

import { motion } from "framer-motion";

const FLOATERS: { emoji: string; x: string; y: string; size: number; duration: number; delay: number }[] = [
  { emoji: "🔥", x: "8%", y: "18%", size: 38, duration: 5.5, delay: 0 },
  { emoji: "⚡", x: "85%", y: "14%", size: 34, duration: 4.6, delay: 0.4 },
  { emoji: "🏆", x: "78%", y: "62%", size: 40, duration: 6, delay: 0.8 },
  { emoji: "🎯", x: "14%", y: "68%", size: 32, duration: 5, delay: 1.2 },
  { emoji: "✨", x: "50%", y: "10%", size: 26, duration: 4, delay: 0.2 },
  { emoji: "⭐", x: "92%", y: "40%", size: 24, duration: 4.8, delay: 1.6 },
  { emoji: "🎁", x: "6%", y: "42%", size: 30, duration: 5.8, delay: 2 },
  { emoji: "🛡️", x: "60%", y: "82%", size: 28, duration: 5.2, delay: 0.6 },
];

export default function LaunchBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(103,80,232,0.22), transparent 45%), radial-gradient(circle at 85% 75%, rgba(255,212,59,0.35), transparent 45%), radial-gradient(circle at 50% 100%, rgba(255,212,59,0.25), transparent 55%)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-secondary/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-primary/30 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{ left: f.x, top: f.y, fontSize: f.size }}
          animate={{ y: [0, -16, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="opacity-70 drop-shadow-[0_2px_0_rgba(26,26,46,0.15)]">{f.emoji}</span>
        </motion.div>
      ))}
    </div>
  );
}
