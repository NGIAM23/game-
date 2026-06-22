"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { levelFromTotalXp, rankFromLevel, colors } from "@luavio/shared";
import { supabase } from "@/lib/supabase";

interface Row {
  pseudo: string;
  total_xp: number;
}

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("pseudo, total_xp")
      .not("pseudo", "is", null)
      .order("total_xp", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen px-6 py-12 max-w-xl mx-auto">
      <h1 className="font-heading text-3xl text-center mb-8" style={{ color: colors.outline }}>
        Top 10
      </h1>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="text-center opacity-60">Personne pour l'instant. Sois le premier !</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {rows.map((row, i) => {
            const { level } = levelFromTotalXp(row.total_xp);
            return (
              <li
                key={row.pseudo}
                className="flex items-center gap-3 bg-surface border-2 border-outline rounded-sticker p-3"
              >
                <span className="font-heading w-8 text-center">{i + 1}</span>
                <span className="flex-1 font-body font-semibold">@{row.pseudo}</span>
                <span className="text-sm opacity-60">Niv. {level}</span>
                <span className="text-xs" style={{ color: colors.secondary }}>
                  {rankFromLevel(level)}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <Link href="/dashboard" className="block text-center text-sm underline mt-8" style={{ color: colors.secondary }}>
        Retour au profil
      </Link>
    </main>
  );
}
