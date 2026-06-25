"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
import { playMissionSuspense, playDuelVictory, playError } from "@/lib/sound";

interface DuelRow {
  id: string;
  mode: "distance" | "reel";
  challenger_id: string;
  opponent_id: string;
  status: "pending" | "declined" | "meeting" | "active" | "finished" | "cancelled";
  duration_minutes: number;
  challenger_lat: number | null;
  challenger_lng: number | null;
  opponent_lat: number | null;
  opponent_lng: number | null;
  meeting_lat: number | null;
  meeting_lng: number | null;
  meeting_candidates: { label: string; lat: number; lng: number; distance: number }[] | null;
  chosen_lat: number | null;
  chosen_lng: number | null;
  chosen_label: string | null;
  challenger_ready: boolean;
  opponent_ready: boolean;
  started_at: string | null;
  ends_at: string | null;
  winner_id: string | null;
  xp_boost_minutes: number;
}

interface MissionRow {
  mission_id: string;
  label: string;
}

interface MiniProfile {
  pseudo: string;
  avatar_seed: string | null;
}

interface MeetingCandidate {
  label: string;
  lat: number;
  lng: number;
  distance: number;
}

interface VerifyResult {
  verified: boolean;
  reason: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(lat1: number, lng1: number, lat2: number, lng2: number) {
  const y = Math.sin(((lng2 - lng1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lng2 - lng1) * Math.PI) / 180);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Géolocalisation indisponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
  });
}

