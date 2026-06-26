"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  levelFromTotalXp,
  rankFromLevel,
  isSunday,
  RANK_TIERS,
  tierForLevel,
  subTierForLevel,
  VAR_CITIES,
  PILOT_CITY,
} from "@luavio/shared";
import { supabase } from "@/lib/supabase";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
import RankBadge from "@/components/RankBadge";

interface Row {
  pseudo: string;
  avatar_seed: string | null;
  total_xp: number;
}

interface CityRow extends Row {
  city: string | null;
}

const DEFAULT_CITY = PILOT_CITY;

interface SundayRow {
  pseudo: string;
  avatar_seed: string | null;
  sunday_xp: number;
}

const PODIUM_BG = ["#FFD43B", "#E8E8E8", "#F4B98A"];
const TABS = ["Global", "Ville", "Dimanche", "Amis", "Mon rang"];

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [sundayRows, setSundayRows] = useState<SundayRow[]>([]);
  const [friendRows, setFriendRows] = useState<Row[]>([]);
  const [myTotalXp, setMyTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [tab, setTab] = useState("Global");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);
  const [allCityRows, setAllCityRows] = useState<CityRow[]>([]);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      const { data: myProfile } = session.session
        ? await supabase.from("profiles").select("pseudo, total_xp").eq("id", session.session.user.id).single()
        : { data: null };
      setMe(myProfile?.pseudo ?? null);
      setMyTotalXp(myProfile?.total_xp ?? 0);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("pseudo, avatar_seed, total_xp")
        .not("pseudo", "is", null)
        .order("total_xp", { ascending: false })
        .limit(10);

      if (fetchError) {
        setError("Impossible de charger le classement.");
      } else {
        setRows(data ?? []);
      }

      const { data: cityData } = await supabase
        .from("profiles")
        .select("pseudo, avatar_seed, total_xp, city")
        .not("pseudo", "is", null)
        .not("city", "is", null)
        .order("total_xp", { ascending: false })
        .limit(500);
      const fetchedCityRows = (cityData ?? []) as CityRow[];
      const distinctCities = Array.from(new Set(fetchedCityRows.map((r) => r.city as string)));
      const otherCities = Array.from(new Set([...VAR_CITIES, ...distinctCities].filter((c) => c !== DEFAULT_CITY))).sort();
      setCities([DEFAULT_CITY, ...otherCities]);
      setAllCityRows(fetchedCityRows);

      if (isSunday()) {
        const { data: sundayData } = await supabase.rpc("sunday_leaderboard");
        setSundayRows(sundayData ?? []);
      }

      if (session.session) {
        const userId = session.session.user.id;
        const { data: links } = await supabase
          .from("friends")
          .select("requester, addressee")
          .eq("status", "accepted")
          .or(`requester.eq.${userId},addressee.eq.${userId}`);
        const friendIds = (links ?? []).map((l) => (l.requester === userId ? l.addressee : l.requester));
        if (friendIds.length > 0) {
          const { data: friendProfiles } = await supabase
            .from("profiles")
            .select("pseudo, avatar_seed, total_xp")
            .in("id", friendIds)
            .order("total_xp", { ascending: false });
          setFriendRows(friendProfiles ?? []);
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  const activeRows: { pseudo: string; avatar_seed: string | null; xp: number }[] =
    tab === "Dimanche"
      ? sundayRows.map((r) => ({ pseudo: r.pseudo, avatar_seed: r.avatar_seed, xp: r.sunday_xp }))
      : tab === "Amis"
      ? friendRows.map((r) => ({ pseudo: r.pseudo, avatar_seed: r.avatar_seed, xp: r.total_xp }))
      : tab === "Ville"
      ? allCityRows
          .filter((r) => r.city === selectedCity)
          .slice(0, 10)
          .map((r) => ({ pseudo: r.pseudo, avatar_seed: r.avatar_seed, xp: r.total_xp }))
      : rows.map((r) => ({ pseudo: r.pseudo, avatar_seed: r.avatar_seed, xp: r.total_xp }));

  const [first, second, third, ...rest] = activeRows;

  return (
    <Shell wide>
      <h1 className="font-heading text-3xl text-center mb-1">
        Le <span className="text-secondary">classement</span>
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center mb-5">Top 10 · Saison en cours</p>

      <div className="flex gap-1 mb-5 bg-surface border-2 border-outline rounded-full p-1 shadow-[0_3px_0_0_#1A1A2E] max-w-md mx-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-center font-heading text-xs py-2 rounded-full transition disabled:opacity-40 ${
              tab === t ? "bg-secondary text-white" : "text-outline opacity-50 hover:opacity-80"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Ville" && (
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="font-heading text-sm">🏙️</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="font-body text-sm bg-surface border-2 border-outline rounded-sticker px-3 py-1.5 shadow-[0_2px_0_0_#1A1A2E]"
          >
            {(cities.includes(selectedCity) ? cities : [selectedCity, ...cities]).map((c) => (
              <option key={c} value={c}>
                {c === PILOT_CITY ? `🏆 ${c} (ville pilote)` : c}
              </option>
            ))}
          </select>
        </div>
      )}

      {tab !== "Mon rang" && (
        <div className="bg-secondary text-white border-[3px] border-outline rounded-sticker px-4 py-3 mb-6 shadow-[0_4px_0_0_#1A1A2E] flex items-center gap-3 max-w-2xl mx-auto">
          <span className="text-2xl">🏆</span>
          <div className="text-xs leading-snug font-semibold">
            <strong className="font-heading text-sm block mb-0.5">TOP 10 DIMANCHE</strong>
            Cosmétiques · ⚡ Sparks · pass gratuits pour le top 10
          </div>
        </div>
      )}

      {tab === "Mon rang" ? (
        <RankTab totalXp={myTotalXp} />
      ) : loading ? (
        <p className="text-center font-heading">Chargement...</p>
      ) : error ? (
        <p className="text-center">{error}</p>
      ) : tab === "Dimanche" && !isSunday() ? (
        <p className="text-center opacity-60">La Course du Dimanche revient... dimanche. ☀️</p>
      ) : tab === "Amis" && activeRows.length === 0 ? (
        <p className="text-center opacity-60">Ajoute des amis pour les voir ici. 👥</p>
      ) : tab === "Ville" && activeRows.length === 0 ? (
        <p className="text-center opacity-60">Personne à {selectedCity} pour l'instant. Renseigne ta ville dans ton profil pour être le premier ! 🏙️</p>
      ) : activeRows.length === 0 ? (
        <p className="text-center opacity-60">Personne pour l'instant. Sois le premier !</p>
      ) : (
        <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:items-start">
          <div>
            {first && (
              <div className="grid grid-cols-3 gap-2 lg:gap-3 items-end mb-6" style={{ height: 190 }}>
                <PodiumSpot row={second} place={2} bg={PODIUM_BG[1]} heightPct={75} delay={0.1} />
                <PodiumSpot row={first} place={1} bg={PODIUM_BG[0]} heightPct={100} big delay={0} />
                <PodiumSpot row={third} place={3} bg={PODIUM_BG[2]} heightPct={60} delay={0.2} />
              </div>
            )}
          </div>

          <ol className="flex flex-col gap-2">
            {rest.map((row, i) => {
              const { level } = levelFromTotalXp(row.xp);
              const isMe = row.pseudo === me;
              return (
                <motion.li
                  key={row.pseudo}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                  className="flex items-center gap-3 border-2 border-outline rounded-sticker p-3 shadow-[0_2px_0_0_#1A1A2E]"
                  style={{ backgroundColor: isMe ? "#FFD43B" : "#FFFFFF" }}
                >
                  <span className="font-heading w-8 text-center opacity-50">{i + 4}</span>
                  <Avatar seed={row.avatar_seed || row.pseudo} size={32} />
                  <span className="flex-1 font-body font-semibold">
                    {isMe ? "Toi · " : "@"}
                    {row.pseudo}
                  </span>
                  <span className="text-sm opacity-60">Niv. {level}</span>
                  <span className="text-xs text-secondary font-semibold">{rankFromLevel(level)}</span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      )}
    </Shell>
  );
}

function PodiumSpot({
  row,
  place,
  bg,
  heightPct,
  big,
  delay,
}: {
  row?: { pseudo: string; avatar_seed: string | null; xp: number };
  place: number;
  bg: string;
  heightPct: number;
  big?: boolean;
  delay: number;
}) {
  if (!row) return <div />;
  const { level } = levelFromTotalXp(row.xp);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, type: "spring", bounce: 0.35 }}
      className="relative border-[3px] border-outline rounded-t-2xl text-center shadow-[0_4px_0_0_#1A1A2E] flex flex-col items-center justify-end pb-2"
      style={{ backgroundColor: bg, height: `${heightPct}%` }}
    >
      <div className="absolute -top-3 -right-2 bg-white border-2 border-outline w-6 h-6 rounded-full flex items-center justify-center font-heading text-xs shadow-[0_2px_0_0_#1A1A2E]">
        {place === 1 ? "👑" : place}
      </div>
      <Avatar seed={row.avatar_seed || row.pseudo} size={big ? 48 : 40} className="mb-1.5 shadow-[0_2px_0_0_#1A1A2E]" />
      <div className="font-heading text-xs truncate px-1 max-w-full">@{row.pseudo}</div>
      <div className="font-mono text-[10px] font-bold">Niv. {level}</div>
    </motion.div>
  );
}

