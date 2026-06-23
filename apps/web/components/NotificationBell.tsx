"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      const { data } = await supabase
        .from("notifications")
        .select("id, type, message, link, read, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications(data ?? []);
    }
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="relative w-10 h-10 flex items-center justify-center rounded-full border-2 border-outline bg-background"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-heading rounded-full w-5 h-5 flex items-center justify-center border-2 border-outline">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-surface border-2 border-outline rounded-sticker shadow-[0_4px_0_0_#1A1A2E] p-2 z-20 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-xs opacity-50 py-4 font-body">Aucune notification.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {notifications.map((n) => {
                const content = (
                  <div
                    className="font-body text-xs border-2 border-outline rounded-lg px-2.5 py-2"
                    style={{ backgroundColor: n.read ? "#FFFFFF" : "#FFF4CC" }}
                  >
                    {n.message}
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })}
            </div>
          )}
          <Link
            href="/friends"
            onClick={() => setOpen(false)}
            className="block text-center font-heading text-xs mt-2 text-secondary underline"
          >
            Voir mes amis
          </Link>
        </div>
      )}
    </div>
  );
}
