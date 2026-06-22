import { View, Text, StyleSheet } from "react-native";
import { colors, levelFromTotalXp, rankFromLevel } from "@luavio/shared";

// Mock V1 : XP totale figée, en attendant la persistance Supabase.
const MOCK_TOTAL_XP = 1240;

export default function Profile() {
  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(MOCK_TOTAL_XP);
  const rank = rankFromLevel(level);

  return (
    <View style={styles.container}>
      <Text style={styles.level}>Niveau {level}</Text>
      <Text style={styles.rank}>{rank}</Text>
      <Text style={styles.xp}>
        {xpIntoLevel} / {xpForNextLevel} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  level: { fontSize: 32, fontWeight: "800", color: colors.outline },
  rank: { fontSize: 18, color: colors.secondary, fontWeight: "700" },
  xp: { fontSize: 14, color: colors.outline, opacity: 0.6 },
});
