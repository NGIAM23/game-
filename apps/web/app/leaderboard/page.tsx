"use client";

import { useEffect, useState } from "react";
import { levelFromTotalXp, rankFromLevel } from "@luavio/shared";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";

interface Row {
  pseudo: string;
  total_xp: number;
}

const PODIUM_BG = ["#FFD43B", "#E8E8E8", "#F4B98A"];

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      const { data: myProfile } = session.session
        ? await supabase.from("profiles").select("pseudo").eq("id", session.session.user.id).single()
        : { data: null };
      setMe(myProfile?.pseudo ?? null);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("pseudo, total_xp")
        .not("pseudo", "is", null)
        .order("total_xp", { ascending: false })
        .limit(10);

      if (fetchError) {
        setError("Impossible de charger le classement.");
      } else {
        setRows(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const [first, second, third, ...rest] = rows;

  return (
    <main className="min-h-screen px-6 pb-28">
      <div className="max-w-xl mx-auto pt-8">
        <h1 className="font-heading text-3xl text-center mb-1">
          Le <span className="text-secondary">classement</span>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center mb-6">Top 10</p>

        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : error ? (
          <p className="text-center">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-center opacity-60">Personne pour l'instant. Sois le premier !</p>
        ) : (
          <>
            {first && (
              <div className="grid grid-cols-3 gap-2 items-end mb-6" style={{ height: 170 }}>
                <PodiumSpot row={second} place={2} bg={PODIUM_BG[1]} heightPct={75} />
                <PodiumSpot row={first} place={1} bg={PODIUM_BG[0]} heightPct={100} big />
                <PodiumSpot row={third} place={3} bg={PODIUM_BG[2]} heightPct={60} />
              </div>
            )}

            <ol className="flex flex-col gap-2">
              {rest.map((row, i) => {
                const { level } = levelFromTotalXp(row.total_xp);
                const isMe = row.pseudo === me;
                return (
                  <li
                    key={row.pseudo}
                    className="flex items-center gap-3 border-2 border-outline rounded-sticker p-3 shadow-[0_2px_0_0_#1A1A2E]"
                    style={{ backgroundColor: isMe ? "#FFD43B" : "#FFFFFF" }}
                  >
                    <span className="font-heading w-8 text-center opacity-50">{i + 4}</span>
                    <span className="flex-1 font-body font-semibold">
                      {isMe ? "Toi · " : "@"}
                      {row.pseudo}
                    </span>
                    <span className="text-sm opacity-60">Niv. {level}</span>
                    <span className="text-xs text-secondary font-semibold">{rankFromLevel(level)}</span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function PodiumSpot({
  row,
  place,
  bg,
  heightPct,
  big,
}: {
  row?: Row;
  place: number;
  bg: string;
  heightPct: number;
  big?: boolean;
}) {
  if (!row) return <div />;
  const { level } = levelFromTotalXp(row.total_xp);
  return (
    <div
      className="relative border-[3px] border-outline rounded-t-2xl text-center shadow-[0_4px_0_0_#1A1A2E] flex flex-col items-center justify-end pb-2"
      style={{ backgroundColor: bg, height: `${heightPct}%` }}
    >
      <div className="absolute -top-3 -right-2 bg-white border-2 border-outline w-6 h-6 rounded-full flex items-center justify-center font-heading text-xs shadow-[0_2px_0_0_#1A1A2E]">
        {place === 1 ? "👑" : place}
      </div>
      <div
        className={`bg-white border-2 border-outline rounded-full flex items-center justify-center mb-1.5 shadow-[0_2px_0_0_#1A1A2E] ${
          big ? "w-12 h-12 text-2xl" : "w-10 h-10 text-xl"
        }`}
      >
        🧑
      </div>
      <div className="font-heading text-xs truncate px-1 max-w-full">@{row.pseudo}</div>
      <div className="font-mono text-[10px] font-bold">Niv. {level}</div>
    </div>
  );
}
