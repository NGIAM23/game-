"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";

interface FriendRow {
  pseudo: string;
  avatar_seed: string | null;
}

interface FriendLink {
  requester: string;
  addressee: string;
  status: "pending" | "accepted";
  otherId: string;
  profile: FriendRow | null;
}

export default function FriendsPage() {
  const router = useRouter();
  const [meId, setMeId] = useState<string | null>(null);
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ id: string; pseudo: string; avatar_seed: string | null } | null | undefined>(undefined);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [duelTarget, setDuelTarget] = useState<FriendLink | null>(null);
  const [duelBusy, setDuelBusy] = useState(false);

  async function loadLinks(userId: string) {
    const { data } = await supabase
      .from("friends")
      .select("requester, addressee, status")
      .or(`requester.eq.${userId},addressee.eq.${userId}`);

    const rows = data ?? [];
    const otherIds = rows.map((r) => (r.requester === userId ? r.addressee : r.requester));
    let profiles: Record<string, FriendRow> = {};
    if (otherIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, pseudo, avatar_seed")
        .in("id", otherIds);
      profiles = Object.fromEntries((profilesData ?? []).map((p) => [p.id, { pseudo: p.pseudo, avatar_seed: p.avatar_seed }]));
    }

    setLinks(
      rows.map((r) => {
        const otherId = r.requester === userId ? r.addressee : r.requester;
        return { ...r, otherId, profile: profiles[otherId] ?? null };
      })
    );
  }

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }
      setMeId(session.session.user.id);
      await loadLinks(session.session.user.id);
      setLoading(false);
    }
    load();
  }, [router]);

  async function searchPseudo() {
    if (!query.trim() || !meId) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, pseudo, avatar_seed")
      .ilike("pseudo", query.trim())
      .neq("id", meId)
      .maybeSingle();
    setSearchResult(data ?? null);
    setSearching(false);
  }

  async function sendRequest(otherId: string) {
    if (!meId) return;
    const { error } = await supabase.from("friends").insert({ requester: meId, addressee: otherId });
    if (!error) {
      setNotice("Demande envoyée !");
      setSearchResult(undefined);
      setQuery("");
      await loadLinks(meId);
    }
  }

  async function acceptRequest(requesterId: string) {
    if (!meId) return;
    const { error } = await supabase.from("friends").update({ status: "accepted" }).eq("requester", requesterId).eq("addressee", meId);
    if (!error) await loadLinks(meId);
  }

  async function removeLink(otherId: string) {
    if (!meId) return;
    await supabase.from("friends").delete().or(`and(requester.eq.${meId},addressee.eq.${otherId}),and(requester.eq.${otherId},addressee.eq.${meId})`);
    await loadLinks(meId);
  }

  async function startDuel(mode: "distance" | "reel") {
    if (!duelTarget) return;
    setDuelBusy(true);
    const { data, error } = await supabase.rpc("create_duel", {
      p_opponent_id: duelTarget.otherId,
      p_mode: mode,
    });
    setDuelBusy(false);
    if (!error && data) {
      router.push(`/duel/${data}`);
    } else {
      setNotice("Impossible de lancer le duel, réessaie.");
      setDuelTarget(null);
    }
  }

  if (loading)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  const received = links.filter((l) => l.status === "pending" && l.addressee === meId);
  const sent = links.filter((l) => l.status === "pending" && l.requester === meId);
  const accepted = links.filter((l) => l.status === "accepted");

  return (
    <Shell wide>
      <h1 className="font-heading text-3xl text-center mb-1">
        Mes <span className="text-secondary">amis</span>
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center mb-4">Trouve et ajoute tes amis</p>

      <div className="text-center mb-6">
        <Link
          href="/clan"
          className="inline-block font-heading text-sm bg-secondary text-white border-2 border-outline rounded-sticker px-5 py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
        >
          🛡️ Mon clan
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-6 lg:items-start">
        <div>
          <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchResult(undefined);
                }}
                placeholder="Pseudo exact..."
                className="flex-1 bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body"
              />
              <button
                onClick={searchPseudo}
                disabled={searching || !query.trim()}
                className="font-heading text-sm bg-primary border-2 border-outline rounded-sticker px-4 py-2 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
              >
                🔍
              </button>
            </div>
            {searchResult === null && <p className="text-xs opacity-60 mt-2 font-body">Aucun utilisateur avec ce pseudo.</p>}
            {searchResult && (
              <div className="flex items-center gap-3 mt-3 bg-background border-2 border-outline rounded-sticker p-2.5">
                <Avatar seed={searchResult.avatar_seed || searchResult.pseudo} size={36} />
                <span className="flex-1 font-body font-semibold text-sm">@{searchResult.pseudo}</span>
                <button
                  onClick={() => sendRequest(searchResult.id)}
                  className="font-heading text-xs bg-primary border-2 border-outline rounded-full px-3 py-1.5"
                >
                  ➕ Ajouter
                </button>
              </div>
            )}
            {notice && <p className="text-xs text-secondary font-semibold mt-2 font-body">{notice}</p>}
          </div>

          {received.length > 0 && (
            <>
              <h2 className="font-heading text-lg mb-2">Demandes reçues</h2>
              <div className="flex flex-col gap-2 mb-6">
                {received.map((l) => (
                  <FriendCard key={l.otherId} link={l} actionLabel="✓ Accepter" onAction={() => acceptRequest(l.otherId)} />
                ))}
              </div>
            </>
          )}

          {sent.length > 0 && (
            <>
              <h2 className="font-heading text-lg mb-2">Demandes envoyées</h2>
              <div className="flex flex-col gap-2 mb-6">
                {sent.map((l) => (
                  <FriendCard key={l.otherId} link={l} actionLabel="✕ Annuler" onAction={() => removeLink(l.otherId)} muted />
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <h2 className="font-heading text-lg mb-2">Amis ({accepted.length})</h2>
          {accepted.length === 0 ? (
            <p className="text-center opacity-60 font-body text-sm">Aucun ami pour l'instant.</p>
          ) : (
            <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-2.5">
              {accepted.map((l) => (
                <FriendCard
                  key={l.otherId}
                  link={l}
                  actionLabel="✕ Retirer"
                  onAction={() => removeLink(l.otherId)}
                  onDuel={() => setDuelTarget(l)}
                  muted
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {duelTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-outline/60 px-6"
            onClick={() => !duelBusy && setDuelTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-surface border-[3px] border-outline rounded-sticker p-6 shadow-[0_8px_0_0_#1A1A2E] text-center"
            >
              <h2 className="font-heading text-xl mb-1">⚔️ Défier @{duelTarget.profile?.pseudo}</h2>
              <p className="font-mono text-[11px] opacity-50 mb-5">Choisis le type de duel</p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => startDuel("distance")}
                  disabled={duelBusy}
                  className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
                >
                  📍 À distance
                </button>
                <button
                  onClick={() => startDuel("reel")}
                  disabled={duelBusy}
                  className="w-full font-heading bg-secondary text-white border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
                >
                  🤝 En réel (même lieu)
                </button>
              </div>
              {duelBusy && <p className="font-mono text-[11px] opacity-50 mt-3">Envoi du défi...</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

function FriendCard({
  link,
  actionLabel,
  onAction,
  onDuel,
  muted,
}: {
  link: FriendLink;
  actionLabel: string;
  onAction: () => void;
  onDuel?: () => void;
  muted?: boolean;
}) {
  const pseudo = link.profile?.pseudo ?? "?";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 border-2 border-outline rounded-sticker p-3 shadow-[0_2px_0_0_#1A1A2E] bg-white"
    >
      <Avatar seed={link.profile?.avatar_seed || pseudo} size={36} />
      <Link href={`/u/${pseudo}`} className="flex-1 font-body font-semibold text-sm">
        @{pseudo}
      </Link>
      {onDuel && (
        <button
          onClick={onDuel}
          className="font-heading text-xs border-2 border-outline rounded-full px-3 py-1.5 bg-secondary text-white"
        >
          ⚔️ Duel
        </button>
      )}
      <button
        onClick={onAction}
        className={`font-heading text-xs border-2 border-outline rounded-full px-3 py-1.5 ${muted ? "opacity-60" : "bg-primary"}`}
      >
        {actionLabel}
      </button>
    </motion.div>
  );
}