function RankTab({ totalXp }: { totalXp: number }) {
  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(totalXp);
  const rank = rankFromLevel(level);
  const currentTier = tierForLevel(level);
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-secondary border-[3px] border-outline rounded-sticker p-6 lg:p-8 text-center text-white shadow-[0_5px_0_0_#1A1A2E] lg:sticky lg:top-12"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 100%, rgba(255,212,59,0.4), transparent 60%)" }}
        />
        <div className="relative">
          <motion.div
            initial={{ rotate: -8, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-20 h-20 rounded-full mx-auto mb-3 border-[3px] border-outline flex items-center justify-center shadow-[0_4px_0_0_#1A1A2E]"
            style={{ backgroundColor: "#FFD43B" }}
          >
            <RankBadge tier={currentTier.name} size={48} />
          </motion.div>
          <div className="font-heading text-2xl mb-1">{rank}</div>
          <div className="font-mono text-xs uppercase tracking-widest opacity-85 mb-3">
            Niveau {level} · {totalXp} XP
          </div>
          <div className="h-3 bg-black/30 border-2 border-outline rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-primary border-r-2 border-outline"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <div className="font-mono text-[11px] flex justify-between opacity-90">
            <span>{rank}</span>
            <span>
              <strong className="text-primary">{xpIntoLevel}</strong> / {xpForNextLevel} XP
            </span>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-1.5">
        {RANK_TIERS.map((tier, i) => {
          const isCurrent = tier.name === currentTier.name;
          const isPast = level > tier.maxLevel;
          const sub = isCurrent ? subTierForLevel(level, tier) : null;
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={`flex items-center gap-3 p-2.5 bg-surface border-2 border-outline rounded-sticker ${
                isCurrent ? "shadow-[0_4px_0_0_#1A1A2E] border-[3px]" : "shadow-[0_2px_0_0_#1A1A2E]"
              } ${!isCurrent && !isPast ? "opacity-40" : ""}`}
              style={isCurrent ? { backgroundColor: "#FFD43B" } : undefined}
            >
              <div className="w-9 h-9 flex-shrink-0">
                <RankBadge tier={tier.name} size={36} />
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm leading-none mb-0.5">{tier.name} I → IV</div>
                <div className="font-mono text-[10px] opacity-60">
                  Niv. {tier.minLevel}-{tier.maxLevel === Infinity ? "+" : tier.maxLevel}
                </div>
              </div>
              <div
                className={`font-mono text-[10px] font-semibold px-2 py-1 rounded-full border ${
                  isCurrent ? "bg-secondary text-white border-secondary" : "bg-background border-outline"
                }`}
              >
                {isCurrent ? `EN COURS · ${sub}` : isPast ? "✓ Acquis" : "À venir"}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
