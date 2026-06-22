"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, categoryColors, isSunday, type CategoryId } from "@luavio/shared";
import Shell from "@/components/Shell";
import SundayBanner from "@/components/SundayBanner";

type Location = "home" | "outside" | "any";

interface TaskRow {
  id: string;
  category: CategoryId;
  label: string;
  base_xp: number;
  location: Location;
}

const BATCH_SIZE = 3;

const LOCATION_LABEL: Record<Location, string> = {
  home: "🏠 Chez toi",
  outside: "🌳 Extérieur",
  any: "🔁 Partout",
};

function dailySeed(): number {
  const today = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < today.length; i++) h = (h * 31 + today.charCodeAt(i)) | 0;
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDaily<T>(pool: T[]): T[] {
  const rand = mulberry32(dailySeed());
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function TasksPage() {
  const router = useRouter();
  const [pool, setPool] = useState<TaskRow[]>([]);
  const [revealedCount, setRevealedCount] = useState(BATCH_SIZE);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [xpToday, setXpToday] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }

      const { data: allTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, category, label, base_xp, location");

      const { data: completions, error: completionsError } = await supabase
        .from("task_completions")
        .select("task_id, xp_awarded")
        .eq("completed_on", new Date().toISOString().slice(0, 10));

      if (tasksError || completionsError) {
        setError("Impossible de charger les tâches. Réessaie.");
        setLoading(false);
        return;
      }

      setPool(shuffleDaily(allTasks ?? []));
      setDoneIds(new Set((completions ?? []).map((c) => c.task_id)));
      setXpToday((completions ?? []).reduce((sum, c) => sum + c.xp_awarded, 0));
      setLoading(false);
    }
    load();
  }, [router]);

  async function completeTask(taskId: string) {
    setPending(taskId);
    const { data: xpAwarded, error: rpcError } = await supabase.rpc("complete_task", { p_task_id: taskId });
    setPending(null);

    if (!rpcError && typeof xpAwarded === "number") {
      setDoneIds((prev) => new Set(prev).add(taskId));
      setXpToday((prev) => prev + xpAwarded);
    }
  }

  if (loading)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  const visible = pool.slice(0, revealedCount);
  const allVisibleDone = visible.length > 0 && visible.every((t) => doneIds.has(t.id));
  const hasMore = revealedCount < pool.length;

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl">Aujourd'hui</h2>
        <span className="font-heading text-xs bg-surface border-2 border-outline rounded-full px-3 py-1 shadow-[0_2px_0_0_#1A1A2E]">
          {doneIds.size} fait{doneIds.size > 1 ? "es" : "e"}
        </span>
      </div>
      <p className="font-heading text-xl text-secondary mb-4">+{xpToday} XP aujourd'hui</p>

      <SundayBanner className="mb-6" />

      {error ? (
        <p className="text-center">{error}</p>
      ) : pool.length === 0 ? (
        <p className="text-center opacity-60">Aucune tâche disponible pour le moment.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {visible.map((task, i) => {
                const category = CATEGORIES.find((c) => c.id === task.category)!;
                const isDone = doneIds.has(task.id);
                const xp =
                  (task.category === "detoxEcran" ? task.base_xp * 3 : task.base_xp) * (isSunday() ? 2 : 1);
                return (
                  <motion.button
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i >= revealedCount - BATCH_SIZE ? (i % BATCH_SIZE) * 0.06 : 0 }}
                    whileTap={{ scale: isDone ? 1 : 0.98 }}
                    disabled={isDone || pending === task.id}
                    onClick={() => completeTask(task.id)}
                    className={`flex items-center gap-3 border-2 border-outline rounded-sticker p-3.5 text-left transition shadow-[0_3px_0_0_#1A1A2E] active:translate-y-[3px] active:shadow-none ${
                      isDone ? "opacity-70" : ""
                    }`}
                    style={{ backgroundColor: isDone ? "#F0EAD2" : "#FFFFFF" }}
                  >
                    <span
                      className="w-11 h-11 rounded-xl border-2 border-outline flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: categoryColors[task.category] }}
                    >
                      {category.icon}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block font-body font-semibold text-sm ${isDone ? "line-through opacity-60" : ""}`}
                      >
                        {task.label}
                      </span>
                      <span className="block font-mono text-[10px] opacity-50 uppercase tracking-wide">
                        {category.label} · {LOCATION_LABEL[task.location]}
                      </span>
                    </span>
                    <motion.span
                      key={isDone ? "done" : "todo"}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="font-heading text-sm border-2 border-outline rounded-full px-2.5 py-1 shadow-[0_2px_0_0_#1A1A2E]"
                      style={{ backgroundColor: isDone ? "#2ED573" : "#FFD43B", color: isDone ? "#fff" : "#1A1A2E" }}
                    >
                      {isDone ? "✓" : `+${xp}`}
                    </motion.span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="mt-5 text-center">
            {hasMore ? (
              <button
                onClick={() => setRevealedCount((c) => Math.min(pool.length, c + BATCH_SIZE))}
                disabled={!allVisibleDone}
                className="font-heading text-sm bg-secondary text-white border-2 border-outline rounded-sticker px-5 py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-40"
              >
                {allVisibleDone ? "✨ Encore des tâches" : "Termine d'abord celles-ci"}
              </button>
            ) : allVisibleDone ? (
              <p className="font-heading text-sm opacity-60">🎉 Tu as fait le plein aujourd'hui, reviens demain !</p>
            ) : null}
          </div>
        </>
      )}
    </Shell>
  );
}
