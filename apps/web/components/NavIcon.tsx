export type NavIconId = "home" | "tasks" | "leaderboard" | "friends" | "shop" | "profile" | "admin" | "logout";

function IconHome() {
  return (
    <>
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10.4V19a1 1 0 0 0 1 1h3v-4.6h4V20h3a1 1 0 0 0 1-1v-8.6" strokeLinejoin="round" />
    </>
  );
}

function IconTasks() {
  return (
    <>
      <rect x="4.4" y="4.4" width="15.2" height="15.2" rx="3" />
      <path d="M8 12.2 10.6 14.8 16 9.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function IconLeaderboard() {
  return (
    <>
      <path d="M7 4h10v5.4c0 3-2.2 5.4-5 5.4s-5-2.4-5-5.4z" strokeLinejoin="round" />
      <path d="M7 6H4.6c0 2.4 1 3.8 2.6 4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h2.4c0 2.4-1 3.8-2.6 4.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="14.8" x2="12" y2="17.4" strokeLinecap="round" />
      <path d="M8.4 20h7.2l-1-2.6h-5.2z" strokeLinejoin="round" />
    </>
  );
}

function IconFriends() {
  return (
    <>
      <circle cx="9" cy="8.4" r="2.6" />
      <path d="M4 19c0-3 2.2-5 5-5s5 2 5 5" strokeLinecap="round" />
      <circle cx="16.4" cy="9.4" r="2.1" />
      <path d="M14.6 19c.2-2.2 1.6-3.8 3.4-3.8 2 0 3.6 1.8 3.6 4.3" strokeLinecap="round" />
    </>
  );
}

function IconShop() {
  return (
    <>
      <path d="M12 3 14 9 20 9.6 15.4 13.4 16.8 19.6 12 16.4 7.2 19.6 8.6 13.4 4 9.6 10 9z" strokeLinejoin="round" />
    </>
  );
}

function IconProfile() {
  return (
    <>
      <circle cx="12" cy="8.6" r="3.4" />
      <path d="M5 19.4c0-3.6 3.2-6 7-6s7 2.4 7 6" strokeLinecap="round" />
    </>
  );
}

function IconAdmin() {
  return (
    <>
      <line x1="5" y1="20" x2="19" y2="20" strokeLinecap="round" />
      <rect x="6" y="13" width="3.2" height="7" />
      <rect x="10.4" y="9" width="3.2" height="11" />
      <rect x="14.8" y="5" width="3.2" height="15" />
    </>
  );
}

function IconLogout() {
  return (
    <>
      <path d="M9 4.4H6a1.6 1.6 0 0 0-1.6 1.6v12a1.6 1.6 0 0 0 1.6 1.6h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.4 8 18.4 12 14.4 16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="18.4" y1="12" x2="9.4" y2="12" strokeLinecap="round" />
    </>
  );
}

const ICONS: Record<NavIconId, () => JSX.Element> = {
  home: IconHome,
  tasks: IconTasks,
  leaderboard: IconLeaderboard,
  friends: IconFriends,
  shop: IconShop,
  profile: IconProfile,
  admin: IconAdmin,
  logout: IconLogout,
};

export default function NavIcon({
  id,
  size = 22,
  className = "",
}: {
  id: NavIconId;
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
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
      className={className}
    >
      <Inner />
    </svg>
  );
}
