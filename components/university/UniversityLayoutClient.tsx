"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { UniversitySidebar, UniversityMobileDrawer } from "@/components/university/UniversitySidebar";
import { IntroVideoModal } from "@/components/university/IntroVideoModal";
import type { UniversityRole } from "@/lib/database.types";

interface Props {
  children: React.ReactNode;
  profileName: string;
  profileAvatar: string | null;
  universityRole: UniversityRole;
}

function derivePageTitle(pathname: string): string {
  if (pathname === "/university") return "Dashboard";
  if (pathname === "/university/search") return "Training Library";
  if (pathname === "/university/certificates") return "Certificates";
  if (pathname.startsWith("/university/course/")) return "Course";
  if (pathname.startsWith("/university/lesson/")) return "Lesson";
  if (pathname.startsWith("/university/assessment/")) return "Assessment";
  if (pathname === "/university/admin") return "Admin Overview";
  if (pathname.startsWith("/university/admin/compliance")) return "Compliance";
  // Studio sub-routes — lesson and assessment editors
  if (/\/university\/admin\/studio\/[^/]+\/lesson\//.test(pathname)) return "Lesson Editor";
  if (/\/university\/admin\/studio\/[^/]+\/assessment\//.test(pathname)) return "Assessment Editor";
  if (pathname.startsWith("/university/admin/studio")) return "Course Studio";
  if (pathname.startsWith("/university/admin/courses/new")) return "New Course";
  if (/\/university\/admin\/courses\/[^/]+/.test(pathname)) return "Edit Course";
  if (pathname.startsWith("/university/admin/courses")) return "Courses";
  if (pathname.startsWith("/university/admin/users")) return "Users";
  if (pathname.startsWith("/university/admin/assignments")) return "Assignments";
  if (pathname.startsWith("/university/admin/reports")) return "Reports";
  if (pathname.startsWith("/university/admin/audit-log")) return "Audit Log";
  if (pathname.startsWith("/university/admin/exemptions")) return "Exemptions";
  if (pathname.startsWith("/university/admin/media")) return "Media Library";
  if (pathname.startsWith("/university/admin/org-units")) return "Org Units";
  if (pathname.startsWith("/university/hr")) return "HR Overview";
  if (pathname.startsWith("/university/manager/employee/")) return "Employee Detail";
  if (pathname.startsWith("/university/manager")) return "My Team";
  if (pathname.startsWith("/university/verify/")) return "Verify Certificate";
  return "HCMG U";
}

export function UniversityLayoutClient({ children, profileName, profileAvatar, universityRole }: Props) {
  const pathname = usePathname();
  const pageTitle = derivePageTitle(pathname);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen]       = useState(false);
  const [notifications, setNotifications] = useState<{
    id: string; title: string; body: string; is_read: boolean; created_at: string;
  }[]>([]);

  // Intro video modal state
  const [introVideoUrl,    setIntroVideoUrl]    = useState<string | null>(null);
  const [introChecked,     setIntroChecked]     = useState(false);

  const initials = profileName
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch("/api/university/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications.slice(0, 12));
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch {
      // Silently ignore network errors
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 90 seconds for new notifications
    const id = setInterval(fetchNotifications, 90_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Check intro video on first mount
  useEffect(() => {
    fetch("/api/university/intro-video")
      .then(r => r.json())
      .then(data => {
        if (!data.has_completed && data.video_url) {
          setIntroVideoUrl(data.video_url);
        }
        setIntroChecked(true);
      })
      .catch(() => setIntroChecked(true)); // On error, don't block the user
  }, []);

  async function markAllRead() {
    await fetch("/api/university/notifications", { method: "PATCH" });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function markOneRead(notifId: string) {
    await fetch(`/api/university/notifications/${notifId}`, { method: "PATCH" });
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
      {/* Intro video modal — shown until user completes it */}
      {introChecked && introVideoUrl && (
        <IntroVideoModal
          videoUrl={introVideoUrl}
          onDismiss={() => setIntroVideoUrl(null)}
        />
      )}

      {/* Desktop sidebar */}
      <UniversitySidebar universityRole={universityRole} />

      {/* Mobile drawer */}
      {mobileOpen && (
        <UniversityMobileDrawer
          universityRole={universityRole}
          onClose={() => setMobileOpen(false)}
        />
      )}

      {/* Notification bell overlay */}
      {bellOpen && (
        <>
          <div
            onClick={() => setBellOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 30 }}
          />
          <div style={{
            position: "fixed", top: 60, right: 16, zIndex: 40,
            width: 340, maxHeight: 480, overflowY: "auto",
            background: "#fff", border: "1px solid #dfe4e8", borderRadius: 12,
            boxShadow: "0 8px 32px rgba(7,26,46,0.12)",
          }}>
            {/* Popover header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderBottom: "1px solid #dfe4e8",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#071a2e" }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    marginLeft: 8, fontSize: 10, fontWeight: 800,
                    padding: "1px 7px", borderRadius: 8,
                    background: "#f58220", color: "#fff",
                  }}>
                    {unreadCount}
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ fontSize: 11, color: "#f58220", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification items */}
            {notifications.length === 0 ? (
              <div style={{ padding: "28px 16px", textAlign: "center", color: "#687383", fontSize: 13 }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markOneRead(n.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f2f5",
                    background: n.is_read ? "#fff" : "rgba(245,130,32,0.05)",
                    cursor: n.is_read ? "default" : "pointer",
                  }}
                >
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                  }}>
                    {!n.is_read && (
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#f58220", flexShrink: 0, marginTop: 5,
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: n.is_read ? 400 : 700, color: "#071a2e" }}>
                        {n.title}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "#687383", lineHeight: 1.4 }}>
                        {n.body.length > 100 ? n.body.slice(0, 100) + "…" : n.body}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 10, color: "#aab4be" }}>
                        {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Main content column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Hide hamburger on desktop */}
        <style>{`@media (min-width: 1024px) { .uni-hamburger { display: none !important; } }`}</style>
        {/* Top bar */}
        <header style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #dfe4e8",
          background: "#fff",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          {/* Mobile hamburger — hidden on desktop (sidebar visible) */}
          <button
            className="uni-hamburger"
            onClick={() => setMobileOpen(true)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 10,
              border: "1px solid #dfe4e8", background: "#fff", cursor: "pointer",
            }}
            aria-label="Open navigation"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="#071a2e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Page title */}
          <span style={{ fontSize: 14, fontWeight: 700, color: "#071a2e", marginLeft: 12 }}>
            {pageTitle}
          </span>

          <div style={{ flex: 1 }} />

          {/* Right: notification bell + user chip */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Bell */}
            <button
              onClick={() => setBellOpen(prev => !prev)}
              aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
              style={{
                position: "relative",
                width: 36, height: 36, borderRadius: 10,
                border: "1px solid #dfe4e8", background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#071a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 4,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#f58220", border: "2px solid #fff",
                }} />
              )}
            </button>

            {/* User chip */}
            <span style={{ fontSize: 12, color: "#687383" }}>
              {profileName}
            </span>
            {profileAvatar ? (
              <img src={profileAvatar} alt={profileName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg,#FF9847,#F37021)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff",
              }}>
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
