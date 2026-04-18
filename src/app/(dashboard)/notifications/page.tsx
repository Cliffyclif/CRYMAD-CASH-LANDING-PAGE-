"use client";

import { useEffect, useMemo, useState } from "react";

interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

type Filter = "all" | "read" | "unread";

const glass: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
};

const KIND_COLOR: Record<string, string> = {
  payout: "var(--success)",
  crypto: "var(--success)",
  card: "#3b82f6",
  kyc: "var(--warning)",
  security: "var(--danger)",
  system: "var(--text-muted)",
};

function colorForKind(k: string): string {
  return KIND_COLOR[k] || "var(--text-muted)";
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function iconForKind(kind: string): React.ReactNode {
  const color = colorForKind(kind);
  const common = { width: 18, height: 18, fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "payout" || kind === "crypto") {
    return <svg {...common} viewBox="0 0 24 24"><polyline points="12 5 5 12 12 19" /><line x1="19" y1="12" x2="5" y2="12" /></svg>;
  }
  if (kind === "card") {
    return <svg {...common} viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
  }
  if (kind === "kyc") {
    return <svg {...common} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  }
  if (kind === "security") {
    return <svg {...common} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  }
  return <svg {...common} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}

export default function NotificationsPage() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=30");
      const j = await res.json();
      setRows(Array.isArray(j.notifications) ? j.notifications : []);
      setUnreadCount(Number(j.unreadCount || 0));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "read") return rows.filter((r) => r.readAt);
    if (filter === "unread") return rows.filter((r) => !r.readAt);
    return rows;
  }, [rows, filter]);

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, readAt: new Date().toISOString() } : r)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      const now = new Date().toISOString();
      setRows((prev) => prev.map((r) => (r.readAt ? r : { ...r, readAt: now })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }

  function onClickCard(n: Notification) {
    setExpanded(expanded === n.id ? null : n.id);
    if (!n.readAt) markRead(n.id);
  }

  return (
    <div style={{ padding: 24, maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(var(--primary-rgb), 0.15)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, background: "var(--danger)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--text)" }}>Notifications</h1>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: 13 }}>
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} style={selectStyle}>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button onClick={markAllRead} disabled={unreadCount === 0} style={{ ...ghostBtn, opacity: unreadCount === 0 ? 0.5 : 1 }}>
            Mark all as read
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ ...glass, padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...glass, padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 54, marginBottom: 14 }}>🔔</div>
          <h3 style={{ margin: 0, fontSize: 18, color: "var(--text)" }}>
            {rows.length === 0 ? "No notifications yet" : "Nothing to show"}
          </h3>
          <p style={{ color: "var(--text-muted)", margin: "8px 0 0", fontSize: 13 }}>
            {rows.length === 0 ? "You'll see updates here." : "Try changing the filter."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((n) => {
            const unread = !n.readAt;
            const color = colorForKind(n.kind);
            const isExpanded = expanded === n.id;
            return (
              <div
                key={n.id}
                onClick={() => onClickCard(n)}
                style={{
                  ...glass,
                  padding: "14px 16px 14px 18px",
                  borderLeft: `4px solid ${color}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  opacity: unread ? 1 : 0.8,
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `color-mix(in srgb, ${color} 15%, transparent)`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {iconForKind(n.kind)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 14 }}>{n.title}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, whiteSpace: "nowrap" }}>{relativeTime(n.createdAt)}</div>
                  </div>
                  <div style={{
                    color: "var(--text-secondary)", fontSize: 13,
                    marginTop: 4,
                    display: isExpanded ? "block" : "-webkit-box",
                    WebkitLineClamp: isExpanded ? undefined : 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }}>
                    {n.body}
                  </div>
                  {isExpanded && n.link && (
                    <a href={n.link} onClick={(e) => e.stopPropagation()} style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                      View details →
                    </a>
                  )}
                </div>
                {unread && (
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: 14 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const ghostBtn: React.CSSProperties = { background: "transparent", color: "var(--text)", border: "1px solid var(--glass-border)", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" };
const selectStyle: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--glass-border)", borderRadius: 10, padding: "9px 14px", color: "var(--text)", fontSize: 12, outline: "none", fontWeight: 600, cursor: "pointer" };
