import { useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { TASK_POOL, xpForTask, colors, categoryColors, CATEGORIES } from "@luavio/shared";

// Mock V1 : 3 tâches quotidiennes tirées du pool, pas de backend pour l'instant.
const DAILY_TASKS = TASK_POOL.slice(0, 3);

export default function DailyTasks() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  const totalXpToday = useMemo(
    () => DAILY_TASKS.filter((t) => done[t.id]).reduce((sum, t) => sum + xpForTask(t), 0),
    [done]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.xpToday}>+{totalXpToday} XP aujourd'hui</Text>

      <FlatList
        data={DAILY_TASKS}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const category = CATEGORIES.find((c) => c.id === item.category)!;
          const isDone = !!done[item.id];
          return (
            <Pressable
              onPress={() => setDone((d) => ({ ...d, [item.id]: !d[item.id] }))}
              style={[
                styles.card,
                { borderColor: categoryColors[item.category], opacity: isDone ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.cardIcon}>{category.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardXp}>+{xpForTask(item)} XP</Text>
              </View>
              <Text style={styles.check}>{isDone ? "✅" : "⬜"}</Text>
            </Pressable>
          );
        }}
      />

      <Link href="/profile" asChild>
        <Pressable style={styles.profileBtn}>
          <Text style={styles.profileBtnText}>Voir mon profil</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  xpToday: { fontFamily: undefined, fontSize: 20, fontWeight: "700", color: colors.secondary },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderRadius: 18,
    padding: 14,
  },
  cardIcon: { fontSize: 28 },
  cardLabel: { fontSize: 15, fontWeight: "600", color: colors.outline },
  cardXp: { fontSize: 13, color: colors.outline, opacity: 0.6 },
  check: { fontSize: 20 },
  profileBtn: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  profileBtnText: { fontWeight: "700", color: colors.outline },
});
