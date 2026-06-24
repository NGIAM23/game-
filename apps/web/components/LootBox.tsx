"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { playLevelUp, playError } from "@/lib/sound";

interface Reward {
  kind: "sparks" | "xp" | "streak_freeze";
  amount: number;
}

const REWARD_LABEL: Record<Reward["kind"], (n: number) => string> = {
  sparks: (n) => `+${n} ⚡ Sparks`,
  xp: (n) => `+${n} XP`,
  streak_freeze: (n) => `+${n} ❄️ Freeze de streak`,
};

function nextResetAt() {
  const next = new Date();
  next.setUTCHours(0, 0, 0, 0);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LootBox() {
  const [available, setAvailable] = useState(false);
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      const { data } = await supabase
        .from("profiles")
        .select("last_lootbox_on")
        .eq("id", session.session.user.id)
        .single();
      const today = new Date().toISOString().slice(0, 10);
      setAvailable(data?.last_lootbox_on !== today);
    }
    load();
  }, []);

  useEffect(() => {
    if (available) return;
    const target = nextResetAt();
    const tick = () => setCountdown(formatCountdown(target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [available]);

  async function open() {
    if (!available || opening) return;
    setOpening(true);
    const { data, error } = await supabase.rpc("open_daily_lootbox");
    setOpening(false);
    if (error || !data || data.length === 0) {
      playError();
      setAvailable(false);
      return;
    }
    setReward(data[0] as Reward);
    setAvailable(false);
    playLevelUp();
  }

  return (
    <>
      <motion.button
        onClick={open}
        disabled={!available || opening}
        whileTap={available ? { scale: 0.95 } : undefined}
        className="relative w-full flex flex-col items-center justify-center bg-gradient-to-b from-primary to-amber-500 border-[3px] border-outline rounded-sticker pt-5 pb-4 shadow-[0_5px_0_0_#1A1A2E] transition mb-6 active:translate-y-1 active:shadow-none disabled:opacity-70 overflow-hidden"
      >
        {available && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.5), transparent 60%)" }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
        <motion.div
          className="relative text-6xl mb-1"
          animate={available ? { y: [0, -4, 0], rotate: [-3, 3, -3] } : undefined}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {opening ? "✨" : "🎁"}
        </motion.div>
        <span className="relative font-heading text-sm text-outline">Coffre du jour</span>
        {available ? (
          <span className="relative font-mono text-[10px] uppercase tracking-widest bg-black/15 border-2 border-outline rounded-full px-3 py-1 mt-2">
            {opening ? "Ouverture..." : "Toucher pour ouvrir"}
          </span>
        ) : (
          <div className="relative flex flex-col items-center gap-1 mt-2">
            <span className="font-mono text-[10px] uppercase tracking-widest bg-black/15 border-2 border-outline rounded-full px-3 py-1">
              Déjà ouvert aujourd'hui
            </span>
            <span className="font-heading text-xs text-outline">Prochain coffre dans {countdown}</span>
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {reward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
            onClick={() => setReward(null)}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.45 }}
              className="bg-surface border-[3px] border-outline rounded-sticker p-8 text-center shadow-[0_5px_0_0_#1A1A2E]"
            >
              <div className="text-6xl mb-3">🎉</div>
              <h2 className="font-heading text-xl mb-2">Coffre ouvert !</h2>
              <p className="font-heading text-2xl text-secondary">{REWARD_LABEL[reward.kind](reward.amount)}</p>
              <p className="font-mono text-[10px] opacity-50 mt-4">Touche pour fermer</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
