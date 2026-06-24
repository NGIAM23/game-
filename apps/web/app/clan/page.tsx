"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";
import { playClick, playLevelUp, playError } from "@/lib/sound";

interface ClanInfo {
  clan_id: string;
  name: string;
  weekly_target: number;
  reward_xp: number;
  reward_sparks: number;
  progress: number;
  claimed: boolean;
  member_count: number;
  owner_id: string;
}

interface Member {
  user_id: string;
  pseudo: string;
  avatar_seed: string | null;
  contributed: number;
}

interface ClanSearchResult {
  id: string;
  name: string;
  member_count: number;
}

export default function ClanPage() {
  const router = useRouter();
  const [clan, setClan] = useState<ClanInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newClanName, setNewClanName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ClanSearchResult[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configName, setConfigName] = useState("");
  const [configTarget, setConfigTarget] = useState(40);
  const [configRewardXp, setConfigRewardXp] = useState(30);
  const [configRewardSparks, setConfigRewardSparks] = useState(15);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const load = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      router.push("/auth");
      return;
    }
    setUserId(session.session.user.id);
    const { data: clanData } = await supabase.rpc("get_my_clan");
    const myClan = (clanData ?? [])[0] as ClanInfo | undefined;
    setClan(myClan ?? null);
    if (myClan) {
      const { data: membersData } = await supabase.rpc("get_clan_members");
      setMembers((membersData ?? []) as Member[]);
      setConfigName(myClan.name);
      setConfigTarget(myClan.weekly_target);
      setConfigRewardXp(myClan.reward_xp);
      setConfigRewardSparks(myClan.reward_sparks);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function searchClans(q: string) {
    setSearchQuery(q);
    const { data } = await supabase.rpc("search_clans", { p_query: q });
    setSearchResults((data ?? []) as ClanSearchResult[]);
  }

  useEffect(() => {
    if (!clan) searchClans("");
  }, [clan]);

  async function createClan() {
    if (!newClanName.trim()) return;
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("create_clan", { p_name: newClanName.trim() });
    setBusy(false);
    if (rpcError) {
      setError("Ce nom de clan est déjà pris ou tu es déjà dans un clan.");
      playError();
    } else {
      playClick();
      setNewClanName("");
      load();
    }
  }

  async function joinClan(clanId: string) {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("join_clan", { p_clan_id: clanId });
    setBusy(false);
    if (rpcError) {
      setError("Impossible de rejoindre ce clan (plein ou tu es déjà dans un clan).");
      playError();
    } else {
      playClick();
      load();
    }
  }

  async function leaveClan() {
    setBusy(true);
    await supabase.rpc("leave_clan");
    setBusy(false);
    playClick();
    load();
  }

  async function deleteClan() {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("delete_clan");
    setBusy(false);
    setShowDeleteConfirm(false);
    if (rpcError) {
      setError("Impossible de supprimer le clan.");
      playError();
    } else {
      playClick();
      load();
    }
  }

  async function saveClanConfig() {
    if (!configName.trim()) return;
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("update_clan_settings", {
      p_name: configName.trim(),
      p_weekly_target: configTarget,
      p_reward_xp: configRewardXp,
      p_reward_sparks: configRewardSparks,
    });
    setBusy(false);
    if (rpcError) {
      setError("Réglages invalides ou nom déjà pris.");
      playError();
    } else {
      playClick();
      setShowConfig(false);
      load();
    }
  }

  async function claimReward() {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("claim_clan_reward");
    setBusy(false);
    if (rpcError) {
      setError("Objectif pas encore atteint ou déjà récupéré.");
      playError();
    } else {
      playLevelUp();
      load();
    }
  }

  if (loading)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  return (
    <Shell>
      <h1 className="font-heading text-3xl text-center mb-1">
        Mon <span className="text-secondary">clan</span>
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center mb-6">
        Une équipe de 6 amis max, un objectif hebdomadaire commun
      </p>

      {error && <p className="text-sm text-center mb-4 text-cat-corps font-body">{error}</p>}

      {clan ? (
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary text-white border-[3px] border-outline rounded-sticker p-6 shadow-[0_5px_0_0_#1A1A2E] text-center mb-5"
          >
            <h2 className="font-heading text-xl mb-1">🛡️ {clan.name}</h2>
            <p className="font-mono text-[10px] opacity-70 mb-3">{clan.member_count} / 6 membres</p>
            <div className="h-4 bg-black/35 border-2 border-outline rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${Math.min(100, (clan.progress / clan.weekly_target) * 100)}%` }}
                transition={{ type: "spring", bounce: 0.3 }}
              />
            </div>
            <p className="font-heading text-sm">{clan.progress} / {clan.weekly_target} tâches cette semaine</p>
            <p className="font-mono text-[10px] opacity-80 mt-1">🎁 +{clan.reward_xp} XP et +{clan.reward_sparks} ⚡ par membre</p>
            {clan.claimed ? (
              <p className="font-heading text-xs mt-3">✓ Récompense récupérée cette semaine</p>
            ) : clan.progress >= clan.weekly_target ? (
              <button
                onClick={claimReward}
                disabled={busy}
                className="mt-3 font-heading bg-primary text-outline border-2 border-outline rounded-sticker px-5 py-2 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
              >
                Récupérer la récompense
              </button>
            ) : null}
          </motion.div>

          <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-3">Contributions de la semaine</h2>
          <div className="flex flex-col gap-2 mb-6">
            {members.map((m) => (
              <div
                key={m.user_id}
                className="flex items-center gap-3 bg-surface border-2 border-outline rounded-sticker px-3 py-2.5 shadow-[0_2px_0_0_#1A1A2E]"
              >
                <Avatar seed={m.avatar_seed || m.pseudo} size={32} />
                <span className="font-body text-sm flex-1">@{m.pseudo}</span>
                <span className="font-heading text-sm">{m.contributed}</span>
              </div>
            ))}
          </div>

          {clan.owner_id === userId && (
            <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-4 shadow-[0_3px_0_0_#1A1A2E]">
              <button
                onClick={() => setShowConfig((v) => !v)}
                className="w-full font-heading text-sm text-left"
              >
                ⚙️ Configurer le clan {showConfig ? "▲" : "▼"}
              </button>
              {showConfig && (
                <div className="flex flex-col gap-2.5 mt-3">
                  <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                    Nom du clan
                    <input
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      className="w-full mt-1 bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body"
                    />
                  </label>
                  <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                    Objectif hebdo (tâches)
                    <input
                      type="number"
                      min={1}
                      value={configTarget}
                      onChange={(e) => setConfigTarget(Number(e.target.value))}
                      className="w-full mt-1 bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body"
                    />
                  </label>
                  <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                    Récompense XP / membre
                    <input
                      type="number"
                      min={0}
                      value={configRewardXp}
                      onChange={(e) => setConfigRewardXp(Number(e.target.value))}
                      className="w-full mt-1 bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body"
                    />
                  </label>
                  <label className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                    Récompense Sparks / membre
                    <input
                      type="number"
                      min={0}
                      value={configRewardSparks}
                      onChange={(e) => setConfigRewardSparks(Number(e.target.value))}
                      className="w-full mt-1 bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body"
                    />
                  </label>
                  <button
                    onClick={saveClanConfig}
                    disabled={busy || !configName.trim()}
                    className="font-heading text-sm bg-primary border-2 border-outline rounded-sticker py-2.5 mt-1 shadow-[0_2px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={leaveClan}
            disabled={busy}
            className="w-full font-heading bg-background border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
          >
            Quitter le clan
          </button>

          {clan.owner_id === userId && (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={busy}
                className="w-full font-heading text-cat-corps bg-background border-2 border-outline rounded-sticker py-3 mt-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
              >
                Supprimer le clan
              </button>
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={() => setShowDeleteConfirm(false)}>
                  <div
                    className="bg-surface border-[3px] border-outline rounded-sticker p-6 text-center shadow-[0_5px_0_0_#1A1A2E] max-w-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="font-body text-sm mb-4">
                      Supprimer définitivement « {clan.name} » ? Tous les membres seront retirés.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 font-heading text-sm bg-background border-2 border-outline rounded-sticker py-2.5"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={deleteClan}
                        disabled={busy}
                        className="flex-1 font-heading text-sm text-white bg-cat-corps border-2 border-outline rounded-sticker py-2.5 disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="bg-surface border-2 border-outline rounded-sticker p-4 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
            <h2 className="font-heading text-base mb-2">Créer un clan</h2>
            <div className="flex gap-2">
              <input
                value={newClanName}
                onChange={(e) => setNewClanName(e.target.value)}
                placeholder="Nom du clan..."
                className="flex-1 bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body"
              />
              <button
                onClick={createClan}
                disabled={busy || !newClanName.trim()}
                className="font-heading text-sm bg-primary border-2 border-outline rounded-sticker px-4 py-2 shadow-[0_2px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </div>

          <div className="bg-surface border-2 border-outline rounded-sticker p-4 shadow-[0_3px_0_0_#1A1A2E]">
            <h2 className="font-heading text-base mb-2">Rejoindre un clan</h2>
            <input
              value={searchQuery}
              onChange={(e) => searchClans(e.target.value)}
              placeholder="Chercher un clan..."
              className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body mb-3"
            />
            <div className="flex flex-col gap-2">
              {searchResults.length === 0 && <p className="font-body text-sm opacity-50 text-center">Aucun clan trouvé.</p>}
              {searchResults.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border-2 border-outline rounded-sticker px-3 py-2.5 bg-background"
                >
                  <span className="font-body text-sm">🛡️ {c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] opacity-50">{c.member_count}/6</span>
                    <button
                      onClick={() => joinClan(c.id)}
                      disabled={busy || c.member_count >= 6}
                      className="font-heading text-[10px] bg-primary border-2 border-outline rounded-sticker px-2.5 py-1 shadow-[0_2px_0_0_#1A1A2E] active:translate-y-0.5 active:shadow-none transition disabled:opacity-50"
                    >
                      Rejoindre
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
