"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
        return;
      }
      setCheckingSession(false);
    }
    check();
  }, [router]);

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

  if (checkingSession) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border-[3px] border-outline rounded-sticker p-7 shadow-[0_5px_0_0_#1A1A2E]"
      >
        <div className="text-center mb-6">
          <Logo size={28} />
        </div>
        <h1 className="font-heading text-2xl text-center mb-1">
          {mode === "signup" ? "Créer un compte Luavio" : "Compte Luavio"}
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-widest opacity-50 text-center mb-6">
          Connecte-toi une fois, le jeu se relance seul ensuite
        </p>

        <input
          type="email"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border-2 border-outline rounded-sticker px-4 py-2.5 mb-3 outline-none focus:border-secondary transition"
        />
        <input
          type="password"
          placeholder="mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border-2 border-outline rounded-sticker px-4 py-2.5 mb-4 outline-none focus:border-secondary transition"
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

        <p className="font-mono text-[10px] opacity-40 text-center mt-5 leading-snug">
          Ton compte Luavio te suit sur PC et mobile : connecte-toi une seule fois par appareil, ta progression reste synchronisée.
        </p>
      </motion.form>
    </main>
  );
}
