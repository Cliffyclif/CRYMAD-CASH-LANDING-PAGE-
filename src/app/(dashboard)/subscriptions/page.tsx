"use client";

import { useState } from "react";

const glass = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
} as const;

const mono = { fontFamily: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace" } as const;
const overlay = {
  position: "fixed" as const, inset: 0, zIndex: 200,
  background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
  display: "flex", alignItems: "center" as const, justifyContent: "center" as const,
};

type TabKey = "PENDING" | "ACTIVE" | "COMPLETED";

export default function SubscriptionsPage() {
  const [tab, setTab] = useState<TabKey>("ACTIVE");
  const [lookupId, setLookupId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<Record<string, unknown> | null>(null);

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const runLookup = async () => {
    const id = lookupId.trim();
    if (!id) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    setCancelMessage(null);
    try {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(id)}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.details?.message || data?.error || `Request failed (${res.status})`);
      setLookupResult(data.subscription as Record<string, unknown>);
    } catch (e) {
      setLookupError((e as Error).message);
    } finally {
      setLookupLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!lookupResult) return;
    const id = String((lookupResult as { id?: string }).id || lookupId.trim());
    if (!id) return;
    if (!confirm("Cancel this subscription? This cannot be undone.")) return;
    setCancelLoading(true);
    setCancelMessage(null);
    try {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(id)}/cancel`, {
        method: "PUT", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.details?.message || data?.error || `Request failed (${res.status})`);
      setCancelMessage("Subscription cancelled successfully.");
      // Refetch
      await runLookup();
    } catch (e) {
      setCancelMessage(`Failed to cancel: ${(e as Error).message}`);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(var(--primary-rgb),0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9" />
            <polyline points="3 4 3 12 11 12" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0 }}>Subscriptions</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Recurring payments & product subscriptions</p>
        </div>
      </div>

      {/* Coming soon banner */}
      <div style={{
        ...glass,
        padding: 16,
        marginBottom: 20,
        background: "rgba(var(--primary-rgb),0.06)",
        borderColor: "rgba(var(--primary-rgb),0.25)",
        display: "flex", gap: 12, alignItems: "center",
      }}>
        <div style={{ fontSize: 22 }}>🧪</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Coming Soon — Subscription Management</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            A full list view is on the way. For now, look up a subscription by ID to view and manage it.
          </div>
        </div>
      </div>

      {/* Lookup */}
      <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Subscription Lookup</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runLookup()}
            placeholder="Enter subscription ID…"
            style={{ ...glass, ...mono, padding: "10px 16px", fontSize: 13, color: "var(--text)", flex: 1, minWidth: 240, outline: "none" }}
          />
          <button
            onClick={runLookup}
            disabled={!lookupId.trim() || lookupLoading}
            style={{
              background: "var(--primary)", color: "var(--bg)", border: "none",
              borderRadius: 12, padding: "10px 20px", fontSize: 12, fontWeight: 700,
              cursor: lookupLoading ? "wait" : "pointer", opacity: !lookupId.trim() ? 0.6 : 1,
            }}
          >
            {lookupLoading ? "Looking up…" : "Look Up"}
          </button>
        </div>
        {lookupError && <div style={{ marginTop: 12, fontSize: 12, color: "var(--danger)" }}>{lookupError}</div>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["PENDING", "ACTIVE", "COMPLETED"] as TabKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...glass,
              padding: "10px 24px", fontSize: 12, fontWeight: 700, letterSpacing: 1,
              cursor: "pointer",
              color: tab === t ? "var(--bg)" : "var(--text-secondary)",
              background: tab === t ? "var(--primary)" : "var(--glass-bg)",
              border: tab === t ? "none" : "1px solid var(--glass-border)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Empty state per tab */}
      <div style={{ ...glass, padding: 60, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔔</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          Subscription listing is coming soon
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto" }}>
          Your {tab.toLowerCase()} subscriptions will be shown here. In the meantime, use the lookup above to fetch any subscription by its ID.
        </div>
      </div>

      {lookupResult && (
        <SubscriptionModal
          subscription={lookupResult}
          onClose={() => { setLookupResult(null); setCancelMessage(null); }}
          onCancel={cancelSubscription}
          cancelLoading={cancelLoading}
          cancelMessage={cancelMessage}
        />
      )}
    </>
  );
}

function SubscriptionModal({
  subscription, onClose, onCancel, cancelLoading, cancelMessage,
}: {
  subscription: Record<string, unknown>;
  onClose: () => void;
  onCancel: () => void;
  cancelLoading: boolean;
  cancelMessage: string | null;
}) {
  const entries = Object.entries(subscription).filter(([, v]) => typeof v !== "object" || v === null);
  const objectEntries = Object.entries(subscription).filter(([, v]) => typeof v === "object" && v !== null);
  const status = String((subscription as { status?: string }).status || "").toLowerCase();
  const canCancel = !/cancel|expired|completed/.test(status);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...glass, maxWidth: 640, width: "92%", padding: 32, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Subscription Details</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          {entries.map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{k}</div>
              <div style={{ ...mono, fontWeight: 600, color: "var(--text)", fontSize: 13, wordBreak: "break-all" }}>
                {v === null || v === undefined ? "—" : String(v)}
              </div>
            </div>
          ))}
        </div>

        {objectEntries.map(([k, v]) => (
          <div key={k} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{k}</div>
            <pre style={{ ...mono, ...glass, padding: 12, fontSize: 11, color: "var(--text-secondary)", margin: 0, overflowX: "auto" }}>
              {JSON.stringify(v, null, 2)}
            </pre>
          </div>
        ))}

        {cancelMessage && (
          <div style={{ marginBottom: 14, fontSize: 12, color: cancelMessage.startsWith("Failed") ? "var(--danger)" : "var(--success)" }}>
            {cancelMessage}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ ...glass, padding: "10px 20px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)" }}>
            Close
          </button>
          {canCancel && (
            <button
              onClick={onCancel}
              disabled={cancelLoading}
              style={{
                background: "var(--danger)", color: "#fff", border: "none",
                borderRadius: 12, padding: "10px 20px", fontSize: 12, fontWeight: 700,
                cursor: cancelLoading ? "wait" : "pointer",
              }}
            >
              {cancelLoading ? "Cancelling…" : "Cancel Subscription"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
