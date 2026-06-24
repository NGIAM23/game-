"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, type CategoryId } from "@luavio/shared";
import Shell from "@/components/Shell";
import { playClick } from "@/lib/sound";

interface Wrapped {
  month_label: string;
  total_tasks: number;
  total_xp: number;
  verified_count: number;
  top_category: string | null;
  top_category_count: number;
  busiest_weekday: string | null;
  longest_streak_in_month: number;
  current_streak: number;
}

function categoryInfo(id: string | null) {
  return CATEGORIES.find((c) => c.id === (id as CategoryId)) ?? { label: id ?? "—", icon: "✨" };
}

export default function WrappedPage() {
  const router = useRouter();
  const [data, setData] = useState<Wrapped | null>(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }
      const { data: rows } = await supabase.rpc("get_monthly_wrapped");
      if (rows && rows.length > 0) setData(rows[0] as Wrapped);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  if (!data || data.total_tasks === 0)
    return (
      <Shell>
        <p className="text-center font-heading">Pas encore assez d'activité ce mois-ci pour ton Wrapped !</p>
      </Shell>
    );

  const cat = categoryInfo(data.top_category);
  const slides = [
    {
      emoji: "🎉",
      title: data.month_label,
      body: "Ton récap du mois est prêt !",
    },
    {
      emoji: "✅",
      title: `${data.total_tasks} tâches`,
      body: "complétées ce mois-ci",
    },
    {
      emoji: "✨",
      title: `${data.total_xp} XP`,
      body: "gagnés ce mois-ci",
    },
    {
      emoji: cat.icon ?? "🏆",
      title: cat.label,
      body: `Ta catégorie préférée — ${data.top_category_count} tâche${data.top_category_count > 1 ? "s" : ""}`,
    },
    {
      emoji: "📅",
      title: data.busiest_weekday ?? "—",
      body: "Ton jour le plus actif",
    },
    {
      emoji: "🔥",
      title: `${data.longest_streak_in_month} jours`,
      body: "Ta plus longue série ce mois-ci",
    },
    {
      emoji: "🚀",
      title: `${data.current_streak} jours`,
      body: "Ta série en cours — continue comme ça !",
    },
  ];

  const isLast = slide === slides.length - 1;
  const s = slides[slide];

  return (
    <Shell>
      <div className="flex gap-1.5 mb-4">
        {slides.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= slide ? "bg-secondary" : "bg-outline/20"}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-secondary text-white border-[3px] border-outline rounded-sticker p-8 text-center shadow-[0_5px_0_0_#1A1A2E] min-h-[280px] flex flex-col items-center justify-center"
        >
          <div className="text-5xl mb-4">{s.emoji}</div>
          <div className="font-heading text-2xl mb-2">{s.title}</div>
          <div className="font-body text-sm opacity-85">{s.body}</div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-5">
        {slide > 0 && (
          <button
            onClick={() => {
              playClick();
              setSlide((n) => n - 1);
            }}
            className="flex-1 font-heading bg-background border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
          >
            ← Retour
          </button>
        )}
        <button
          onClick={() => {
            if (isLast) {
              router.push("/dashboard");
              return;
            }
            playClick();
            setSlide((n) => n + 1);
          }}
          className="flex-1 font-heading bg-primary border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
        >
          {isLast ? "Terminer" : "Suivant →"}
        </button>
      </div>
    </Shell>
  );
}
