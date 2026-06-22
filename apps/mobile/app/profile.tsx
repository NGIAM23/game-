import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { colors, levelFromTotalXp, rankFromLevel } from "@luavio/shared";
import { supabase } from "../lib/supabase";

interface Profile {
  pseudo: string | null;
  total_xp: number;
  current_streak: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          router.replace("/auth");
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("pseudo, total_xp, current_streak")
          .eq("id", session.session.user.id)
          .single();

        if (!active) return;
        setProfile(data);
        setLoading(false);
      }
      load();

      return () => {
        active = false;
      };
    }, [])
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  if (loading || !profile) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(profile.total_xp);
  const rank = rankFromLevel(level);

  return (
    <View style={styles.container}>
      {profile.pseudo && <Text style={styles.pseudo}>@{profile.pseudo}</Text>}
      <Text style={styles.level}>Niveau {level}</Text>
      <Text style={styles.rank}>{rank}</Text>
      <Text style={styles.xp}>
        {xpIntoLevel} / {xpForNextLevel} XP
      </Text>
      {profile.current_streak > 0 && (
        <Text style={styles.streak}>
          🔥 {profile.current_streak} jour{profile.current_streak > 1 ? "s" : ""} de suite
        </Text>
      )}

      <Pressable onPress={handleLogout}>
        <Text style={styles.logout}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  pseudo: { fontSize: 16, color: colors.outline, opacity: 0.6 },
  level: { fontSize: 32, fontWeight: "800", color: colors.outline },
  rank: { fontSize: 18, color: colors.secondary, fontWeight: "700" },
  xp: { fontSize: 14, color: colors.outline, opacity: 0.6 },
  streak: { fontSize: 14, color: colors.outline, marginTop: 4 },
  logout: { fontSize: 14, color: colors.secondary, textDecorationLine: "underline", marginTop: 24 },
});
