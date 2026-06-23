"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";

export default function AuthPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [busy, setBusy] = useState<"id" | "google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

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

  async function createLuavioId() {
    if (!captchaToken) {
      setError("Vérification anti-robot en cours, réessaie dans une seconde.");
      return;
    }
    setBusy("id");
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInAnonymously({
      options: { captchaToken },
    });
    setBusy(null);
    setCaptchaToken(null);
    turnstileRef.current?.reset();
    if (signInError) {
      setError("Impossible de créer ton Luavio ID, réessaie.");
      return;
    }
    if (data.session) router.push("/onboarding");
  }

  async function signInWithEmail() {
    if (!emailInput.trim() || !passwordInput) {
      setError("Renseigne ton email et ton mot de passe.");
      return;
    }
    setBusy("id");
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password: passwordInput,
    });
    setBusy(null);
    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    if (data.session) router.push("/dashboard");
  }

  async function continueWith(provider: "google" | "apple") {
    setBusy(provider);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (oauthError) {
      setError("Connexion impossible, réessaie.");
      setBusy(null);
    }
  }

  if (checkingSession) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-outline/50">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm bg-surface border-[3px] border-outline rounded-sticker p-7 shadow-[0_8px_0_0_#1A1A2E]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15, type: "spring", bounce: 0.5 }}
          className="flex flex-col items-center text-center mb-6"
        >
          <Logo size={32} />
          <h1 className="font-heading text-2xl mt-3">
            Luavio <span className="text-secondary">ID</span>
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-widest opacity-50 mt-1">
            Un compte, créé en un instant
          </p>
        </motion.div>

        <button
          type="button"
          onClick={createLuavioId}
          disabled={busy !== null}
          className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-3 shadow-[0_4px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50 mb-4"
        >
          {busy === "id" ? "..." : "✨ Créer mon Luavio ID"}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="flex-1 h-px bg-outline/20" />
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">ou</span>
          <span className="flex-1 h-px bg-outline/20" />
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => continueWith("google")}
            disabled={busy !== null}
            className="w-full font-body font-semibold text-sm bg-white border-2 border-outline rounded-sticker py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            🔵 {busy === "google" ? "..." : "Continuer avec Google"}
          </button>
          <button
            type="button"
            onClick={() => continueWith("apple")}
            disabled={busy !== null}
            className="w-full font-body font-semibold text-sm bg-white border-2 border-outline rounded-sticker py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            🍎 {busy === "apple" ? "..." : "Continuer avec Apple"}
          </button>
        </div>

        {showEmailLogin ? (
          <div className="mt-4 flex flex-col gap-2.5">
            <input
              type="email"
              placeholder="ton@email.fr"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-background border-2 border-outline rounded-sticker px-3 py-2 text-sm font-body"
            />
            <button
              type="button"
              onClick={signInWithEmail}
              disabled={busy !== null}
              className="w-full font-heading bg-primary border-2 border-outline rounded-sticker py-2.5 shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition disabled:opacity-50"
            >
              {busy === "id" ? "..." : "Se connecter"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowEmailLogin(true)}
            className="w-full font-mono text-[11px] uppercase tracking-widest opacity-50 text-center mt-4 underline"
          >
            J&apos;ai déjà un compte lié à un email
          </button>
        )}

        <Turnstile ref={turnstileRef} onToken={setCaptchaToken} />

        {error && <p className="text-sm text-center mt-4 text-cat-corps">{error}</p>}

        <p className="font-mono text-[10px] opacity-40 text-center mt-5 leading-snug">
          Ton compte Luavio te suit sur PC et mobile : connecte-toi une seule fois par appareil, ta progression reste synchronisée.
        </p>
      </motion.div>
    </main>
  );
}