export default function DuelPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const duelId = params.id;

  const [meId, setMeId] = useState<string | null>(null);
  const [duel, setDuel] = useState<DuelRow | null>(null);
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [myCompleted, setMyCompleted] = useState<Set<string>>(new Set());
  const [oppCompleted, setOppCompleted] = useState<Set<string>>(new Set());
  const [challengerProfile, setChallengerProfile] = useState<MiniProfile | null>(null);
  const [opponentProfile, setOpponentProfile] = useState<MiniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [burst, setBurst] = useState<number | null>(null);
  const [choosingSpot, setChoosingSpot] = useState(false);
  const [verifyResults, setVerifyResults] = useState<Record<string, VerifyResult>>({});
  const [verifying, setVerifying] = useState<string | null>(null);
  const finishingRef = useRef(false);
  const candidatesFetchedRef = useRef(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      router.push("/auth");
      return;
    }
    setMeId(session.session.user.id);

    const { data: duelData } = await supabase.from("duels").select("*").eq("id", duelId).single();
    if (!duelData) {
      setError("Ce duel n'existe pas ou plus.");
      setLoading(false);
      return;
    }
    setDuel(duelData);

    const [{ data: assignments }, { data: progress }, { data: profiles }] = await Promise.all([
      supabase.from("duel_assignments").select("mission_id, duel_missions(label)").eq("duel_id", duelId),
      supabase.from("duel_progress").select("user_id, mission_id").eq("duel_id", duelId),
      supabase
        .from("profiles")
        .select("id, pseudo, avatar_seed")
        .in("id", [duelData.challenger_id, duelData.opponent_id]),
    ]);

    setMissions(
      (assignments ?? []).map((a) => {
        const rel = a.duel_missions as unknown as { label: string } | { label: string }[] | null;
        const label = Array.isArray(rel) ? rel[0]?.label : rel?.label;
        return { mission_id: a.mission_id, label: label ?? a.mission_id };
      })
    );

    const mine = new Set<string>();
    const theirs = new Set<string>();
    for (const p of progress ?? []) {
      if (p.user_id === session.session.user.id) mine.add(p.mission_id);
      else theirs.add(p.mission_id);
    }
    setMyCompleted(mine);
    setOppCompleted(theirs);

    const challenger = (profiles ?? []).find((p) => p.id === duelData.challenger_id);
    const opponent = (profiles ?? []).find((p) => p.id === duelData.opponent_id);
    setChallengerProfile(challenger ? { pseudo: challenger.pseudo, avatar_seed: challenger.avatar_seed } : null);
    setOpponentProfile(opponent ? { pseudo: opponent.pseudo, avatar_seed: opponent.avatar_seed } : null);
    setLoading(false);
  }, [duelId, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const poll = setInterval(load, 3000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  const isChallenger = meId === duel?.challenger_id;
  const me = isChallenger ? challengerProfile : opponentProfile;
  const opp = isChallenger ? opponentProfile : challengerProfile;
  const myReady = isChallenger ? duel?.challenger_ready : duel?.opponent_ready;
  const oppReady = isChallenger ? duel?.opponent_ready : duel?.challenger_ready;

  async function respond(accept: boolean) {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("respond_duel", { p_duel_id: duelId, p_accept: accept });
    setBusy(false);
    if (rpcError) setError("Action impossible, réessaie.");
    else load();
  }

  async function submitLocation() {
    setBusy(true);
    setError(null);
    try {
      const pos = await getPosition();
      const { error: rpcError } = await supabase.rpc("submit_duel_location", {
        p_duel_id: duelId,
        p_lat: pos.coords.latitude,
        p_lng: pos.coords.longitude,
        p_accuracy_m: pos.coords.accuracy,
      });
      if (rpcError) throw rpcError;
      await load();
    } catch {
      setError("Impossible de récupérer ta position. Autorise la géolocalisation pour jouer en réel.");
    }
    setBusy(false);
  }

  async function chooseSpot(c: MeetingCandidate) {
    setChoosingSpot(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("choose_duel_meeting_spot", {
      p_duel_id: duelId,
      p_lat: c.lat,
      p_lng: c.lng,
      p_label: c.label,
    });
    setChoosingSpot(false);
    if (rpcError) setError("Impossible de choisir ce lieu, réessaie.");
    else load();
  }

  async function confirmArrival() {
    setBusy(true);
    setError(null);
    try {
      const pos = await getPosition();
      const { error: rpcError } = await supabase.rpc("confirm_duel_arrival", {
        p_duel_id: duelId,
        p_lat: pos.coords.latitude,
        p_lng: pos.coords.longitude,
        p_accuracy_m: pos.coords.accuracy,
      });
      if (rpcError) throw rpcError;
      await load();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Tu es trop loin du point de rendez-vous.");
    }
    setBusy(false);
  }

  async function completeMission(missionId: string) {
    let comboIndex = 0;
    setMyCompleted((prev) => {
      const next = new Set(prev).add(missionId);
      comboIndex = next.size;
      return next;
    });
    setBurst(Date.now());
    playMissionSuspense(comboIndex);
    const { error: rpcError } = await supabase.rpc("complete_duel_mission", { p_duel_id: duelId, p_mission_id: missionId });
    if (rpcError) playError();
    load();
  }

  async function handlePhoto(missionId: string, label: string, file: File | undefined) {
    if (!file) return;
    setVerifying(missionId);
    try {
      const imageBase64 = await fileToBase64(file);
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch("/api/verify-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskLabel: label,
          imageBase64,
          mimeType: file.type,
          accessToken: session.session?.access_token,
        }),
      });
      const data = await res.json();
      const verified = !!data.verified;
      setVerifyResults((prev) => ({ ...prev, [missionId]: { verified, reason: data.reason ?? "" } }));
      if (verified) {
        await completeMission(missionId);
      } else {
        playError();
      }
    } catch {
      setVerifyResults((prev) => ({ ...prev, [missionId]: { verified: false, reason: "Erreur réseau." } }));
      playError();
    }
    setVerifying(null);
  }

  useEffect(() => {
    if (!duel || duel.status !== "meeting") return;
    if (duel.meeting_lat === null || duel.meeting_lng === null) return;
    if (duel.meeting_candidates !== null) return;
    if (candidatesFetchedRef.current) return;
    candidatesFetchedRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/duel/meeting-spots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: duel.meeting_lat, lng: duel.meeting_lng }),
        });
        const data = await res.json();
        await supabase.rpc("set_duel_meeting_candidates", {
          p_duel_id: duelId,
          p_candidates: data.candidates ?? [],
        });
      } catch {
        await supabase.rpc("set_duel_meeting_candidates", { p_duel_id: duelId, p_candidates: [] });
      }
      load();
    })();
  }, [duel, duelId, load]);

  useEffect(() => {
    if (!duel || duel.status !== "active" || !duel.ends_at) return;
    if (new Date(duel.ends_at).getTime() > now) return;
    if (finishingRef.current) return;
    finishingRef.current = true;
    Promise.resolve(supabase.rpc("finish_duel", { p_duel_id: duelId })).then(() => {
      load();
      finishingRef.current = false;
    });
  }, [duel, now, duelId, load]);

  const finishedSoundRef = useRef(false);
  useEffect(() => {
    if (duel?.status !== "finished" || finishedSoundRef.current) return;
    finishedSoundRef.current = true;
    if (duel.winner_id === meId) playDuelVictory();
  }, [duel, meId]);

  if (loading)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  if (error && !duel)
    return (
      <Shell>
        <p className="text-center font-heading">{error}</p>
      </Shell>
    );

  if (!duel) return null;

  const myLocSubmitted = isChallenger ? duel.challenger_lat !== null : duel.opponent_lat !== null;
  const myLat = isChallenger ? duel.challenger_lat : duel.opponent_lat;
  const myLng = isChallenger ? duel.challenger_lng : duel.opponent_lng;
  const chosenLat = duel.chosen_lat;
  const chosenLng = duel.chosen_lng;
  const hasPositions = myLat !== null && myLng !== null && chosenLat !== null && chosenLng !== null;
  const myMeters = hasPositions ? haversineMeters(myLat as number, myLng as number, chosenLat as number, chosenLng as number) : null;
  const myBearing = hasPositions ? bearingDeg(myLat as number, myLng as number, chosenLat as number, chosenLng as number) : 0;
  const candidates = (duel.meeting_candidates ?? []) as MeetingCandidate[];

  const remainingMs = duel.ends_at ? Math.max(0, new Date(duel.ends_at).getTime() - now) : 0;
  const remainingMin = Math.floor(remainingMs / 60000);
  const remainingSec = Math.floor((remainingMs % 60000) / 1000);

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col items-center gap-1">
          <Avatar seed={me?.avatar_seed || me?.pseudo || "me"} size={48} />
          <span className="font-heading text-xs">@{me?.pseudo ?? "toi"}</span>
        </div>
        <span className="font-heading text-2xl">⚔️</span>
        <div className="flex flex-col items-center gap-1">
          <Avatar seed={opp?.avatar_seed || opp?.pseudo || "ami"} size={48} />
          <span className="font-heading text-xs">@{opp?.pseudo ?? "ami"}</span>
        </div>
      </div>

      {error && <p className="text-sm text-center mb-4 text-cat-corps font-body">{error}</p>}

      {duel.status === "pending" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border-2 border-outline rounded-sticker p-6 text-center shadow-[0_3px_0_0_#1A1A2E]">
          {meId === duel.opponent_id ? (
            <>
              <h2 className="font-heading text-lg mb-1">Tu es défié en duel {duel.mode === "reel" ? "réel" : "à distance"} !</h2>
              <p className="font-mono text-[11px] opacity-50 mb-4">5 missions surprises, {duel.duration_minutes} min pour marquer le plus de points.</p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => respond(true)}
                  disabled={busy}
                  className="flex-1 font-heading bg-primary border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
                >
                  ✓ Accepter
                </button>
                <button
                  onClick={() => respond(false)}
                  disabled={busy}
                  className="flex-1 font-heading bg-background border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
                >
                  ✕ Refuser
                </button>
              </div>
            </>
          ) : (
            <p className="font-heading">En attente de la réponse de @{opp?.pseudo}...</p>
          )}
        </motion.div>
      )}

      {duel.status === "declined" && <p className="text-center font-heading">Le duel a été refusé.</p>}

      {duel.status === "meeting" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border-2 border-outline rounded-sticker p-6 text-center shadow-[0_3px_0_0_#1A1A2E]">
          <h2 className="font-heading text-lg mb-1">📍 Rendez-vous duel</h2>
          {!myLocSubmitted ? (
            <>
              <p className="font-mono text-[11px] opacity-50 mb-4">
                Partage ta position pour trouver des lieux de rendez-vous proches de vous deux.
              </p>
              <button
                onClick={submitLocation}
                disabled={busy}
                className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
              >
                {busy ? "..." : "📡 Partager ma position"}
              </button>
            </>
          ) : duel.meeting_lat === null ? (
            <p className="font-body text-sm opacity-70">En attente de la position de @{opp?.pseudo}...</p>
          ) : duel.chosen_lat === null ? (
            <>
              <p className="font-mono text-[11px] opacity-50 mb-4">
                Choisissez ensemble un lieu public connu et sûr pour vous retrouver. Le premier choix validé compte pour les deux.
              </p>
              {duel.meeting_candidates === null ? (
                <p className="font-body text-sm opacity-70">Recherche de lieux à proximité...</p>
              ) : candidates.length === 0 ? (
                <p className="font-body text-sm opacity-70">Aucun lieu trouvé près de vous, réessaie plus tard.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {candidates.map((c) => (
                    <button
                      key={c.label + c.lat}
                      onClick={() => chooseSpot(c)}
                      disabled={choosingSpot}
                      className="flex items-center justify-between border-2 border-outline rounded-sticker px-4 py-3 font-body text-sm bg-white shadow-[0_2px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
                    >
                      <span>📍 {c.label}</span>
                      <span className="font-mono text-[10px] opacity-50">{Math.round(c.distance)} m</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="font-heading text-sm mb-2">📍 {duel.chosen_label}</p>
              <div className="relative w-48 h-48 mx-auto mb-4 rounded-full border-[3px] border-outline bg-background overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-4 h-4 rounded-full bg-secondary border-2 border-outline"
                  />
                </div>
                <div
                  className="absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full bg-primary border-2 border-outline flex items-center justify-center text-xs"
                  style={{
                    left: `${50 + Math.min(40, (myMeters ?? 0) / 5) * Math.sin((myBearing * Math.PI) / 180)}%`,
                    top: `${50 - Math.min(40, (myMeters ?? 0) / 5) * Math.cos((myBearing * Math.PI) / 180)}%`,
                  }}
                >
                  🙂
                </div>
              </div>
              <p className="font-heading text-sm mb-1">{myMeters !== null ? `${Math.round(myMeters)} m du point de RDV` : "..."}</p>
              <p className="font-mono text-[10px] opacity-50 mb-4">Rejoins ce lieu (adresse approximative acceptée, ~150m).</p>
              <button
                onClick={confirmArrival}
                disabled={busy || !!myReady}
                className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50 mb-2"
              >
                {myReady ? "✓ Tu es prêt" : busy ? "..." : "Je suis arrivé"}
              </button>
              <p className="font-mono text-[10px] opacity-50">{oppReady ? `✓ @${opp?.pseudo} est arrivé` : `En attente de @${opp?.pseudo}...`}</p>
            </>
          )}
        </motion.div>
      )}

      {duel.status === "active" && (
        <div>
          <motion.div
            animate={{ scale: remainingMs < 30000 ? [1, 1.08, 1] : 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-center font-heading text-3xl mb-4"
            style={{ color: remainingMs < 30000 ? "#E8503F" : undefined }}
          >
            ⏱ {remainingMin}:{remainingSec.toString().padStart(2, "0")}
          </motion.div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1">
              <div className="font-heading text-xs mb-1 text-center">@{me?.pseudo}</div>
              <div className="h-4 bg-background border-2 border-outline rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${(myCompleted.size / Math.max(1, missions.length)) * 100}%` }}
                  transition={{ type: "spring", bounce: 0.4 }}
                />
              </div>
              <div className="text-center font-heading text-sm mt-0.5">{myCompleted.size}</div>
            </div>
            <span className="font-heading text-secondary">VS</span>
            <div className="flex-1">
              <div className="font-heading text-xs mb-1 text-center">@{opp?.pseudo}</div>
              <div className="h-4 bg-background border-2 border-outline rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-secondary"
                  animate={{ width: `${(oppCompleted.size / Math.max(1, missions.length)) * 100}%` }}
                  transition={{ type: "spring", bounce: 0.4 }}
                />
              </div>
              <div className="text-center font-heading text-sm mt-0.5">{oppCompleted.size}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {missions.map((m) => {
              const done = myCompleted.has(m.mission_id);
              const result = verifyResults[m.mission_id];
              const isVerifying = verifying === m.mission_id;
              return (
                <div key={m.mission_id} className="flex flex-col gap-1">
                  <motion.button
                    onClick={() => !done && !isVerifying && fileInputs.current[m.mission_id]?.click()}
                    disabled={done || isVerifying}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center justify-between border-2 border-outline rounded-sticker px-4 py-3 font-body text-sm shadow-[0_2px_0_0_#1A1A2E] transition ${
                      done ? "bg-primary" : "bg-white"
                    }`}
                  >
                    <span>{m.label}</span>
                    <span>{done ? "✅" : isVerifying ? "🤖" : oppCompleted.has(m.mission_id) ? "🔥" : "📷"}</span>
                  </motion.button>
                  {!done && result && !result.verified && (
                    <p className="font-mono text-[10px] text-cat-corps px-1">⚠️ {result.reason || "Photo refusée, réessaie."}</p>
                  )}
                  <input
                    ref={(el) => {
                      fileInputs.current[m.mission_id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handlePhoto(m.mission_id, m.label, file);
                      e.target.value = "";
                    }}
                  />
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {burst && (
              <motion.div
                key={burst}
                initial={{ opacity: 1, scale: 0.5, y: 0 }}
                animate={{ opacity: 0, scale: 1.8, y: -40 }}
                transition={{ duration: 0.9 }}
                onAnimationComplete={() => setBurst(null)}
                className="fixed top-1/3 left-1/2 -translate-x-1/2 text-5xl pointer-events-none z-50"
              >
                🔥
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {duel.status === "finished" && (
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          {duel.winner_id === null ? (
            <h2 className="font-heading text-2xl mb-2">🤝 Égalité !</h2>
          ) : duel.winner_id === meId ? (
            <>
              <motion.div animate={{ rotate: [0, -8, 8, -8, 0] }} transition={{ duration: 0.6, repeat: 2 }} className="text-6xl mb-2">
                🏆
              </motion.div>
              <h2 className="font-heading text-2xl mb-1">Victoire !</h2>
              <p className="font-mono text-xs text-secondary font-semibold">⚡ Boost XP x2 activé pendant {duel.xp_boost_minutes} min !</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-2">💪</div>
              <h2 className="font-heading text-2xl mb-1">Défaite</h2>
              <p className="font-mono text-xs opacity-50">@{opp?.pseudo} a gagné ce duel, retente ta chance !</p>
            </>
          )}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="font-heading">{myCompleted.size} pts</div>
            <span className="opacity-50">—</span>
            <div className="font-heading">{oppCompleted.size} pts</div>
          </div>
        </motion.div>
      )}
    </Shell>
  );
}
