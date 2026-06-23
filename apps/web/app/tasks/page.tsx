"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, categoryColors, isSunday, levelFromTotalXp, type CategoryId } from "@luavio/shared";
import Shell from "@/components/Shell";
import SundayBanner from "@/components/SundayBanner";
import CategoryIcon from "@/components/CategoryIcon";
import { playTaskComplete, playLevelUp, playSuspense, playVictory } from "@/lib/sound";

type Location = "home" | "outside" | "any";
type Frequency = "daily" | "weekly";

interface TaskRow {
  id: string;
  category: CategoryId;
  label: string;
  base_xp: number;
  location: Location;
  frequency: Frequency;
}

interface VerifyResult {
  verified: boolean;
  reason: string;
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

function weekStartISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TasksPage() {
  const router = useRouter();
  const [pool, setPool] = useState<TaskRow[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<TaskRow[]>([]);
  const [revealedCount, setRevealedCount] = useState(BATCH_SIZE);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [weeklyDoneIds, setWeeklyDoneIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyResults, setVerifyResults] = useState<Record<string, VerifyResult>>({});
  const [xpToday, setXpToday] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }

      const { data: allTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, category, label, base_xp, location, frequency");

      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp")
        .eq("id", session.session.user.id)
        .single();
      setTotalXp(profile?.total_xp ?? 0);

      const { data: completions, error: completionsError } = await supabase
        .from("task_completions")
        .select("task_id, xp_awarded")
        .eq("completed_on", new Date().toISOString().slice(0, 10));

      const { data: weeklyCompletions } = await supabase
        .from("task_completions")
        .select("task_id")
        .eq("completed_on", weekStartISO());

      if (tasksError || completionsError) {
        setError("Impossible de charger les tâches. Réessaie.");
        setLoading(false);
        return;
      }

      const daily = (allTasks ?? []).filter((t) => t.frequency !== "weekly");
      const weekly = (allTasks ?? []).filter((t) => t.frequency === "weekly");

      setPool(shuffleDaily(daily));
      setWeeklyTasks(weekly);
      setDoneIds(new Set((completions ?? []).map((c) => c.task_id)));
      setWeeklyDoneIds(new Set((weeklyCompletions ?? []).map((c) => c.task_id)));
      setXpToday((completions ?? []).reduce((sum, c) => sum + c.xp_awarded, 0));
      setLoading(false);
    }
    load();
  }, [router]);

  async function completeTask(taskId: string, isWeekly: boolean) {
    setPending(taskId);
    const verified = verifyResults[taskId]?.verified ?? false;
    const { data: xpAwarded, error: rpcError } = await supabase.rpc("complete_task", {
      p_task_id: taskId,
      p_verified: verified,
    });
    setPending(null);

    if (!rpcError && typeof xpAwarded === "number") {
      let newDoneIds = doneIds;
      if (isWeekly) {
        setWeeklyDoneIds((prev) => new Set(prev).add(taskId));
      } else {
        newDoneIds = new Set(doneIds).add(taskId);
        setDoneIds(newDoneIds);
        setXpToday((prev) => prev + xpAwarded);
      }

      const newTotalXp = totalXp + xpAwarded;
      const leveledUp = levelFromTotalXp(totalXp).level !== levelFromTotalXp(newTotalXp).level;
      setTotalXp(newTotalXp);

      const allDone = !isWeekly && pool.length > 0 && pool.every((t) => newDoneIds.has(t.id));
      if (allDone) playVictory();
      else if (leveledUp) playLevelUp();
      else {
        playTaskComplete();
        playSuspense(newDoneIds.size);
      }
    }
  }

  async function handlePhoto(taskId: string, label: string, file: File | undefined) {
    if (!file) return;
    setVerifying(taskId);
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch("/api/verify-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskLabel: label, imageBase64, mimeType: file.type }),
      });
      const data = await res.json();
      setVerifyResults((prev) => ({ ...prev, [taskId]: { verified: !!data.verified, reason: data.reason ?? "" } }));
    } catch {
      setVerifyResults((prev) => ({ ...prev, [taskId]: { verified: false, reason: "Erreur réseau." } }));
    }
    setVerifying(null);
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
  const gameFinished = pool.length > 0 && pool.every((t) => doneIds.has(t.id));

  function renderTask(task: TaskRow, i: number, isDone: boolean, isWeekly: boolean) {
    const category = CATEGORIES.find((c) => c.id === task.category)!;
    const xp =
      (task.category === "detoxEcran" ? task.base_xp * 3 : task.base_xp) * (isSunday() ? 2 : 1);
    const verifyResult = verifyResults[task.id];

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: !isWeekly && i >= revealedCount - BATCH_SIZE ? (i % BATCH_SIZE) * 0.06 : 0 }}
        className={`flex items-center gap-3 border-2 border-outline rounded-sticker p-3.5 transition shadow-[0_3px_0_0_#1A1A2E] ${
          isDone ? "opacity-70" : ""
        }`}
        style={{ backgroundColor: isDone ? "#F0EAD2" : "#FFFFFF" }}
      >
        <span
          className="w-11 h-11 rounded-xl border-2 border-outline flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: categoryColors[task.category] }}
        >
          <CategoryIcon id={task.category} size={24} />
        </span>
        <button
          disabled={isDone || pending === task.id}
          onClick={() => completeTask(task.id, isWeekly)}
          className="flex-1 text-left disabled:cursor-default"
        >
          <span className={`block font-body font-semibold text-sm ${isDone ? "line-through opacity-60" : ""}`}>
            {task.label}
          </span>
          <span className="block font-mono text-[10px] opacity-50 uppercase tracking-wide">
            {category.label} · {LOCATION_LABEL[task.location]}
          </span>
          {verifyResult && !isDone && (
            <span className={`block font-mono text-[10px] mt-0.5 ${verifyResult.verified ? "text-green-600" : "opacity-60"}`}>
              {verifyResult.verified ? "✅ Preuve vérifiée par IA (+15% XP)" : `⚠️ ${verifyResult.reason || "Pas convaincant, tu peux quand même valider."}`}
            </span>
          )}
        </button>

        {!isDone && (
          <>
            <input
              ref={(el) => {
                fileInputs.current[task.id] = el;
              }}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handlePhoto(task.id, task.label, e.target.files?.[0])}
            />
            <button
              onClick={() => fileInputs.current[task.id]?.click()}
              disabled={verifying === task.id}
              title="Ajouter une preuve photo (optionnel, vérifiée par IA)"
              className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-outline bg-background flex-shrink-0 disabled:opacity-50"
            >
              {verifying === task.id ? "⏳" : "📷"}
            </button>
          </>
        )}

        <motion.span
          key={isDone ? "done" : "todo"}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="font-heading text-sm border-2 border-outline rounded-full px-2.5 py-1 shadow-[0_2px_0_0_#1A1A2E] flex-shrink-0"
          style={{ backgroundColor: isDone ? "#2ED573" : "#FFD43B", color: isDone ? "#fff" : "#1A1A2E" }}
        >
          {isDone ? "✓" : `+${isWeekly ? xp : xp}`}
        </motion.span>
      </motion.div>
    );
  }

  return (
    <Shell wide>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl">Aujourd'hui</h2>
        <span className="font-heading text-xs bg-surface border-2 border-outline rounded-full px-3 py-1 shadow-[0_2px_0_0_#1A1A2E]">
          {doneIds.size} fait{doneIds.size > 1 ? "es" : "e"}
        </span>
      </div>
      <p className="font-heading text-xl text-secondary mb-4">+{xpToday} XP aujourd'hui</p>

      <SundayBanner className="mb-6" />

      {gameFinished && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 bg-secondary text-white border-2 border-outline rounded-sticker px-3.5 py-3 mb-6 shadow-[0_3px_0_0_#1A1A2E]"
        >
          <span className="text-xl">🏆</span>
          <p className="font-heading text-sm leading-snug">
            Jeu terminé pour aujourd'hui ! Toutes les tâches sont faites, reviens demain pour de nouvelles tâches.
          </p>
        </motion.div>
      )}

      <div className="flex items-center gap-2.5 bg-surface border-2 border-outline rounded-sticker px-3.5 py-2.5 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
        <span className="text-lg">🤖</span>
        <p className="font-body text-xs leading-snug">
          Ajoute une <strong>photo preuve</strong> (📷) sur une tâche : une IA la vérifie et te donne <strong>+15% XP</strong> si c'est convaincant.
        </p>
      </div>

      {error ? (
        <p className="text-center">{error}</p>
      ) : pool.length === 0 ? (
        <p className="text-center opacity-60">Aucune tâche disponible pour le moment.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3">
            <AnimatePresence initial={false}>
              {visible.map((task, i) => renderTask(task, i, doneIds.has(task.id), false))}
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

      {weeklyTasks.length > 0 && (
        <>
          <h2 className="font-heading text-xl mt-8 mb-3">📅 Défis de la semaine</h2>
          <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3">
            {weeklyTasks.map((task, i) => renderTask(task, i, weeklyDoneIds.has(task.id), true))}
          </div>
        </>
      )}
    </Shell>
  );
}
