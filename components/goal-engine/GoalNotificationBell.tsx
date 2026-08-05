"use client";

import { useState } from "react";
import type { GoalNotification } from "@/lib/database.types";

interface Props {
  notifications: GoalNotification[];
  dark?: boolean;
}

export function GoalNotificationBell({ notifications, dark }: Props) {
  const [open, setOpen]   = useState(false);
  const [list, setList]   = useState(notifications);
  const unread = list.filter((n) => !n.read).length;

  async function markAllRead() {
    setList((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/goal-engine/notifications", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ all: true }),
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
        style={dark ? {
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
        } : undefined}
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl shadow-xl overflow-hidden"
            style={dark ? {
              background: "#0d1526",
              border: "1px solid rgba(255,255,255,0.1)",
            } : { background: "#fff", border: "1px solid #e5e7eb" }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" }}>
              <p className="text-sm font-bold" style={{ color: dark ? "#fff" : undefined }}>Notifications</p>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] font-semibold text-accent hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-line">
              {list.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted/60">No notifications yet</p>
              )}
              {list.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 transition-colors ${n.read ? "" : "bg-accent/5"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">
                      {n.type === "award" ? "🏆" : n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : "ℹ️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink leading-tight">{n.title}</p>
                      {n.body && <p className="text-xs text-muted mt-0.5 leading-snug">{n.body}</p>}
                      <p className="text-[10px] text-muted/60 mt-1">
                        {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
