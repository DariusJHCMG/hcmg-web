"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import type { AuditLog } from "@/lib/database.types";

export default function AuditPage() {
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const supabase = createBrowserClient();

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const { data } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setLogs((data ?? []) as AuditLog[]);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const ACTION_COLORS: Record<string, string> = {
    "user.login":        "bg-blue-50 text-blue-700",
    "user.created":      "bg-green-50 text-green-700",
    "user.role_changed": "bg-yellow-50 text-yellow-700",
    "user.deactivated":  "bg-red-50 text-red-600",
    "lead.created":      "bg-purple-50 text-purple-700",
    "lead.status_changed":"bg-orange-50 text-orange-700",
  };

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.user_email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Audit Log</h1>
        <p className="mt-1 text-sm text-muted">Every significant action in the portal — last 200 entries.</p>
      </div>

      <input
        type="text"
        placeholder="Search action or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-64 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
      />

      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                <th className="px-5 py-3 text-left">Time</th>
                <th className="px-5 py-3 text-left">User</th>
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-left">Details</th>
                <th className="px-5 py-3 text-left">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-muted/60">Loading…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-muted/60">No audit entries yet.</td></tr>
              )}
              {!loading && filtered.map((log, i) => (
                <tr key={log.id} className={i % 2 === 0 ? "bg-white" : "bg-sand/40"}>
                  <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-muted text-xs">{log.user_email ?? "system"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ACTION_COLORS[log.action] ?? "bg-sand text-muted"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted font-mono">{log.ip_address ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
