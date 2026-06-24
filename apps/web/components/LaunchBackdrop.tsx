"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import CategoryIcon from "@/components/CategoryIcon";
import type { CategoryId } from "@luavio/shared";

const LEFT_BANNER: CategoryId[] = ["corps", "esprit", "social"];
const RIGHT_BANNER: CategoryId[] = ["altruisme", "productivite", "creation"];

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  x: 6 + ((i * 173) % 88),
  size: 3 + (i % 3) * 2,
  duration: 4.5 + (i % 5) * 1.1,
  delay: (i % 7) * 0.6,
  drift: i % 2 === 0 ? 14 : -14,
}));

function Cloud({ x, y, scale = 1, opacity = 0.5 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="46" ry="20" fill="#FFFFFF" />
      <ellipse cx="-34" cy="6" rx="28" ry="16" fill="#FFFFFF" />
      <ellipse cx="34" cy="6" rx="28" ry="16" fill="#FFFFFF" />
    </g>
  );
}

function MountainRow({
  id,
  fill,
  opacity,
  baseY,
  amplitude,
  duration,
  reverse,
}: {
  id: string;
  fill: string;
  opacity: number;
  baseY: number;
  amplitude: number;
  duration: number;
  reverse?: boolean;
}) {
  const peaks = "0,0 90,-1 200,-1 320,-1 420,-1 1200,-1";
  const path = `M0 ${baseY} L80 ${baseY - amplitude} L200 ${baseY - amplitude * 0.5} L330 ${baseY - amplitude * 1.15} L470 ${baseY - amplitude * 0.4} L620 ${baseY - amplitude} L760 ${baseY - amplitude * 0.6} L900 ${baseY - amplitude * 1.05} L1040 ${baseY - amplitude * 0.45} L1200 ${baseY - amplitude * 0.85} L1200 800 L0 800 Z`;
  void peaks;
  return (
    <motion.div
      className="absolute inset-0"
      style={{ width: "200%" }}
      animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 2400 800" width="100%" height="100%" preserveAspectRatio="none">
        <path d={path} fill={fill} opacity={opacity} transform="translate(0 0)" />
        <path d={path} fill={fill} opacity={opacity} transform="translate(1200 0)" />
      </svg>
    </motion.div>
  );
}

function BannerColumn({ ids, side, uid }: { ids: CategoryId[]; side: "left" | "right"; uid: string }) {
  const lean = side === "left" ? -3 : 3;
  return (
    <motion.div
      className="absolute top-[20%] flex flex-col items-center gap-2"
      style={side === "left" ? { left: "12%" } : { right: "12%" }}
      animate={{ rotate: [lean, -lean, lean], y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="44" height="64" viewBox="0 0 44 64" className="drop-shadow-[0_3px_0_rgba(26,26,46,0.25)]">
        <defs>
          <linearGradient id={`banner-${side}-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={side === "left" ? "#6750E8" : "#FFD43B"} />
            <stop offset="100%" stopColor={side === "left" ? "#4B3CC4" : "#E8A800"} />
          </linearGradient>
        </defs>
        <path
          d="M2 2h40v52l-20 8-20-8z"
          fill={`url(#banner-${side}-${uid})`}
          stroke="#1A1A2E"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col gap-1.5 -mt-12">
        {ids.map((id, i) => (
          <motion.div
            key={id}
            className="rounded-full bg-surface border-2 border-outline p-1 shadow-[0_2px_0_rgba(26,26,46,0.25)]"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
          >
            <CategoryIcon id={id} size={16} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function LaunchBackdrop() {
  const uid = useId().replace(/:/g, "");

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`launchSky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4E3DC9" />
            <stop offset="40%" stopColor="#8A7AEC" />
            <stop offset="78%" stopColor="#FFD9A0" />
            <stop offset="100%" stopColor="#FFF8E7" />
          </linearGradient>
          <radialGradient id={`launchGlow-${uid}`} cx="50%" cy="34%" r="38%">
            <stop offset="0%" stopColor="#FFE17D" stopOpacity={0.95} />
            <stop offset="45%" stopColor="#FFD43B" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#FFD43B" stopOpacity={0} />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="1200" height="800" fill={`url(#launchSky-${uid})`} />

        {Array.from({ length: 30 }).map((_, i) => {
          const sx = (i * 137) % 1200;
          const sy = (i * 91) % 280;
          const r = (i % 3) + 1;
          return <circle key={i} cx={sx} cy={sy} r={r} fill="#FFFFFF" opacity={0.25 + (i % 4) * 0.1} />;
        })}

        <circle cx="600" cy="280" r="240" fill={`url(#launchGlow-${uid})`} />

        <Cloud x={150} y={130} scale={1.1} opacity={0.55} />
        <Cloud x={1040} y={170} scale={0.9} opacity={0.4} />
        <Cloud x={90} y={280} scale={0.7} opacity={0.3} />
      </svg>

      {/* sunburst rays behind the arena */}
      <motion.div
        className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2"
        style={{ width: 460, height: 460 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="97"
              y="0"
              width="6"
              height="90"
              rx="3"
              fill="#FFD43B"
              opacity={0.18}
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </svg>
      </motion.div>

      {/* parallax mountain ranges */}
      <div className="absolute inset-x-0 bottom-0 h-[58%]">
        <MountainRow id="far" fill="#6750E8" opacity={0.22} baseY={620} amplitude={70} duration={55} reverse />
        <MountainRow id="mid" fill="#4B3CC4" opacity={0.28} baseY={680} amplitude={90} duration={38} />
        <MountainRow id="near" fill="#1A1A2E" opacity={0.12} baseY={760} amplitude={60} duration={26} reverse />
      </div>

      {/* rising embers */}
      {EMBERS.map((e, i) => (
        <motion.div
          key={i}
          className="absolute bottom-[22%] rounded-full"
          style={{ left: `${e.x}%`, width: e.size, height: e.size, background: i % 3 === 0 ? "#FFD43B" : "#FF8C42" }}
          animate={{ y: [0, -220], x: [0, e.drift], opacity: [0, 0.85, 0] }}
          transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      {/* banner pillars flanking the arena, holding the category icons */}
      <BannerColumn ids={LEFT_BANNER} side="left" uid={uid} />
      <BannerColumn ids={RIGHT_BANNER} side="right" uid={uid} />

      {/* central glowing portal with the lightning mark */}
      <motion.div
        className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute rounded-full"
            style={{ width: 150, height: 150, background: "radial-gradient(circle, rgba(255,212,59,0.55), transparent 70%)" }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <svg width={92} height={92} viewBox="0 0 24 24" className="relative drop-shadow-[0_0_20px_rgba(255,212,59,0.75)]">
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
        </div>
      </motion.div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,248,231,0) 0%, rgba(255,248,231,0) 50%, rgba(255,248,231,0.82) 80%, rgba(255,248,231,1) 100%)",
        }}
      />
    </div>
  );
}
