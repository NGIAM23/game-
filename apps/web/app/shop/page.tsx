"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Shell from "@/components/Shell";

interface Profile {
  id: string;
  pseudo: string | null;
  sparks: number;
  is_plus: boolean;
}

interface Cosmetic {
  id: string;
  name: string;
  kind: "avatar_bg" | "badge";
  value: string;
  price_sparks: number;
}

const SPARKS_PACKS = [
  { id: "sparks-99", sparks: 100, priceLabel: "0,99 €" },
  { id: "sparks-499", sparks: 550, priceLabel: "4,99 €" },
  { id: "sparks-999", sparks: 1200, priceLabel: "9,99 €" },
  { id: "sparks-1999", sparks: 2600, priceLabel: "19,99 €" },
  { id: "sparks-4999", sparks: 7000, priceLabel: "49,99 €" },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id, pseudo, sparks, is_plus")
      .eq("id", userId)
      .single();
    setProfile(data);
  }

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }
      await loadProfile(session.session.user.id);

      const { data: cosmeticsData } = await supabase.from("cosmetics").select("id, name, kind, value, price_sparks");
      setCosmetics(cosmeticsData ?? []);

      const { data: ownedData } = await supabase.from("profile_cosmetics").select("cosmetic_id");
      setOwned(new Set((ownedData ?? []).map((o) => o.cosmetic_id)));

      const sessionId = searchParams.get("session_id");
      if (searchParams.get("success") && sessionId) {
        const { data: refreshed } = await supabase.auth.getSession();
        const res = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, accessToken: refreshed.session?.access_token }),
        });
        const result = await res.json();
        if (res.ok) {
          setNotice(result.kind === "plus_subscription" ? "✨ Luavio+ est activé !" : `⚡ +${result.sparksAwarded} Sparks crédités !`);
          await loadProfile(session.session.user.id);
        } else {
          setNotice("Le paiement a été reçu mais la confirmation a échoué — contacte le support.");
        }
      } else if (searchParams.get("canceled")) {
        setNotice("Paiement annulé.");
      }

      setLoading(false);
    }
    load();
  }, [router, searchParams]);

  async function startCheckout(kind: "plus_subscription" | "sparks_pack", packId?: string) {
    setBusy(packId ?? kind);
    const { data: session } = await supabase.auth.getSession();
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, packId, accessToken: session.session?.access_token }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setNotice(data.error ?? "Erreur lors du paiement, réessaie.");
    } catch {
      setNotice("Erreur réseau, réessaie.");
    }
    setBusy(null);
  }

  async function purchaseCosmetic(id: string) {
    setBusy(id);
    const { error } = await supabase.rpc("purchase_cosmetic", { p_cosmetic_id: id });
    setBusy(null);
    if (!error && profile) {
      const cosmetic = cosmetics.find((c) => c.id === id);
      setOwned((prev) => new Set(prev).add(id));
      setProfile({ ...profile, sparks: profile.sparks - (cosmetic?.price_sparks ?? 0) });
    }
  }

  if (loading || !profile)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );

  return (
    <Shell>
      <h1 className="font-heading text-3xl text-center mb-1">
        Luavio<span className="text-secondary">+</span>
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center mb-6">
        Paiement sécurisé par Stripe
      </p>

      {notice && (
        <div className="bg-primary border-2 border-outline rounded-sticker px-4 py-2.5 mb-5 text-sm font-body font-semibold text-center">
          {notice}
        </div>
      )}

      <div className="flex items-center justify-between bg-primary border-2 border-outline rounded-sticker px-4 py-3 mb-6 shadow-[0_3px_0_0_#1A1A2E]">
        <span className="font-body font-semibold text-sm">Tes Sparks</span>
        <span className="font-heading text-base">⚡ {profile.sparks}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-secondary text-white border-[3px] border-outline rounded-sticker p-6 shadow-[0_5px_0_0_#1A1A2E] mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-heading text-xl">Luavio+</span>
          {profile.is_plus && (
            <span className="font-heading text-xs bg-primary text-outline border-2 border-outline rounded-full px-3 py-1">
              ✓ Actif
            </span>
          )}
        </div>
        <div className="font-heading text-3xl mb-1">3,99 € / mois</div>
        <p className="font-mono text-[11px] opacity-80 mb-4">Annulable à tout moment.</p>
        <ul className="flex flex-col gap-2 mb-5 text-sm font-body">
          <li>⚡ +10% XP sur chaque tâche</li>
          <li>🔁 Recharge de tâches illimitée</li>
          <li>🎨 Cosmétiques exclusifs pour l'avatar</li>
          <li>📊 Statistiques avancées</li>
        </ul>
        {profile.is_plus ? (
          <p className="text-center text-sm font-body opacity-80">
            Pour annuler, contacte le support — la gestion d'abonnement self-service arrive bientôt.
          </p>
        ) : (
          <button
            onClick={() => startCheckout("plus_subscription")}
            disabled={busy === "plus_subscription"}
            className="w-full font-heading bg-primary text-outline border-2 border-outline rounded-sticker py-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
          >
            {busy === "plus_subscription" ? "Redirection..." : "✨ Activer Luavio+"}
          </button>
        )}
      </motion.div>

      <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-3">Packs de Sparks</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
        {SPARKS_PACKS.map((pack) => (
          <button
            key={pack.id}
            onClick={() => startCheckout("sparks_pack", pack.id)}
            disabled={busy === pack.id}
            className="bg-surface border-2 border-outline rounded-sticker p-3 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50 text-center"
          >
            <div className="font-heading text-sm">⚡ {pack.sparks}</div>
            <div className="font-mono text-[11px] opacity-60">{busy === pack.id ? "..." : pack.priceLabel}</div>
          </button>
        ))}
      </div>

      {(["avatar_bg", "badge"] as const).map((kind) => {
        const items = cosmetics.filter((c) => c.kind === kind);
        if (items.length === 0) return null;
        return (
          <div key={kind} className="mb-8">
            <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-3">
              {kind === "avatar_bg" ? "🎨 Fonds d'avatar" : "🏷️ Badges"}
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-6 px-6 snap-x">
              {items.map((c) => {
                const isOwned = owned.has(c.id);
                return (
                  <motion.div
                    key={c.id}
                    whileHover={{ y: -3 }}
                    className="snap-start flex-shrink-0 w-32 bg-surface border-2 border-outline rounded-sticker p-3 shadow-[0_3px_0_0_#1A1A2E] text-center"
                  >
                    {c.kind === "avatar_bg" ? (
                      <div
                        className="w-14 h-14 rounded-full border-2 border-outline mx-auto mb-2"
                        style={{ background: `linear-gradient(160deg, ${c.value}, #6750E8)` }}
                      />
                    ) : (
                      <div className="text-3xl mb-2">{c.value}</div>
                    )}
                    <div className="font-body font-semibold text-xs mb-2 truncate">{c.name}</div>
                    {isOwned ? (
                      <span className="font-mono text-[10px] opacity-50">✓ Possédé</span>
                    ) : (
                      <button
                        onClick={() => purchaseCosmetic(c.id)}
                        disabled={busy === c.id || profile.sparks < c.price_sparks}
                        className="font-heading text-xs bg-primary border-2 border-outline rounded-full px-2.5 py-1 disabled:opacity-40 w-full"
                      >
                        {busy === c.id ? "..." : `⚡ ${c.price_sparks}`}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Shell>
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <Shell>
          <p className="text-center font-heading">Chargement...</p>
        </Shell>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
