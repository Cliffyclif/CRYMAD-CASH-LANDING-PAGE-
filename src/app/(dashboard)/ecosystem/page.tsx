"use client";

const glass: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)",
  borderRadius: 16,
};

const ICONS: React.ReactNode[] = [
  <svg key={1} width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 9h6v6H9z" /></svg>,
  <svg key={2} width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>,
  <svg key={3} width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /><line x1="12" y1="22" x2="12" y2="15.5" /><polyline points="22 8.5 12 15.5 2 8.5" /></svg>,
  <svg key={4} width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21L12 3l9 18H3z" /><path d="M8 21l4-8 4 8" /></svg>,
  <svg key={5} width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="9" /></svg>,
  <svg key={6} width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z" /><path d="M9 12l2 2 4-4" /></svg>,
];

export default function EcosystemPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 32, fontWeight: 800, margin: 0,
          background: "linear-gradient(135deg, var(--primary), var(--text))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }} className="gradient-text">
          Financial Ecosystem
        </h1>
        <p style={{ color: "var(--text-muted)", margin: "8px 0 0", fontSize: 14, maxWidth: 640 }}>
          This is where you&apos;ll see all our partner companies across the financial ecosystem. Partner details coming soon.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            ...glass,
            padding: 24,
            aspectRatio: "1 / 1",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(circle at ${20 + i * 13}% ${80 - i * 10}%, rgba(var(--primary-rgb), 0.08), transparent 60%)`,
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: "rgba(var(--primary-rgb), 0.1)",
                border: "1px solid rgba(var(--primary-rgb), 0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                {ICONS[i]}
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Partner {i + 1}</h3>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                A financial service partner integrating with Crymad Cash.
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: "var(--warning)",
                background: "color-mix(in srgb, var(--warning) 15%, transparent)",
                textTransform: "uppercase",
              }}>
                Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...glass, padding: 20, textAlign: "center" }}>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
          If you operate a financial service and want to be listed,{" "}
          <a href="mailto:partnerships@crymadcash.com" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>contact us</a>.
        </p>
      </div>
    </div>
  );
}
