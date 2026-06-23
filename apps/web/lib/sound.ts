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

export type VolumeChannel = "ambient" | "duel" | "effects";

const DEFAULT_VOLUME: Record<VolumeChannel, number> = { ambient: 0.6, duel: 1, effects: 1 };

export function getVolume(channel: VolumeChannel): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME[channel];
  const raw = localStorage.getItem(`luavio_vol_${channel}`);
  return raw !== null ? Number(raw) : DEFAULT_VOLUME[channel];
}

export function setVolume(channel: VolumeChannel, value: number) {
  localStorage.setItem(`luavio_vol_${channel}`, String(Math.max(0, Math.min(1, value))));
}

function tone(freq: number, start: number, duration: number, gainPeak: number, type: OscillatorType = "sine", channel: VolumeChannel = "effects") {
  const audio = getCtx();
  if (!audio) return;
  const peak = gainPeak * getVolume(channel);
  if (peak <= 0) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(peak, audio.currentTime + start + 0.01);
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
    tone(660, 0, 0.12, 0.12, "sine", "effects");
    tone(880, 0.08, 0.18, 0.12, "sine", "effects");
  });
}

export function playLevelUp() {
  play(() => {
    tone(523, 0, 0.12, 0.14, "sine", "effects");
    tone(659, 0.1, 0.12, 0.14, "sine", "effects");
    tone(784, 0.2, 0.12, 0.14, "sine", "effects");
    tone(1047, 0.32, 0.25, 0.16, "sine", "effects");
  });
}

export function playClick() {
  play(() => {
    tone(440, 0, 0.06, 0.06, "triangle", "effects");
  });
}

export function playError() {
  play(() => {
    tone(220, 0, 0.18, 0.1, "sawtooth", "effects");
  });
}

// Musique de fond calme, en boucle, à volume discret pendant toute la partie.
const AMBIENT_CHORD = [220, 277.18, 329.63]; // accord doux (A3, C#4, E4)
let ambientInterval: ReturnType<typeof setInterval> | null = null;
let ambientPlaying = false;

function ambientPad() {
  const audio = getCtx();
  const vol = getVolume("ambient");
  if (!audio || vol <= 0) return;
  AMBIENT_CHORD.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = audio.currentTime + i * 0.18;
    const duration = 6.5;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.025 * vol, start + 1.8);
    gain.gain.linearRampToValueAtTime(0, start + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration);
  });
}

export function startAmbientMusic() {
  if (ambientPlaying || !isSoundEnabled()) return;
  ambientPlaying = true;
  ambientPad();
  ambientInterval = setInterval(() => {
    if (!isSoundEnabled()) {
      stopAmbientMusic();
      return;
    }
    ambientPad();
  }, 5500);
}

export function stopAmbientMusic() {
  ambientPlaying = false;
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}

// Son de plus en plus tendu à chaque mission de duel réussie : la hauteur
// monte et une couche supplémentaire s'ajoute avec le combo.
export function playMissionSuspense(comboIndex: number) {
  play(() => {
    const base = 420 + comboIndex * 55;
    const gap = Math.max(0.05, 0.13 - comboIndex * 0.012);
    tone(base, 0, 0.1, 0.11, "triangle", "duel");
    tone(base * 1.5, gap, 0.12, 0.11, "triangle", "duel");
    if (comboIndex >= 2) tone(base * 2, gap * 2, 0.14, 0.12, "sawtooth", "duel");
    if (comboIndex >= 4) tone(base * 2.5, gap * 2.6, 0.18, 0.13, "sawtooth", "duel");
  });
}

export function playDuelVictory() {
  play(() => {
    tone(523, 0, 0.12, 0.14, "sine", "duel");
    tone(659, 0.1, 0.12, 0.14, "sine", "duel");
    tone(784, 0.2, 0.12, 0.14, "sine", "duel");
    tone(1047, 0.32, 0.25, 0.16, "sine", "duel");
  });
}
