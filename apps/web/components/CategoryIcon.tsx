import { createContext, useContext, useId } from "react";
import type { CategoryId } from "@luavio/shared";

const STROKE = "#1A1A2E";
const GradCtx = createContext("g");
function useFill() {
  return `url(#${useContext(GradCtx)})`;
}

const TONES: Record<CategoryId, [string, string]> = {
  corps: ["#FFD9D9", "#E8503F"],
  esprit: ["#E4DEFF", "#6750E8"],
  social: ["#FFE0EE", "#E84B93"],
  altruisme: ["#FFF0C9", "#E8A800"],
  productivite: ["#FFF1B0", "#FFD43B"],
  creation: ["#D7F4E6", "#27AE60"],
  detoxEcran: ["#DDEFFF", "#2F8FE0"],
  bataille: ["#FFE2D2", "#E86A2F"],
};

function IconCorps() {
  return (
    <>
      <circle cx="5" cy="12" r="2.6" fill={useFill()} />
      <circle cx="19" cy="12" r="2.6" fill={useFill()} />
      <rect x="8.6" y="10.2" width="6.8" height="3.6" rx="1.2" fill={useFill()} />
      <line x1="5" y1="12" x2="3" y2="12" strokeLinecap="round" />
      <line x1="19" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <path d="M9.4 11 9.4 13" stroke="#fff" strokeWidth={0.8} opacity={0.7} strokeLinecap="round" />
    </>
  );
}

function IconEsprit() {
  return (
    <>
      <path
        d="M12 3.6c-3.6 0-5.9 2.7-5.9 5.7 0 2.2 1.2 3.4 1.9 4.2.4.5.7 1.1.7 1.7v1.5h6.6v-1.5c0-.6.3-1.2.7-1.7.7-.8 1.9-2 1.9-4.2 0-3-2.3-5.7-5.9-5.7z"
        fill={useFill()}
      />
      <path d="M9 7.4c.9-1 2-1.5 3-1.5" stroke="#fff" strokeWidth={0.9} opacity={0.8} strokeLinecap="round" fill="none" />
      <line x1="9.3" y1="17.6" x2="14.7" y2="17.6" strokeLinecap="round" />
      <line x1="9.8" y1="19.4" x2="14.2" y2="19.4" strokeLinecap="round" />
      <line x1="12" y1="1.6" x2="12" y2="3.2" strokeLinecap="round" />
      <line x1="5.8" y1="3.6" x2="6.9" y2="4.9" strokeLinecap="round" />
      <line x1="18.2" y1="3.6" x2="17.1" y2="4.9" strokeLinecap="round" />
    </>
  );
}

function IconSocial() {
  return (
    <>
      <path
        d="M12 18.8c-4-2.5-7-5.2-7-8.5a4 4 0 0 1 7-2.6 4 4 0 0 1 7 2.6c0 3.3-3 6-7 8.5z"
        fill={useFill()}
      />
      <path d="M9 9.4c.7-.6 1.5-.9 2.2-.9" stroke="#fff" strokeWidth={0.8} opacity={0.75} strokeLinecap="round" fill="none" />
      <circle cx="12" cy="6" r="2.4" fill={useFill()} />
    </>
  );
}

function IconAltruisme() {
  return (
    <>
      <rect x="4.6" y="10" width="14.8" height="9.8" rx="1.6" fill={useFill()} />
      <line x1="4.6" y1="14.2" x2="19.4" y2="14.2" />
      <line x1="12" y1="10" x2="12" y2="19.8" />
      <path d="M8.2 10c-1.6 0-2.9-1.1-2.9-2.7s1.3-2.7 2.9-2.7c1.8 0 4 2 4 5.4" fill="none" strokeLinecap="round" />
      <path d="M15.8 10c1.6 0 2.9-1.1 2.9-2.7s-1.3-2.7-2.9-2.7c-1.8 0-4 2-4 5.4" fill="none" strokeLinecap="round" />
      <path d="M6.4 11.6c.5-.2 1.1-.3 1.6-.3" stroke="#fff" strokeWidth={0.7} opacity={0.7} strokeLinecap="round" fill="none" />
    </>
  );
}

function IconProductivite() {
  return (
    <>
      <path
        d="M12 2.8 14.9 9.4l7.1.6-5.4 4.8 1.6 7-6.2-3.9-6.2 3.9 1.6-7-5.4-4.8 7.1-.6z"
        fill={useFill()}
      />
      <path d="M12 5.4 13.6 9" stroke="#fff" strokeWidth={0.9} opacity={0.75} strokeLinecap="round" />
    </>
  );
}

function IconCreation() {
  return (
    <>
      <path d="M5 19 9 17.6 17.8 8.8l-2.6-2.6L6.4 15z" fill={useFill()} />
      <path d="M14.6 5 17.2 3.2l3.6 3.6-1.8 2.6z" fill={useFill()} />
      <path d="M7.2 16.4 9.6 14" stroke="#fff" strokeWidth={0.8} opacity={0.75} strokeLinecap="round" />
      <line x1="5" y1="19" x2="6.4" y2="15.6" strokeLinecap="round" />
    </>
  );
}

function IconDetox() {
  return (
    <>
      <rect x="4.2" y="5.2" width="15.6" height="11" rx="1.8" fill={useFill()} />
      <path d="M6.4 7.4h6" stroke="#fff" strokeWidth={0.9} opacity={0.7} strokeLinecap="round" />
      <line x1="9.2" y1="19.4" x2="14.8" y2="19.4" strokeLinecap="round" />
      <line x1="4.4" y1="4.2" x2="19.6" y2="19.6" strokeLinecap="round" />
    </>
  );
}

function IconBataille() {
  return (
    <>
      <path d="M12 3.2 18.4 5.8v5.8c0 4.3-2.8 7.3-6.4 8.6-3.6-1.3-6.4-4.3-6.4-8.6V5.8z" fill={useFill()} />
      <path d="M7 7.4c1.4-.7 2.9-1.1 3.6-1.3" stroke="#fff" strokeWidth={0.8} opacity={0.75} strokeLinecap="round" fill="none" />
      <line x1="8.8" y1="9.2" x2="15.2" y2="15.6" strokeLinecap="round" />
      <line x1="15.2" y1="9.2" x2="8.8" y2="15.6" strokeLinecap="round" />
    </>
  );
}

const ICONS: Record<CategoryId, () => JSX.Element> = {
  corps: IconCorps,
  esprit: IconEsprit,
  social: IconSocial,
  altruisme: IconAltruisme,
  productivite: IconProductivite,
  creation: IconCreation,
  detoxEcran: IconDetox,
  bataille: IconBataille,
};

export default function CategoryIcon({
  id,
  size = 24,
  className = "",
}: {
  id: CategoryId;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const Inner = ICONS[id];
  const [from, to] = TONES[id];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={STROKE}
      strokeWidth={1.5}
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id={`catGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <GradCtx.Provider value={`catGrad-${uid}`}>
        <Inner />
      </GradCtx.Provider>
    </svg>
  );
}
