"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, categoryColors, type CategoryId } from "@luavio/shared";
import BottomNav from "@/components/BottomNav";

interface TaskRow {
  id: string;
  category: CategoryId;
  label: string;
  base_xp: number;
}

// 3 tâches quotidiennes gratuites (cf docs/22_RECAP_FINAL.md §3) : on en tire 3 du pool.
const DAILY_COUNT = 3;

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
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
        .select("id, category, label, base_xp")
        .limit(DAILY_COUNT);

      const { data: completions, error: completionsError } = await supabase
        .from("task_completions")
        .select("task_id, xp_awarded")
        .eq("completed_on", new Date().toISOString().slice(0, 10));

      if (tasksError || completionsError) {
        setError("Impossible de charger les tâches. Réessaie.");
        setLoading(false);
        return;
      }

      setTasks(allTasks ?? []);
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

  if (loading) return <main className="min-h-screen flex items-center justify-center">Chargement...</main>;

  return (
    <main className="min-h-screen px-6 pb-28">
      <div className="max-w-xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl">Aujourd'hui</h2>
          <span className="font-heading text-xs bg-surface border-2 border-outline rounded-full px-3 py-1 shadow-[0_2px_0_0_#1A1A2E]">
            {doneIds.size} / {tasks.length}
          </span>
        </div>
        <p className="font-heading text-xl text-secondary mb-6">+{xpToday} XP aujourd'hui</p>

        {error ? (
          <p className="text-center">{error}</p>
        ) : tasks.length === 0 ? (
          <p className="text-center opacity-60">Aucune tâche disponible pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => {
              const category = CATEGORIES.find((c) => c.id === task.category)!;
              const isDone = doneIds.has(task.id);
              const xp = task.category === "detoxEcran" ? task.base_xp * 3 : task.base_xp;
              return (
                <button
                  key={task.id}
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
                      {category.label}
                    </span>
                  </span>
                  <span
                    className="font-heading text-sm border-2 border-outline rounded-full px-2.5 py-1 shadow-[0_2px_0_0_#1A1A2E]"
                    style={{ backgroundColor: isDone ? "#2ED573" : "#FFD43B", color: isDone ? "#fff" : "#1A1A2E" }}
                  >
                    {isDone ? "✓" : `+${xp}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
