export type NavIconId = "home" | "tasks" | "leaderboard" | "friends" | "shop" | "profile" | "admin" | "logout" | "battlepass";

function IconHome() {
  return (
    <>
      <path d="M3.4 11.6 12 3.8l8.6 7.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5.6 10.2V18.6a1.2 1.2 0 0 0 1.2 1.2h2.8v-5.4h4.8v5.4h2.8a1.2 1.2 0 0 0 1.2-1.2V10.2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.18}
      />
      <path d="M9.2 19.8v-5.4h5.6v5.4" strokeLinejoin="round" />
      <circle cx="12" cy="7.4" r="0.9" fill="currentColor" />
    </>
  );
}

function IconTasks() {
  return (
    <>
      <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4" fill="currentColor" fillOpacity={0.12} />
      <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4" />
      <path d="M7.6 12.4 10.4 15.2 16.6 8.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.8 8 20.2 8" opacity={0.35} />
    </>
  );
}

function IconLeaderboard() {
  return (
    <>
      <path d="M6.6 3.6h10.8v5.8c0 3.4-2.4 6-5.4 6s-5.4-2.6-5.4-6z" fill="currentColor" fillOpacity={0.16} strokeLinejoin="round" />
      <path d="M6.6 5.6H3.8c0 2.6 1.1 4.1 2.8 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.4 5.6h2.8c0 2.6-1.1 4.1-2.8 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.4 6.4 12 9l2.6-2.6" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      <line x1="12" y1="15.4" x2="12" y2="18.2" strokeLinecap="round" />
      <path d="M7.8 21 8.8 17.8h6.4l1 3.2z" strokeLinejoin="round" fill="currentColor" fillOpacity={0.16} />
    </>
  );
}

function IconFriends() {
  return (
    <>
      <circle cx="8.6" cy="7.8" r="3" fill="currentColor" fillOpacity={0.18} />
      <path d="M3.4 19.4c0-3.4 2.4-5.6 5.2-5.6s5.2 2.2 5.2 5.6" strokeLinecap="round" />
      <circle cx="16.6" cy="9" r="2.3" fill="currentColor" fillOpacity={0.18} />
      <path d="M14.4 19.4c.2-2.5 1.7-4.3 3.6-4.3 2.2 0 4 2 4 4.8" strokeLinecap="round" />
    </>
  );
}

function IconShop() {
  return (
    <>
      <path
        d="M12 2.6 14.4 9 21 9.8 16.1 14 17.7 20.6 12 17 6.3 20.6 7.9 14 3 9.8 9.6 9z"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.22}
      />
      <path d="M12 5.4 13.2 9" opacity={0.6} strokeLinecap="round" />
      <circle cx="12" cy="12.6" r="1" fill="currentColor" />
    </>
  );
}

function IconProfile() {
  return (
    <>
      <circle cx="12" cy="8" r="3.8" fill="currentColor" fillOpacity={0.18} />
      <path d="M4.4 20.2c0-4 3.4-6.8 7.6-6.8s7.6 2.8 7.6 6.8" strokeLinecap="round" fill="currentColor" fillOpacity={0.1} />
      <path d="M9.4 6.6c.7-.8 1.7-1.2 2.6-1.2" opacity={0.6} strokeLinecap="round" fill="none" />
    </>
  );
}

function IconAdmin() {
  return (
    <>
      <line x1="4.4" y1="20.2" x2="19.6" y2="20.2" strokeLinecap="round" />
      <rect x="5.6" y="12.6" width="3.4" height="7.2" rx="0.6" fill="currentColor" fillOpacity={0.2} />
      <rect x="10.3" y="8.4" width="3.4" height="11.4" rx="0.6" fill="currentColor" fillOpacity={0.32} />
      <rect x="15" y="4.4" width="3.4" height="15.4" rx="0.6" fill="currentColor" fillOpacity={0.44} />
      <path d="M5.6 11.8 10.3 7.6 15 4" opacity={0.5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function IconLogout() {
  return (
    <>
      <path
        d="M9.4 4.2H6.4a1.8 1.8 0 0 0-1.8 1.8v12a1.8 1.8 0 0 0 1.8 1.8h3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.12}
      />
      <path d="M14.6 7.8 18.8 12 14.6 16.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="18.8" y1="12" x2="9.6" y2="12" strokeLinecap="round" />
    </>
  );
}

function IconBattlePass() {
  return (
    <>
      <path d="M12 2.6 14.4 9 21 9.8 16.1 14 17.7 20.6 12 17 6.3 20.6 7.9 14 3 9.8 9.6 9z" strokeLinejoin="round" fill="currentColor" fillOpacity={0.2} />
      <circle cx="12" cy="11.4" r="3.2" fill="currentColor" fillOpacity={0.3} />
      <circle cx="12" cy="11.4" r="3.2" />
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
  battlepass: IconBattlePass,
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
