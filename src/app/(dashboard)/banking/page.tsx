"use client";

export default function BankingPage() {
  return <ComingSoon title="Banking" icon={<LandmarkIcon />} description={[
    "A full suite of banking tools for your business: accounts payable, receivable, treasury, and cash-flow insights.",
    "Connect external accounts, automate reconciliation, and manage liquidity across currencies — all from one dashboard.",
  ]} />;
}

function LandmarkIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7 12 2" />
    </svg>
  );
}

function ComingSoon({ title, icon, description }: { title: string; icon: React.ReactNode; description: string[] }) {
  return (
    <div style={{ padding: 32, maxWidth: 820, margin: "0 auto", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes cs-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} } @keyframes cs-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
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
        <div style={{ position: "relative", display: "inline-flex", padding: 22, borderRadius: 22, background: "rgba(var(--primary-rgb), 0.1)", border: "1px solid rgba(var(--primary-rgb), 0.3)", animation: "cs-float 3s ease-in-out infinite", marginBottom: 24 }}>
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
