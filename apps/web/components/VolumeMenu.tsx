"use client";

import { useEffect, useRef, useState } from "react";
import { getVolume, setVolume, type VolumeChannel } from "@/lib/sound";

const CHANNELS: { key: VolumeChannel; label: string; icon: string }[] = [
  { key: "ambient", label: "Musique de fond", icon: "🎵" },
  { key: "duel", label: "Musique de duel", icon: "⚔️" },
  { key: "effects", label: "Effets sonores", icon: "🔔" },
];

export default function VolumeMenu() {
  const [open, setOpen] = useState(false);
  const [volumes, setVolumes] = useState<Record<VolumeChannel, number>>({ ambient: 1, duel: 1, effects: 1 });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVolumes({ ambient: getVolume("ambient"), duel: getVolume("duel"), effects: getVolume("effects") });
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function updateVolume(channel: VolumeChannel, value: number) {
    setVolume(channel, value);
    setVolumes((prev) => ({ ...prev, [channel]: value }));
  }

  return (
    <div ref={ref} className="fixed top-4 right-4 z-30 lg:absolute lg:top-7 lg:right-7">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Réglages de volume"
        className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-outline bg-surface shadow-[0_3px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition"
      >
        <span className="text-lg">🎚️</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-surface border-2 border-outline rounded-sticker shadow-[0_4px_0_0_#1A1A2E] p-4">
          <h3 className="font-heading text-sm mb-3">🎚️ Volume</h3>
          <div className="flex flex-col gap-3">
            {CHANNELS.map((c) => (
              <div key={c.key}>
                <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
                  <span>{c.icon} {c.label}</span>
                  <span>{Math.round(volumes[c.key] * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volumes[c.key]}
                  onChange={(e) => updateVolume(c.key, Number(e.target.value))}
                  className="w-full accent-secondary"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
