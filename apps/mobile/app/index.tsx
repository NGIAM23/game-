import { useCallback, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Link } from "expo-router";
import { colors, categoryColors, CATEGORIES, type CategoryId } from "@luavio/shared";
import { supabase } from "../lib/supabase";

interface TaskRow {
  id: string;
  category: CategoryId;
  label: string;
  base_xp: number;
}

export default function DailyTasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [xpToday, setXpToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          router.replace("/auth");
          return;
        }

        const { data: allTasks } = await supabase.from("tasks").select("id, category, label, base_xp").limit(3);
        const { data: completions } = await supabase
          .from("task_completions")
          .select("task_id, xp_awarded")
          .eq("completed_on", new Date().toISOString().slice(0, 10));

        if (!active) return;
        setTasks(allTasks ?? []);
        setDoneIds(new Set((completions ?? []).map((c) => c.task_id)));
        setXpToday((completions ?? []).reduce((sum, c) => sum + c.xp_awarded, 0));
        setLoading(false);
      }
      load();

      return () => {
        active = false;
      };
    }, [])
  );

  async function completeTask(taskId: string) {
    setPending(taskId);
    const { data: xpAwarded, error } = await supabase.rpc("complete_task", { p_task_id: taskId });
    setPending(null);
    if (!error && typeof xpAwarded === "number") {
      setDoneIds((prev) => new Set(prev).add(taskId));
      setXpToday((prev) => prev + xpAwarded);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.xpToday}>+{xpToday} XP aujourd'hui</Text>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const category = CATEGORIES.find((c) => c.id === item.category)!;
          const isDone = doneIds.has(item.id);
          const xp = item.category === "detoxEcran" ? item.base_xp * 3 : item.base_xp;
          return (
            <Pressable
              onPress={() => completeTask(item.id)}
              disabled={isDone || pending === item.id}
              style={[
                styles.card,
                { borderColor: categoryColors[item.category], opacity: isDone ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.cardIcon}>{category.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardXp}>+{xp} XP</Text>
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
  xpToday: { fontSize: 20, fontWeight: "700", color: colors.secondary },
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
