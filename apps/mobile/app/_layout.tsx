import { Stack } from "expo-router";
import { colors } from "@luavio/shared";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.outline },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Luavio — Tâches du jour" }} />
      <Stack.Screen name="profile" options={{ title: "Profil" }} />
      <Stack.Screen name="auth" options={{ title: "Connexion", headerShown: false }} />
    </Stack>
  );
}
