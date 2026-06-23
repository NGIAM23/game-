import { createContext, useContext, useId } from "react";
import { TIER_COLORS } from "@luavio/shared";

const STROKE = "#1A1A2E";
const UidCtx = createContext("0");

function Chevron({ y }: { y: number }) {
  return (
    <path
      d={`M6 ${y} 12 ${y - 3} 18 ${y}`}
      fill="none"
      stroke="#fff"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Star({ cx, cy, r = 2.4 }: { cx: number; cy: number; r?: number }) {
  const uid = useContext(UidCtx);
  const pts = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.42;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  }).join(" ");
  return <polygon points={pts} fill={`url(#starGrad-${uid})`} stroke="#fff" strokeWidth={0.6} strokeLinejoin="round" />;
}

function Gem({ cx, cy, r = 4 }: { cx: number; cy: number; r?: number }) {
  const uid = useContext(UidCtx);
  return (
    <>
      <path
        d={`M${cx - r} ${cy} ${cx - r * 0.45} ${cy - r} ${cx + r * 0.45} ${cy - r} ${cx + r} ${cy} ${cx} ${cy + r * 1.15}z`}
        fill={`url(#gemGrad-${uid})`}
        stroke="#fff"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <path d={`M${cx - r * 0.45} ${cy - r} ${cx} ${cy} ${cx + r * 0.45} ${cy - r}`} fill="none" stroke="#fff" strokeWidth={0.6} opacity={0.8} />
      <path d={`M${cx - r} ${cy} ${cx} ${cy} ${cx} ${cy + r * 1.15}`} fill="none" stroke="#fff" strokeWidth={0.5} opacity={0.6} />
    </>
  );
}

function Wings({ y }: { y: number }) {
  return (
    <>
      <path d={`M12 ${y} 7.5 ${y - 1.6} 5 ${y + 0.6} 8 ${y + 1.6}z`} fill="#fff" opacity={0.92} />
      <path d={`M12 ${y} 16.5 ${y - 1.6} 19 ${y + 0.6} 16 ${y + 1.6}z`} fill="#fff" opacity={0.92} />
    </>
  );
}

function Crown() {
  const uid = useContext(UidCtx);
  return (
    <path
      d="M7 16.6 6 11l2.6 1.8L12 9.4l3.4 3.4L18 11l-1 5.6z"
      fill={`url(#crownGrad-${uid})`}
      stroke="#fff"
      strokeWidth={1}
      strokeLinejoin="round"
    />
  );
}

function EmblemFer() {
  return <Chevron y={14} />;
}
function EmblemBronze() {
  return (
    <>
      <Chevron y={12} />
      <Chevron y={15.6} />
    </>
  );
}
function EmblemArgent() {
  return (
    <>
      <Chevron y={10.4} />
      <Chevron y={13.6} />
      <Chevron y={16.8} />
    </>
  );
}
function EmblemOr() {
  return <Star cx={12} cy={13.5} r={3.6} />;
}
function EmblemPlatine() {
  return (
    <>
      <Star cx={9} cy={13.5} r={2.7} />
      <Star cx={15} cy={13.5} r={2.7} />
    </>
  );
}
function EmblemDiamant() {
  return <Gem cx={12} cy={13} r={4.2} />;
}
function EmblemMaitre() {
  return (
    <>
      <Star cx={12} cy={10.8} r={2.5} />
      <Star cx={8.2} cy={15.4} r={2.1} />
      <Star cx={15.8} cy={15.4} r={2.1} />
    </>
  );
}
function EmblemGrandMaitre() {
  return (
    <>
      <Wings y={12.6} />
      <Star cx={12} cy={12.6} r={2.6} />
      <path d="M7 17c1.5 1.2 3.2 1.8 5 1.8s3.5-.6 5-1.8" fill="none" stroke="#fff" strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}
function EmblemHeros() {
  return (
    <>
      <Wings y={11.8} />
      <Gem cx={12} cy={13.6} r={3.2} />
    </>
  );
}
function EmblemLegende() {
  return (
    <>
      <Crown />
      <Star cx={12} cy={17.6} r={1.7} />
    </>
  );
}
function EmblemMythique() {
  return (
    <>
      <circle cx="12" cy="13" r="8.6" fill="none" stroke="#fff" strokeWidth={0.7} strokeDasharray="1.4 2.2" opacity={0.85} />
      <Wings y={11} />
      <Crown />
      <Star cx={12} cy={18} r={1.9} />
    </>
  );
}

const EMBLEMS: Record<string, () => JSX.Element> = {
  Fer: EmblemFer,
  Bronze: EmblemBronze,
  Argent: EmblemArgent,
  Or: EmblemOr,
  Platine: EmblemPlatine,
  Diamant: EmblemDiamant,
  Maître: EmblemMaitre,
  "Grand Maître": EmblemGrandMaitre,
  Héros: EmblemHeros,
  Légende: EmblemLegende,
  Mythique: EmblemMythique,
};

function shade(hex: string, amt: number) {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function RankBadge({
  tier,
  size = 48,
  className = "",
}: {
  tier: string;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const color = TIER_COLORS[tier] ?? "#6B7280";
  const light = shade(color, 55);
  const dark = shade(color, -45);
  const Emblem = EMBLEMS[tier] ?? EmblemFer;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id={`shieldGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`starGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="100%" stopColor="#FFD43B" />
        </linearGradient>
        <linearGradient id={`gemGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0F2FF" />
          <stop offset="100%" stopColor="#6750E8" />
        </linearGradient>
        <linearGradient id={`crownGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="100%" stopColor="#E8A800" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.6 20.4 4.8v6.4c0 5.6-3.6 9.4-8.4 10.8-4.8-1.4-8.4-5.2-8.4-10.8V4.8z"
        fill={`url(#shieldGrad-${uid})`}
        stroke={STROKE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M12 1.6 20.4 4.8v6.4c0 .55-.04 1.07-.1 1.58C18 9.4 12 7.6 12 7.6z"
        fill="#fff"
        opacity={0.22}
      />
      <path
        d="M4.6 5.6 12 3v3.4c-2.6.4-5.4 1.6-7.1 2.8 0-1.2.05-2.4.1-3.6z"
        fill="#fff"
        opacity={0.3}
      />
      <UidCtx.Provider value={uid}>
        <Emblem />
      </UidCtx.Provider>
      <path
        d="M12 1.6 20.4 4.8v6.4c0 5.6-3.6 9.4-8.4 10.8-4.8-1.4-8.4-5.2-8.4-10.8V4.8z"
        fill="none"
        stroke="#fff"
        strokeWidth={0.6}
        strokeOpacity={0.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
