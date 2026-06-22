"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, type CategoryId } from "@luavio/shared";

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

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }

      const { data: allTasks } = await supabase
        .from("tasks")
        .select("id, category, label, base_xp")
        .limit(DAILY_COUNT);

      const { data: completions } = await supabase
        .from("task_completions")
        .select("task_id, xp_awarded")
        .eq("completed_on", new Date().toISOString().slice(0, 10));

      setTasks(allTasks ?? []);
      setDoneIds(new Set((completions ?? []).map((c) => c.task_id)));
      setXpToday((completions ?? []).reduce((sum, c) => sum + c.xp_awarded, 0));
      setLoading(false);
    }
    load();
  }, [router]);

  async function completeTask(taskId: string) {
    setPending(taskId);
    const { data: xpAwarded, error } = await supabase.rpc("complete_task", { p_task_id: taskId });
    setPending(null);

    if (!error && typeof xpAwarded === "number") {
      setDoneIds((prev) => new Set(prev).add(taskId));
      setXpToday((prev) => prev + xpAwarded);
    }
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center">Chargement...</main>;

  return (
    <main className="min-h-screen px-6 py-12 max-w-xl mx-auto">
      <h1 className="font-heading text-3xl text-center mb-2 text-secondary">+{xpToday} XP aujourd'hui</h1>
      <p className="text-center text-sm opacity-60 mb-8">Tâches du jour</p>

      <div className="flex flex-col gap-3">
        {tasks.map((task) => {
          const category = CATEGORIES.find((c) => c.id === task.category)!;
          const isDone = doneIds.has(task.id);
          return (
            <button
              key={task.id}
              disabled={isDone || pending === task.id}
              onClick={() => completeTask(task.id)}
              className="flex items-center gap-3 bg-surface border-2 border-outline rounded-sticker p-4 text-left disabled:opacity-50"
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="flex-1">
                <span className="block font-body font-semibold">{task.label}</span>
                <span className="block text-xs opacity-60">
                  +{task.category === "detoxEcran" ? task.base_xp * 3 : task.base_xp} XP
                </span>
              </span>
              <span className="text-xl">{isDone ? "✅" : "⬜"}</span>
            </button>
          );
        })}
      </div>

      <button onClick={() => router.push("/dashboard")} className="block mx-auto text-sm underline text-secondary mt-8">
        Voir mon profil
      </button>
    </main>
  );
}
