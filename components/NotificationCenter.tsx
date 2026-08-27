"use client";

/**
 * NotificationCenter — shared bell + dropdown for Portal, Lift Off, and SLICE.
 * Extends the existing GoalNotificationBell pattern to cover all three tools.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import type { GoalNotification } from "@/lib/database.types";

type Source = "all" | "portal" | "liftoff" | "slice";

const SOURCE_LABELS: Record<Source, string> = {
  all:     "All",
  portal:  "Portal",
  liftoff: "Lift Off",
  slice:   "SLICE",
};

const TYPE_ICON: Record<string, string> = {
  award:   "🏆",
  success: "✅",
  warning: "⚠️",
  info:    "ℹ️",
};

interface Props {
  initialNotifications?: GoalNotification[];
}

export function NotificationCenter({ initialNotifications = [] }: Props) {
  const [open, setOpen]     = useState(false);
  const [list, setList]     = useState<GoalNotification[]>(initialNotifications);
  const [tab, setTab]       = useState<Source>("all");
  const [loading, setLoading] = useState(initialNotifications.length === 0);

  // Fetch on mount if no initial data provided
  useEffect(() => {
    if (initialNotifications.length > 0) { setLoading(false); return; }
    fetch("/api/goal-engine/notifications")
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then(d => { setList(d.notifications ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = tab === "all"
    ? list
    : list.filter(n => (n as GoalNotification & { source?: string }).source === tab);

  const unread = list.filter(n => !n.read).length;

  async function markAllRead() {
    setList(prev => prev.map(n => ({ ...n, read: true })));
    await fetch("/api/goal-engine/notifications", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ all: true }),
    }).catch(() => {});
  }

  async function markRead(id: string) {
    setList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch("/api/goal-engine/notifications", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    }).catch(() => {});
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        style={{
          position: "relative",
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 10, border: "1px solid #E2E8F0",
          background: "#fff", cursor: "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 16, height: 16, borderRadius: 8,
            background: "#ef4444", color: "#fff",
            fontSize: 9, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px", border: "2px solid #fff",
            fontFamily: "inherit",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div style={{
            position: "absolute", right: 0, top: 44, zIndex: 50,
            width: 340, maxHeight: "80vh",
            background: "#fff", borderRadius: 16,
            border: "1px solid #E2E8F0",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px 12px",
              borderBottom: "1px solid #f0f0f0",
            }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1A2B42" }}>
                Notifications {unread > 0 && (
                  <span style={{
                    marginLeft: 6, background: "#ef4444", color: "#fff",
                    fontSize: 10, fontWeight: 900, padding: "1px 6px", borderRadius: 20,
                  }}>{unread}</span>
                )}
              </p>
              {unread > 0 && (
                <button onClick={markAllRead} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700, color: "#F37021",
                  fontFamily: "inherit",
                }}>
                  Mark all read
                </button>
              )}
            </div>

            {/* Source filter tabs */}
            <div style={{
              display: "flex", gap: 4, padding: "8px 12px",
              borderBottom: "1px solid #f0f0f0", overflowX: "auto",
            }}>
              {(["all", "portal", "liftoff", "slice"] as Source[]).map(s => (
                <button key={s} onClick={() => setTab(s)} style={{
                  padding: "4px 10px", borderRadius: 20, border: "none",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: tab === s ? "#142850" : "#F8FAFC",
                  color: tab === s ? "#fff" : "#64748B",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                  transition: "background .15s",
                }}>
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                <p style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "#94A3B8", margin: 0 }}>
                  Loading…
                </p>
              ) : filtered.length === 0 ? (
                <p style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "#94A3B8", margin: 0 }}>
                  No notifications
                </p>
              ) : (
                filtered.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #F8FAFC",
                      background: n.read ? "#fff" : "rgba(243,112,33,0.04)",
                      cursor: n.link ? "pointer" : "default",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                        {TYPE_ICON[n.type] ?? "ℹ️"}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {n.link ? (
                          <Link href={n.link} onClick={() => setOpen(false)} style={{
                            fontSize: 13, fontWeight: 700, color: "#1A2B42",
                            textDecoration: "none", display: "block", lineHeight: 1.3,
                          }}>
                            {n.title}
                          </Link>
                        ) : (
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A2B42", lineHeight: 1.3 }}>
                            {n.title}
                          </p>
                        )}
                        {n.body && (
                          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>
                            {n.body}
                          </p>
                        )}
                        <p style={{ margin: "4px 0 0", fontSize: 10, color: "#94A3B8" }}>
                          {new Date(n.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                            hour: "numeric", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!n.read && (
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: "#F37021", flexShrink: 0, marginTop: 4,
                        }} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 16px",
              borderTop: "1px solid #f0f0f0",
              background: "#F8FAFC",
            }}>
              <Link href="/goal-engine/dashboard" onClick={() => setOpen(false)} style={{
                fontSize: 12, fontWeight: 700, color: "#F37021",
                textDecoration: "none",
              }}>
                View all in SLICE →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
