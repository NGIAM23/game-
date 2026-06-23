import { useId } from "react";

export default function Logo({ size = 22 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  const markSize = size * 0.85;
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width={markSize} height={markSize} viewBox="0 0 24 24" className="shrink-0">
        <defs>
          <linearGradient id={`logoMarkGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE17D" />
            <stop offset="55%" stopColor="#FFD43B" />
            <stop offset="100%" stopColor="#E8A800" />
          </linearGradient>
        </defs>
        <path
          d="M13.2 1.8 5.4 13.4h5l-1.4 8.8 9.6-13H13l1.8-7.4z"
          fill={`url(#logoMarkGrad-${uid})`}
          stroke="#1A1A2E"
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-heading inline-flex items-baseline gap-0.5" style={{ fontSize: size }}>
        Luav<span className="text-secondary">i</span>o
      </span>
    </span>
  );
}
