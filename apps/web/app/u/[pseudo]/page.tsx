"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { levelFromTotalXp, rankFromLevel } from "@luavio/shared";
import Shell from "@/components/Shell";
import Avatar from "@/components/Avatar";

interface PublicProfile {
  id: string;
  pseudo: string;
  avatar_seed: string | null;
  total_xp: number;
  current_streak: number;
  equipped_avatar_bg: string | null;
  equipped_badge: string | null;
}

export default function PublicProfilePage() {
  const params = useParams<{ pseudo: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [badgeEmoji, setBadgeEmoji] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending_sent" | "pending_received" | "accepted">("none");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push("/auth");
        return;
      }
      setMeId(session.session.user.id);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, pseudo, avatar_seed, total_xp, current_streak, equipped_avatar_bg, equipped_badge")
        .eq("pseudo", params.pseudo)
        .single();

      if (fetchError || !data) {
        setError("Profil introuvable.");
        setLoading(false);
        return;
      }
      setProfile(data);

      if (data.equipped_avatar_bg) {
        const { data: cosmetic } = await supabase.from("cosmetics").select("value").eq("id", data.equipped_avatar_bg).single();
        setBgColor(cosmetic?.value ?? null);
      }
      if (data.equipped_badge) {
        const { data: badge } = await supabase.from("cosmetics").select("value").eq("id", data.equipped_badge).single();
        setBadgeEmoji(badge?.value ?? null);
      }

      if (data.id !== session.session.user.id) {
        const { data: link } = await supabase
          .from("friends")
          .select("requester, addressee, status")
          .or(`and(requester.eq.${session.session.user.id},addressee.eq.${data.id}),and(requester.eq.${data.id},addressee.eq.${session.session.user.id})`)
          .maybeSingle();

        if (link) {
          if (link.status === "accepted") setFriendStatus("accepted");
          else if (link.requester === session.session.user.id) setFriendStatus("pending_sent");
          else setFriendStatus("pending_received");
        }
      }

      setLoading(false);
    }
    load();
  }, [params.pseudo, router]);

  async function sendRequest() {
    if (!profile || !meId) return;
    const { error: insertError } = await supabase.from("friends").insert({ requester: meId, addressee: profile.id });
    if (!insertError) setFriendStatus("pending_sent");
  }

  async function acceptRequest() {
    if (!profile || !meId) return;
    const { error: updateError } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("requester", profile.id)
      .eq("addressee", meId);
    if (!updateError) setFriendStatus("accepted");
  }

  if (loading)
    return (
      <Shell>
        <p className="text-center font-heading">Chargement...</p>
      </Shell>
    );
  if (error || !profile)
    return (
      <Shell>
        <p className="text-center">{error ?? "Profil introuvable."}</p>
      </Shell>
    );

  const { level } = levelFromTotalXp(profile.total_xp);
  const rank = rankFromLevel(level);
  const isMe = profile.id === meId;

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary text-white border-[3px] border-outline rounded-sticker p-6 shadow-[0_5px_0_0_#1A1A2E] text-center"
        style={bgColor ? { background: `linear-gradient(160deg, ${bgColor}, #6750E8)` } : undefined}
      >
        <div className="flex justify-center mb-3">
          <Avatar seed={profile.avatar_seed || profile.pseudo} size={72} />
        </div>
        <div className="font-heading text-xl mb-0.5">
          @{profile.pseudo} {badgeEmoji && <span>{badgeEmoji}</span>}
        </div>
        <div className="font-mono text-xs uppercase tracking-widest opacity-80 mb-3">{rank}</div>
        <div className="flex items-center justify-center gap-4 font-heading text-sm">
          <span>Niv. {level}</span>
          <span>🔥 {profile.current_streak}</span>
        </div>
      </motion.div>

      {!isMe && (
        <div className="mt-5 text-center">
          {friendStatus === "none" && (
            <button
              onClick={sendRequest}
              className="font-heading bg-primary border-2 border-outline rounded-sticker px-5 py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
            >
              ➕ Ajouter en ami
            </button>
          )}
          {friendStatus === "pending_sent" && <p className="opacity-60 text-sm font-body">Demande envoyée</p>}
          {friendStatus === "pending_received" && (
            <button
              onClick={acceptRequest}
              className="font-heading bg-primary border-2 border-outline rounded-sticker px-5 py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
            >
              ✓ Accepter sa demande
            </button>
          )}
          {friendStatus === "accepted" && <p className="opacity-60 text-sm font-body">✓ Vous êtes amis</p>}
        </div>
      )}
    </Shell>
  );
}
