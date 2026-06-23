"use client";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("luavio_sound") !== "off";
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem("luavio_sound", enabled ? "on" : "off");
}

function tone(freq: number, start: number, duration: number, gainPeak: number, type: OscillatorType = "sine") {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainPeak, audio.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration);
}

function play(fn: () => void) {
  if (!isSoundEnabled()) return;
  try {
    fn();
  } catch {
    // ignore: audio may be blocked until first user gesture
  }
}

export function playTaskComplete() {
  play(() => {
    tone(660, 0, 0.12, 0.12);
    tone(880, 0.08, 0.18, 0.12);
  });
}

export function playLevelUp() {
  play(() => {
    tone(523, 0, 0.12, 0.14);
    tone(659, 0.1, 0.12, 0.14);
    tone(784, 0.2, 0.12, 0.14);
    tone(1047, 0.32, 0.25, 0.16);
  });
}

export function playClick() {
  play(() => {
    tone(440, 0, 0.06, 0.06, "triangle");
  });
}

export function playError() {
  play(() => {
    tone(220, 0, 0.18, 0.1, "sawtooth");
  });
}

// Tâche faite : tic de suspens qui monte en hauteur/intensité avec le nombre
// de tâches déjà complétées (combo), pour donner une sensation de montée.
export function playSuspense(comboCount: number) {
  play(() => {
    const step = Math.min(comboCount, 10);
    const freq = 300 + step * 45;
    const gain = Math.min(0.06 + step * 0.01, 0.18);
    tone(freq, 0, 0.1, gain, "triangle");
    tone(freq * 1.5, 0.06, 0.12, gain * 0.8, "triangle");
  });
}

// Toutes les tâches du jour terminées : fanfare finale.
export function playVictory() {
  play(() => {
    tone(523, 0, 0.14, 0.16);
    tone(659, 0.12, 0.14, 0.16);
    tone(784, 0.24, 0.14, 0.16);
    tone(988, 0.36, 0.16, 0.18);
    tone(1318, 0.5, 0.35, 0.2);
  });
}
