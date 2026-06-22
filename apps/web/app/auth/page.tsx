"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      setLoading(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      if (data.session) {
        router.push("/onboarding");
        return;
      }
      setMessage("Compte créé ! Vérifie ton email pour confirmer, puis reviens te connecter.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border-2 border-outline rounded-sticker p-6 shadow-[0_4px_0_0_#1A1A2E]"
      >
        <h1 className="font-heading text-2xl text-center mb-6">
          {mode === "signup" ? "Créer un compte" : "Connexion"}
        </h1>

        <input
          type="email"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border-2 border-outline rounded-sticker px-4 py-2 mb-3"
        />
        <input
          type="password"
          placeholder="mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border-2 border-outline rounded-sticker px-4 py-2 mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-3 shadow-[0_4px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
        >
          {loading ? "..." : mode === "signup" ? "S'inscrire" : "Se connecter"}
        </button>

        {message && <p className="text-sm text-center mt-4">{message}</p>}

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="w-full text-sm text-secondary mt-4 underline"
        >
          {mode === "signup" ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
        </button>
      </form>
    </main>
  );
}
