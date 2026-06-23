import { TIER_COLORS } from "@luavio/shared";

const STROKE = "#1A1A2E";

function Chevron({ y }: { y: number }) {
  return <path d={`M6 ${y} 12 ${y - 3} 18 ${y}`} fill="none" />;
}

function Star({ cx, cy, r = 2.4 }: { cx: number; cy: number; r?: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.42;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  }).join(" ");
  return <polygon points={pts} fill="#fff" stroke="none" />;
}

function EmblemFer() {
  return <Chevron y={13.5} />;
}
function EmblemBronze() {
  return (
    <>
      <Chevron y={11.5} />
      <Chevron y={15} />
    </>
  );
}
function EmblemArgent() {
  return (
    <>
      <Chevron y={10} />
      <Chevron y={13.2} />
      <Chevron y={16.4} />
    </>
  );
}
function EmblemOr() {
  return <Star cx={12} cy={13.5} r={3.4} />;
}
function EmblemPlatine() {
  return (
    <>
      <Star cx={9} cy={13.5} r={2.6} />
      <Star cx={15} cy={13.5} r={2.6} />
    </>
  );
}
function EmblemDiamant() {
  return <path d="M8 12 12 8.5 16 12 12 17.5z" fill="#fff" stroke="none" />;
}
function EmblemMaitre() {
  return (
    <>
      <Star cx={12} cy={10.6} r={2.4} />
      <Star cx={8.4} cy={15} r={2.1} />
      <Star cx={15.6} cy={15} r={2.1} />
    </>
  );
}
function EmblemGrandMaitre() {
  return (
    <>
      <Star cx={12} cy={11.6} r={3} />
      <path d="M7 16.5c1.5 1.2 3.2 1.8 5 1.8s3.5-.6 5-1.8" fill="none" />
    </>
  );
}
function EmblemHeros() {
  return (
    <>
      <Star cx={12} cy={12.8} r={3.2} />
      <path d="M5.5 14c1.4-2.2 3-3.2 3-3.2" fill="none" strokeLinecap="round" />
      <path d="M18.5 14c-1.4-2.2-3-3.2-3-3.2" fill="none" strokeLinecap="round" />
    </>
  );
}
function EmblemLegende() {
  return (
    <>
      <path d="M7 11 9 14.5 12 9.5 15 14.5 17 11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Star cx={12} cy={16.2} r={1.6} />
    </>
  );
}
function EmblemMythique() {
  return (
    <>
      <path d="M7 11 9 14.5 12 9.5 15 14.5 17 11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Star cx={12} cy={16.2} r={2.1} />
      <circle cx="12" cy="13" r="8.4" fill="none" strokeDasharray="1.5 2.4" />
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

export default function RankBadge({
  tier,
  size = 48,
  className = "",
}: {
  tier: string;
  size?: number;
  className?: string;
}) {
  const color = TIER_COLORS[tier] ?? "#6B7280";
  const Emblem = EMBLEMS[tier] ?? EmblemFer;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2 20 5v6c0 5.2-3.4 8.8-8 10-4.6-1.2-8-4.8-8-10V5z"
        fill={color}
        stroke={STROKE}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <g stroke="#fff" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <Emblem />
      </g>
    </svg>
  );
}
