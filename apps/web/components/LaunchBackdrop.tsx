"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import CategoryIcon from "@/components/CategoryIcon";
import type { CategoryId } from "@luavio/shared";

const ORBIT: { id: CategoryId; angle: number }[] = [
  { id: "corps", angle: 0 },
  { id: "esprit", angle: 51 },
  { id: "social", angle: 103 },
  { id: "altruisme", angle: 154 },
  { id: "productivite", angle: 206 },
  { id: "creation", angle: 257 },
  { id: "detoxEcran", angle: 309 },
];

function Cloud({ x, y, scale = 1, opacity = 0.5 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="46" ry="20" fill="#FFFFFF" />
      <ellipse cx="-34" cy="6" rx="28" ry="16" fill="#FFFFFF" />
      <ellipse cx="34" cy="6" rx="28" ry="16" fill="#FFFFFF" />
    </g>
  );
}

export default function LaunchBackdrop() {
  const uid = useId().replace(/:/g, "");

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`launchSky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6750E8" />
            <stop offset="45%" stopColor="#9B8CF0" />
            <stop offset="100%" stopColor="#FFF8E7" />
          </linearGradient>
          <radialGradient id={`launchGlow-${uid}`} cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#FFE17D" stopOpacity={0.85} />
            <stop offset="45%" stopColor="#FFD43B" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FFD43B" stopOpacity={0} />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="1200" height="800" fill={`url(#launchSky-${uid})`} />

        {Array.from({ length: 28 }).map((_, i) => {
          const sx = (i * 137) % 1200;
          const sy = (i * 91) % 360;
          const r = (i % 3) + 1;
          return <circle key={i} cx={sx} cy={sy} r={r} fill="#FFFFFF" opacity={0.25 + (i % 4) * 0.1} />;
        })}

        <circle cx="600" cy="300" r="280" fill={`url(#launchGlow-${uid})`} />

        <Cloud x={170} y={150} scale={1.1} opacity={0.5} />
        <Cloud x={1010} y={210} scale={0.9} opacity={0.4} />
        <Cloud x={620} y={620} scale={1.3} opacity={0.3} />
        <Cloud x={120} y={560} scale={0.8} opacity={0.28} />

        <g opacity={0.16} stroke="#1A1A2E" strokeWidth={3} strokeLinejoin="round">
          <path d="M-20 760 L180 540 L340 700 L520 480 L760 740 L920 560 L1100 700 L1220 620 L1220 800 L-20 800 Z" fill="#6750E8" />
        </g>
        <g opacity={0.12} stroke="#1A1A2E" strokeWidth={3} strokeLinejoin="round">
          <path d="M-20 800 L120 650 L300 760 L480 600 L700 780 L880 640 L1060 760 L1220 680 L1220 800 Z" fill="#FFD43B" />
        </g>
      </svg>

      <motion.div
        className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2"
        style={{ width: 340, height: 340 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        {ORBIT.map((o) => {
          const rad = (o.angle * Math.PI) / 180;
          const radius = 150;
          const cx = 170 + radius * Math.cos(rad);
          const cy = 170 + radius * Math.sin(rad);
          return (
            <motion.div
              key={o.id}
              className="absolute"
              style={{ left: cx - 18, top: cy - 18 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            >
              <div className="rounded-full bg-surface border-2 border-outline p-1.5 shadow-[0_2px_0_rgba(26,26,46,0.25)]">
                <CategoryIcon id={o.id} size={21} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width={86} height={86} viewBox="0 0 24 24" className="drop-shadow-[0_0_18px_rgba(255,212,59,0.65)]">
          <defs>
            <linearGradient id={`launchMark-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE17D" />
              <stop offset="55%" stopColor="#FFD43B" />
              <stop offset="100%" stopColor="#E8A800" />
            </linearGradient>
          </defs>
          <path
            d="M13.2 1.8 5.4 13.4h5l-1.4 8.8 9.6-13H13l1.8-7.4z"
            fill={`url(#launchMark-${uid})`}
            stroke="#1A1A2E"
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,248,231,0) 0%, rgba(255,248,231,0) 55%, rgba(255,248,231,0.85) 82%, rgba(255,248,231,1) 100%)",
        }}
      />
    </div>
  );
}
