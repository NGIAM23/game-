const SCENES: Record<string, () => JSX.Element> = {
  dashboard: SceneDashboard,
  tasks: SceneTasks,
  leaderboard: SceneLeaderboard,
  friends: SceneFriends,
  shop: SceneShop,
  profile: SceneProfile,
};

export type PageBackdropId = keyof typeof SCENES;

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity={0.55}>
      <ellipse cx="0" cy="0" rx="34" ry="16" />
      <ellipse cx="26" cy="-8" rx="22" ry="14" />
      <ellipse cx="-26" cy="-6" rx="20" ry="13" />
    </g>
  );
}

function SceneDashboard() {
  return (
    <>
      <defs>
        <linearGradient id="bdSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4DEFF" />
          <stop offset="55%" stopColor="#FFE9B8" />
          <stop offset="100%" stopColor="#FFF8E7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bdSky)" />
      <circle cx="1040" cy="130" r="80" fill="#FFD43B" opacity={0.55} />
      <Cloud x={180} y={120} s={1.3} />
      <Cloud x={650} y={70} s={0.9} />
      <path d="M0 560 Q 300 460 620 540 T 1200 520 V800 H0z" fill="#6750E8" opacity={0.16} />
      <path d="M0 640 Q 350 560 700 630 T 1200 610 V800 H0z" fill="#6750E8" opacity={0.22} />
      <path d="M540 400 520 470 600 440 580 510 660 470 600 540 720 470z" fill="#FFD43B" opacity={0.3} stroke="#1A1A2E" strokeOpacity={0.15} strokeWidth={2} />
      <rect x="560" y="540" width="16" height="60" fill="#1A1A2E" opacity={0.18} />
      <path d="M576 540 660 565 576 590z" fill="#E8503F" opacity={0.3} />
    </>
  );
}

function SceneTasks() {
  return (
    <>
      <defs>
        <linearGradient id="bdBoard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE9B8" />
          <stop offset="100%" stopColor="#FFF8E7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bdBoard)" />
      <g opacity={0.22}>
        <rect x="120" y="90" width="180" height="240" rx="10" fill="#fff" stroke="#1A1A2E" strokeWidth={3} transform="rotate(-8 210 210)" />
        <rect x="900" y="120" width="170" height="230" rx="10" fill="#fff" stroke="#1A1A2E" strokeWidth={3} transform="rotate(7 985 235)" />
      </g>
      <g opacity={0.28} stroke="#1A1A2E" strokeWidth={4} strokeLinecap="round">
        <path d="M155 150 175 170 215 130" fill="none" transform="rotate(-8 210 210)" />
        <path d="M155 220 175 240 215 200" fill="none" transform="rotate(-8 210 210)" />
        <path d="M935 175 955 195 995 155" fill="none" transform="rotate(7 985 235)" />
      </g>
      <circle cx="600" cy="650" r="240" fill="#FFD43B" opacity={0.14} />
      <path d="M520 700 600 560 680 700z" fill="none" stroke="#6750E8" strokeWidth={3} opacity={0.18} strokeLinejoin="round" />
    </>
  );
}

function SceneLeaderboard() {
  return (
    <>
      <defs>
        <linearGradient id="bdArena" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD9E8" />
          <stop offset="55%" stopColor="#FFE9B8" />
          <stop offset="100%" stopColor="#FFF8E7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bdArena)" />
      <g opacity={0.3}>
        <path d="M0 760 1200 760 1200 800 0 800z" fill="#1A1A2E" opacity={0.1} />
        <rect x="500" y="600" width="200" height="160" fill="#FFD43B" opacity={0.5} />
        <rect x="330" y="650" width="160" height="110" fill="#E8E8E8" opacity={0.5} />
        <rect x="710" y="670" width="160" height="90" fill="#F4B98A" opacity={0.5} />
      </g>
      <g opacity={0.25} stroke="#1A1A2E" strokeWidth={2}>
        <line x1="600" y1="200" x2="600" y2="600" />
      </g>
      <g opacity={0.35} fill="#6750E8">
        <circle cx="200" cy="180" r="6" />
        <circle cx="260" cy="240" r="5" />
        <circle cx="950" cy="160" r="6" />
        <circle cx="1010" cy="220" r="5" />
        <circle cx="600" cy="120" r="7" />
      </g>
      <path d="M540 130 600 70 660 130 600 90z" fill="#FFD43B" opacity={0.4} stroke="#1A1A2E" strokeOpacity={0.15} strokeWidth={2} />
    </>
  );
}

