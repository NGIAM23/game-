import type { CategoryId } from "@luavio/shared";

const STROKE = "#1A1A2E";

function IconCorps() {
  return (
    <>
      <circle cx="5" cy="12" r="2.4" />
      <circle cx="19" cy="12" r="2.4" />
      <rect x="8.8" y="10.4" width="6.4" height="3.2" rx="1" />
      <line x1="5" y1="12" x2="3.2" y2="12" strokeLinecap="round" />
      <line x1="19" y1="12" x2="20.8" y2="12" strokeLinecap="round" />
    </>
  );
}

function IconEsprit() {
  return (
    <>
      <path d="M12 4.2c-3.3 0-5.4 2.5-5.4 5.2 0 2 1.1 3.1 1.7 3.8.4.5.6 1 .6 1.6v1.4h6.2v-1.4c0-.6.2-1.1.6-1.6.6-.7 1.7-1.8 1.7-3.8 0-2.7-2.1-5.2-5.4-5.2z" fill="#fff" />
      <line x1="9.6" y1="17.6" x2="14.4" y2="17.6" strokeLinecap="round" />
      <line x1="10" y1="19.4" x2="14" y2="19.4" strokeLinecap="round" />
      <line x1="12" y1="2" x2="12" y2="3.4" strokeLinecap="round" />
      <line x1="6.5" y1="4" x2="7.4" y2="5.1" strokeLinecap="round" />
      <line x1="17.5" y1="4" x2="16.6" y2="5.1" strokeLinecap="round" />
    </>
  );
}

function IconSocial() {
  return (
    <>
      <path d="M12 18.4c-3.6-2.3-6.4-4.7-6.4-7.7a3.6 3.6 0 0 1 6.4-2.2 3.6 3.6 0 0 1 6.4 2.2c0 3-2.8 5.4-6.4 7.7z" fill="#fff" />
      <circle cx="12" cy="6.4" r="2.2" fill="none" />
    </>
  );
}

function IconAltruisme() {
  return (
    <>
      <rect x="5" y="10.4" width="14" height="9.2" rx="1.4" fill="#fff" />
      <line x1="5" y1="14" x2="19" y2="14" />
      <line x1="12" y1="10.4" x2="12" y2="19.6" />
      <path d="M8.4 10.4c-1.4 0-2.6-1-2.6-2.4S7 5.6 8.4 5.6c1.6 0 3.6 1.8 3.6 4.8" fill="none" strokeLinecap="round" />
      <path d="M15.6 10.4c1.4 0 2.6-1 2.6-2.4S17 5.6 15.6 5.6c-1.6 0-3.6 1.8-3.6 4.8" fill="none" strokeLinecap="round" />
    </>
  );
}

function IconProductivite() {
  return (
    <>
      <path d="M12 3.4 14.6 9.6l6.6.6-5 4.4 1.5 6.4-5.7-3.6-5.7 3.6 1.5-6.4-5-4.4 6.6-.6z" fill="#fff" />
    </>
  );
}

function IconCreation() {
  return (
    <>
      <path d="M5.4 18.6 9 17.4l8.6-8.6-2.4-2.4-8.6 8.6z" fill="#fff" />
      <path d="M14.4 5.6 16.8 4l3.2 3.2-1.6 2.4z" fill="#fff" />
      <line x1="5.4" y1="18.6" x2="6.6" y2="15.6" strokeLinecap="round" />
    </>
  );
}

function IconDetox() {
  return (
    <>
      <rect x="4.4" y="5.6" width="15.2" height="10.4" rx="1.6" fill="#fff" />
      <line x1="9.4" y1="19.2" x2="14.6" y2="19.2" strokeLinecap="round" />
      <line x1="4.6" y1="4.6" x2="19.4" y2="19.4" strokeLinecap="round" />
    </>
  );
}

function IconBataille() {
  return (
    <>
      <path d="M12 3.6 18 6v5.4c0 4-2.6 6.8-6 8-3.4-1.2-6-4-6-8V6z" fill="#fff" />
      <line x1="9" y1="9.4" x2="15" y2="15.4" strokeLinecap="round" />
      <line x1="15" y1="9.4" x2="9" y2="15.4" strokeLinecap="round" />
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
  const Inner = ICONS[id];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={STROKE}
      strokeWidth={1.6}
      strokeLinejoin="round"
      className={className}
    >
      <Inner />
    </svg>
  );
}
