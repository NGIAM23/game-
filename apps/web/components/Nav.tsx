"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { colors } from "@luavio/shared";

const LINKS = [
  { href: "/dashboard", label: "Profil" },
  { href: "/tasks", label: "Tâches" },
  { href: "/leaderboard", label: "Classement" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <nav className="flex items-center justify-center gap-4 py-4 border-b-2 border-outline mb-4 flex-wrap">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-heading"
          style={{ color: pathname === link.href ? colors.secondary : colors.outline, opacity: pathname === link.href ? 1 : 0.7 }}
        >
          {link.label}
        </Link>
      ))}
      <button onClick={handleLogout} className="text-sm underline opacity-60">
        Se déconnecter
      </button>
    </nav>
  );
}