function SceneFriends() {
  return (
    <>
      <defs>
        <linearGradient id="bdVillage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D7F0FF" />
          <stop offset="60%" stopColor="#FFF1D6" />
          <stop offset="100%" stopColor="#FFF8E7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bdVillage)" />
      <Cloud x={300} y={110} s={1} />
      <Cloud x={920} y={90} s={0.8} />
      <path d="M0 600 Q 300 540 600 590 T 1200 570 V800 H0z" fill="#27AE60" opacity={0.16} />
      <g opacity={0.32}>
        <rect x="220" y="500" width="120" height="100" fill="#E84B93" />
        <path d="M210 500 280 440 350 500z" fill="#1A1A2E" opacity={0.6} />
        <rect x="780" y="520" width="110" height="90" fill="#6750E8" />
        <path d="M770 520 835 465 900 520z" fill="#1A1A2E" opacity={0.6} />
      </g>
      <path d="M280 600 Q 600 540 880 610" fill="none" stroke="#E8A800" strokeOpacity={0.3} strokeWidth={6} strokeDasharray="14 12" />
    </>
  );
}

function SceneShop() {
  return (
    <>
      <defs>
        <linearGradient id="bdMarket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE2D2" />
          <stop offset="55%" stopColor="#FFE9B8" />
          <stop offset="100%" stopColor="#FFF8E7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bdMarket)" />
      <g opacity={0.3}>
        <path d="M180 380 320 380 350 460 150 460z" fill="#E8503F" />
        <path d="M180 380 250 320 320 380z" fill="#1A1A2E" opacity={0.5} />
        <path d="M900 400 1040 400 1065 470 875 470z" fill="#6750E8" />
        <path d="M900 400 970 340 1040 400z" fill="#1A1A2E" opacity={0.5} />
      </g>
      <g opacity={0.3} fill="#FFD43B" stroke="#1A1A2E" strokeOpacity={0.2} strokeWidth={2}>
        <circle cx="600" cy="640" r="14" />
        <circle cx="640" cy="660" r="11" />
        <circle cx="560" cy="665" r="10" />
        <circle cx="610" cy="690" r="9" />
      </g>
      <path d="M520 700 H700 L680 600 H540z" fill="#E8A800" opacity={0.2} stroke="#1A1A2E" strokeOpacity={0.15} strokeWidth={3} />
    </>
  );
}

function SceneProfile() {
  return (
    <>
      <defs>
        <linearGradient id="bdStage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4DEFF" />
          <stop offset="55%" stopColor="#F6E9FF" />
          <stop offset="100%" stopColor="#FFF8E7" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bdStage)" />
      <g opacity={0.2} fill="#6750E8">
        <path d="M120 0 H260 L240 360 Q190 400 140 360z" />
        <path d="M940 0 H1080 L1060 360 Q1010 400 960 360z" />
      </g>
      <g opacity={0.35} stroke="#1A1A2E" strokeOpacity={0.15} strokeWidth={3}>
        <path d="M560 420 600 340 640 420" fill="#FFD43B" />
        <rect x="580" y="420" width="40" height="50" fill="#FFD43B" />
      </g>
      <g opacity={0.3} fill="#E8A800">
        <circle cx="450" cy="240" r="6" />
        <circle cx="750" cy="220" r="6" />
        <circle cx="600" cy="180" r="7" />
      </g>
    </>
  );
}

export default function PageBackdrop({ id }: { id: PageBackdropId }) {
  const Scene = SCENES[id];
  if (!Scene) return null;
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
        <Scene />
      </svg>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,248,231,0) 0%, rgba(255,248,231,0.55) 70%, rgba(255,248,231,0.9) 100%)" }}
      />
    </div>
  );
}
