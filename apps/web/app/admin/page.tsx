"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@luavio/shared";
import Shell from "@/components/Shell";

interface StatRow {
  category: string;
  completions: number;
  pct: number;
}

export default function Admin() {
  const router = useRouter();
  const [stats, setStats] = useState<StatRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.session.user.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/dashboard");
        return;
      }

      const { data, error: rpcError } = await supabase.rpc("category_stats");
      if (rpcError) {
        setError("Impossible de charger les statistiques.");
      } else {
        setStats(data ?? []);
      }
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

  return (
    <Shell wide>
      <h1 className="font-heading text-3xl text-center mb-1">
        Stats <span className="text-secondary">catégories</span>
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center mb-6">
        Réservé au propriétaire · % des tâches complétées
      </p>

      {error ? (
        <p className="text-center">{error}</p>
      ) : !stats || stats.length === 0 ? (
        <p className="text-center opacity-60">Pas encore de données.</p>
      ) : (
        <div className="flex flex-col gap-2 max-w-2xl mx-auto">
          {stats.map((row, i) => {
            const cat = CATEGORIES.find((c) => c.id === row.category);
            return (
              <motion.div
                key={row.category}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.04 * i }}
                className="bg-surface border-2 border-outline rounded-sticker p-3.5 shadow-[0_3px_0_0_#1A1A2E]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body font-semibold text-sm">
                    {cat?.icon ?? "❓"} {cat?.label ?? row.category}
                  </span>
                  <span className="font-heading text-sm">{row.pct}%</span>
                </div>
                <div className="h-3 bg-background border-2 border-outline rounded-full overflow-hidden mb-1.5">
                  <motion.div
                    className="h-full bg-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 + 0.04 * i }}
                  />
                </div>
                <span className="font-mono text-[10px] opacity-50">{row.completions} complétions</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
