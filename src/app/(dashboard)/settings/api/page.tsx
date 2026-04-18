"use client";

export default function ApiSettingsPage() {
  return <ComingSoon
    title="API Settings"
    icon={
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    }
    description={[
      "Generate API keys, configure webhooks, set rate limits, and manage access scopes from a single settings panel.",
      "Built for developers: rotate secrets without downtime, audit every key, and plug Crymad Cash into your own systems in minutes.",
    ]}
  />;
}

function ComingSoon({ title, icon, description }: { title: string; icon: React.ReactNode; description: string[] }) {
  return (
    <div style={{ padding: 32, maxWidth: 820, margin: "0 auto", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes cs-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} } @keyframes cs-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} } @keyframes cs-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      <div style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(10px)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        padding: "60px 40px",
        textAlign: "center",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.15), transparent 70%)", animation: "cs-pulse 3s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "inline-flex", padding: 22, borderRadius: 22, background: "rgba(var(--primary-rgb), 0.1)", border: "1px solid rgba(var(--primary-rgb), 0.3)", animation: "cs-spin 18s linear infinite", marginBottom: 24 }}>
          {icon}
        </div>
        <h1 className="gradient-text" style={{
          fontSize: 40, fontWeight: 800, margin: 0,
          background: "linear-gradient(135deg, var(--primary), var(--text))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>{title}</h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", margin: "12px 0 24px" }}>
          This feature is coming soon. Stay tuned for updates.
        </p>
        <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {description.map((line, i) => (
            <p key={i} style={{ color: "var(--text-muted)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{line}</p>
          ))}
        </div>
        <div style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 999, background: "rgba(var(--primary-rgb), 0.08)", border: "1px solid rgba(var(--primary-rgb), 0.2)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", animation: "cs-pulse 1.5s infinite" }} />
          <span style={{ color: "var(--primary)", fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>In Development</span>
        </div>
      </div>
    </div>
  );
}
