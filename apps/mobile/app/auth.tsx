import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { colors } from "@luavio/shared";

export default function Auth() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      setMessage(error ? error.message : "Compte créé ! Vérifie ton email pour confirmer.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      router.replace("/");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === "signup" ? "Créer un compte" : "Connexion"}</Text>

      <TextInput
        style={styles.input}
        placeholder="email@exemple.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "..." : mode === "signup" ? "S'inscrire" : "Se connecter"}</Text>
      </Pressable>

      {message && <Text style={styles.message}>{message}</Text>}

      <Pressable onPress={() => setMode(mode === "signup" ? "login" : "signup")}>
        <Text style={styles.switchText}>
          {mode === "signup" ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 12, color: colors.outline },
  input: {
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: 18,
    padding: 12,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { fontWeight: "700", color: colors.outline },
  message: { textAlign: "center", color: colors.outline },
  switchText: { textAlign: "center", color: colors.secondary, marginTop: 12 },
});
