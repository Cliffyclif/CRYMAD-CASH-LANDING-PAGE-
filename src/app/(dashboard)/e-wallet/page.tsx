"use client";

import { useEffect, useState } from "react";
import { formatMoney, useUser } from "@/components/providers/UserProvider";
import { tokenIcon } from "@/lib/tokens/icons";

type Tx = {
  id: string;
  status: string;
  type?: string;
  side?: "credit" | "debit";
  amount: number;
  fee?: number;
  currency?: string;
  walletType?: string;
  reference?: string;
  email?: string;
  createdDate: string;
  completedDate?: string;
};

// ───────────────────────── Modals ─────────────────────────

function SubmitError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div style={{
      color: "var(--danger)", fontSize: 13, marginTop: 10, padding: "10px 14px", borderRadius: 10,
      background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
    }}>{msg}</div>
  );
}

function TransferModal({ onClose, onDone, availableBalance, currency }: {
  onClose: () => void; onDone: () => void;
  availableBalance: number; currency: string;
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const amountNum = Number(amount) || 0;
  const fee = amountNum > 0 ? +(amountNum * 0.005).toFixed(2) : 0;
  const recipientGets = Math.max(0, amountNum - fee);
  const canSend = !!recipient && amountNum > 0 && amountNum <= availableBalance;

  async function submit() {
    setErr(null);
    if (!recipient || !amountNum || amountNum <= 0) { setErr("Enter recipient and a valid amount."); return; }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { amount: amountNum, description };
      if (recipient.includes("@")) body.recipientEmail = recipient;
      else body.recipientUserId = recipient.replace(/^@/, "");
      const res = await fetch("/api/ewallet/transfer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) { setErr(j.error === "recipient_not_found" ? "Recipient not found." : "Transfer failed."); return; }
      setDone(true);
      setTimeout(() => { onDone(); onClose(); }, 1200);
    } catch { setErr("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <div
      onClick={onClose}
      className="fancy-modal-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fancy-modal-surface"
        style={{
          width: "100%", maxWidth: 460,
          border: "1px solid rgba(var(--primary-rgb), 0.3)",
          borderRadius: 24, padding: "26px 28px 18px",
          boxShadow: "0 0 60px rgba(var(--primary-rgb), 0.15), inset 0 0 40px rgba(var(--primary-rgb), 0.03)",
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1, textAlign: "center", paddingRight: 24 }}>
            <div style={{
              fontSize: 22, fontWeight: 800, color: "var(--primary)",
              letterSpacing: 0.5,
              textShadow: "0 0 24px rgba(var(--primary-rgb), 0.4)",
            }}>Send Money</div>
            <div style={{
              marginTop: 4, fontSize: 10, fontWeight: 600, letterSpacing: 2,
              color: "var(--text-muted)", textTransform: "uppercase",
            }}>Peer-to-peer transfer</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            background: "transparent", border: "none", color: "var(--text-muted)",
            fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1,
          }}>×</button>
        </div>

        {done ? (
          <div style={{ padding: "40px 0 20px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(16,185,129,0.12)", border: "2px solid var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 600 }}>Transfer submitted.</div>
          </div>
        ) : (
          <>
            {/* Recipient */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px", borderRadius: 14,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              marginTop: 20,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="@username or email"
                autoFocus
                style={{
                  flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
                  color: "var(--text)", fontSize: 14, fontFamily: "var(--font-mono)",
                }}
              />
            </div>

            {/* Amount */}
            <div style={{ textAlign: "center", margin: "28px 0 16px" }}>
              <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                <span style={{
                  fontSize: 44, fontWeight: 800, fontFamily: "var(--font-mono)",
                  color: "var(--text)", lineHeight: 1,
                }}>$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "var(--text)", fontSize: 44, fontWeight: 800,
                    fontFamily: "var(--font-mono)", textAlign: "left",
                    width: amount.length ? `${Math.max(3, amount.length) * 28}px` : "150px",
                    padding: 0,
                  }}
                />
                <span style={{
                  fontSize: 14, fontWeight: 700, color: "var(--primary)", letterSpacing: 1,
                }}>{currency || "USD"}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 20,
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "var(--primary)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                }}>
                  Available: ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 18 }}>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note (optional)"
                style={{
                  width: "100%", padding: "12px 4px", background: "transparent",
                  border: "none", borderBottom: "1px solid var(--glass-border)",
                  outline: "none", color: "var(--text)", fontSize: 13,
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Breakdown */}
            <div style={{
              padding: "14px 18px", borderRadius: 14,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              marginBottom: 18,
              fontSize: 12,
            }}>
              {[
                { label: "Fee", value: `$${fee.toFixed(2)}`, muted: true },
                { label: "You Send", value: `$${amountNum.toFixed(2)}`, muted: true },
                { label: "Recipient Gets", value: `$${recipientGets.toFixed(2)}`, primary: true },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0",
                  borderTop: i === 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  marginTop: i === 2 ? 6 : 0, paddingTop: i === 2 ? 12 : 8,
                }}>
                  <span style={{
                    color: row.primary ? "var(--text)" : "var(--text-muted)",
                    fontWeight: row.primary ? 700 : 500,
                    letterSpacing: 1, textTransform: "uppercase", fontSize: 11,
                  }}>{row.label}</span>
                  <span style={{
                    color: row.primary ? "var(--primary)" : "var(--text)",
                    fontFamily: "var(--font-mono)", fontWeight: 700,
                  }}>{row.value}</span>
                </div>
              ))}
            </div>

            {err && (
              <div style={{
                color: "#ef4444", fontSize: 12, textAlign: "center",
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
                marginBottom: 12,
              }}>{err}</div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: 14, borderRadius: 28,
                background: "transparent", border: "1px solid var(--glass-border)",
                color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
              }}>Cancel</button>
              <button
                disabled={!canSend || loading}
                onClick={submit}
                style={{
                  flex: 1.5, padding: 14, borderRadius: 28,
                  background: canSend && !loading ? "var(--primary)" : "var(--surface)",
                  color: canSend && !loading ? "var(--bg)" : "var(--text-muted)",
                  fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
                  border: "none", cursor: canSend && !loading ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: canSend && !loading ? "0 0 24px rgba(var(--primary-rgb), 0.3)" : "none",
                }}
              >
                {loading ? "Sending…" : "Send"}
                {!loading && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>

            {/* Status line */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: 18, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)",
              fontSize: 9, color: "var(--text-muted)", letterSpacing: 1.5,
              textTransform: "uppercase", fontFamily: "var(--font-mono)",
            }}>
              <span>
                <span style={{
                  display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                  background: "var(--primary)", marginRight: 6, verticalAlign: "middle",
                  boxShadow: "0 0 6px var(--primary)",
                }} />
                System: Operational · Sync: 100%
              </span>
              <span>Latency: 14ms</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Shared fancy modal shell + helpers ─── */
function FancyModalShell({ title, subtitle, onClose, children, maxWidth = 440 }: {
  title: string; subtitle: string; onClose: () => void; children: React.ReactNode; maxWidth?: number;
}) {
  return (
    <div
      onClick={onClose}
      className="fancy-modal-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fancy-modal-surface"
        style={{
          width: "100%", maxWidth,
          border: "1px solid rgba(var(--primary-rgb), 0.3)",
          borderRadius: 24, padding: "26px 28px 20px",
          boxShadow: "0 0 60px rgba(var(--primary-rgb), 0.15)",
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: 0.3,
              textShadow: "0 0 24px rgba(var(--primary-rgb), 0.4)",
            }}>{title}</div>
            <div style={{
              marginTop: 4, fontSize: 10, fontWeight: 600, letterSpacing: 2,
              color: "var(--text-muted)", textTransform: "uppercase",
            }}>{subtitle}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            background: "transparent", border: "none", color: "var(--text-muted)",
            fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const fancyLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
  color: "var(--text-muted)", marginBottom: 8, display: "block",
};

function FancyCancelConfirm({ onCancel, onConfirm, confirmLabel, loading, disabled }: {
  onCancel: () => void; onConfirm: () => void; confirmLabel: string; loading?: boolean; disabled?: boolean;
}) {
  const can = !disabled && !loading;
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button onClick={onCancel} type="button" style={{
        flex: 1, padding: 14, borderRadius: 28,
        background: "transparent", border: "1px solid var(--glass-border)",
        color: "var(--text)", fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
        textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
      }}>Cancel</button>
      <button onClick={onConfirm} type="button" disabled={!can}
        style={{
          flex: 1.5, padding: 14, borderRadius: 28,
          background: can ? "var(--primary)" : "var(--surface)",
          color: can ? "var(--bg)" : "var(--text-muted)",
          fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
          border: "none", cursor: can ? "pointer" : "not-allowed", fontFamily: "inherit",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: can ? "0 0 24px rgba(var(--primary-rgb), 0.3)" : "none",
        }}>
        {loading ? "Processing…" : confirmLabel}
        {!loading && can && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>
    </div>
  );
}

function DoneState({ label }: { label: string }) {
  return (
    <div style={{ padding: "40px 0 20px", textAlign: "center" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "rgba(16,185,129,0.12)", border: "2px solid var(--primary)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function BankWithdrawModal({ onClose, onDone, availableBalance, currency }: {
  onClose: () => void; onDone: () => void; availableBalance: number; currency: string;
}) {
  const [beneficiaries, setBeneficiaries] = useState<Array<{ id: string; fullName: string; bankName: string; accountNumberMasked: string; currency: string }>>([]);
  const [selected, setSelected] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/beneficiaries").then((r) => r.json()).then((j) => {
      const list = j.beneficiaries ?? [];
      setBeneficiaries(list);
      if (list[0]) setSelected(list[0].id);
    });
  }, []);

  const amountNum = Number(amount) || 0;
  const fee = 2.00;
  const receive = Math.max(0, amountNum - fee);
  const canSubmit = !!selected && amountNum > 0 && amountNum <= availableBalance;
  const active = beneficiaries.find((b) => b.id === selected);

  async function submit() {
    setErr(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ewallet/debit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, description: `ACH to ${active?.bankName ?? "bank"}` }),
      });
      if (!res.ok) { setErr("Withdrawal failed."); return; }
      setDone(true);
      setTimeout(() => { onDone(); onClose(); }, 1200);
    } catch { setErr("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <FancyModalShell title="Withdraw to Bank" subtitle="ACH transfer to linked account" onClose={onClose}>
      {done ? <DoneState label="Withdrawal submitted" /> : (
        <>
          <label style={fancyLabel}>Select Destination</label>
          {beneficiaries.length === 0 ? (
            <div style={{
              padding: "16px 18px", borderRadius: 14,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              fontSize: 13, color: "var(--text-muted)",
            }}>
              No bank accounts linked. <a href="/e-wallet/beneficiaries" style={{ color: "var(--primary)" }}>Add one →</a>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <button type="button" onClick={() => setPickerOpen((o) => !o)} style={{
                width: "100%", padding: "14px 18px", borderRadius: 14,
                background: "var(--surface)", border: "1px solid var(--glass-border)",
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(var(--primary-rgb), 0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11" />
                  </svg>
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: "var(--text)", fontSize: 14, fontWeight: 700 }}>
                    {active ? `${active.bankName} •••• ${active.accountNumberMasked.slice(-4)}` : "Choose account"}
                  </div>
                  {active && <div style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>Primary Checking</div>}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {pickerOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 10,
                  background: "var(--bg)", border: "1px solid var(--glass-border)",
                  borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                }}>
                  {beneficiaries.map((b) => (
                    <button key={b.id} type="button" onClick={() => { setSelected(b.id); setPickerOpen(false); }}
                      style={{
                        width: "100%", padding: "10px 16px", display: "block", textAlign: "left",
                        background: b.id === selected ? "rgba(var(--primary-rgb), 0.08)" : "transparent",
                        border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                        color: "var(--text)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      }}>
                      {b.bankName} •••• {b.accountNumberMasked.slice(-4)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <label style={fancyLabel}>Amount to Transfer</label>
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text)", lineHeight: 1 }}>$</span>
                <input
                  type="number" inputMode="decimal" value={amount}
                  onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "var(--text)", fontSize: 40, fontWeight: 800,
                    fontFamily: "var(--font-mono)", width: amount.length ? `${Math.max(3, amount.length) * 26}px` : "120px",
                    padding: 0,
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{currency}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{
                  display: "inline-flex", padding: "4px 12px", borderRadius: 20,
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "var(--primary)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                }}>Available: ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "18px 0 16px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 20,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              color: "var(--text-muted)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Arrives: 1-2 Business Days
            </span>
          </div>

          <div style={{
            padding: "14px 18px", borderRadius: 14,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
            marginBottom: 14,
          }}>
            {[
              { label: "Fee", value: `$${fee.toFixed(2)} flat`, muted: true },
              { label: "You withdraw", value: `$${amountNum.toFixed(2)}`, muted: true },
              { label: "You receive", value: `$${receive.toFixed(2)}`, primary: true },
            ].map((row, i) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "7px 0",
                borderTop: i === 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                marginTop: i === 2 ? 4 : 0, paddingTop: i === 2 ? 12 : 7,
              }}>
                <span style={{
                  color: row.primary ? "var(--text)" : "var(--text-muted)",
                  fontWeight: row.primary ? 700 : 500,
                  fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
                }}>{row.label}</span>
                <span style={{
                  color: row.primary ? "var(--primary)" : "var(--text)",
                  fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "12px 14px", borderRadius: 12,
            background: "rgba(234, 179, 8, 0.06)", border: "1px solid rgba(234, 179, 8, 0.25)",
            marginBottom: 16,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div style={{ fontSize: 11, color: "#eab308", lineHeight: 1.5 }}>
              Withdrawals are final once processed. Ensure the destination account is correct before confirming.
            </div>
          </div>

          {err && (
            <div style={{
              color: "#ef4444", fontSize: 12, textAlign: "center",
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
              marginBottom: 12,
            }}>{err}</div>
          )}

          <FancyCancelConfirm onCancel={onClose} onConfirm={submit} confirmLabel="Withdraw" loading={loading} disabled={!canSubmit} />
        </>
      )}
    </FancyModalShell>
  );
}

function BuyCryptoModal({ onClose, availableBalance, currency }: {
  onClose: () => void; availableBalance: number; currency: string;
}) {
  const [fiatAmount, setFiatAmount] = useState("");
  const [toToken, setToToken] = useState("BTC");
  const [prices, setPrices] = useState<Record<string, { price: number }>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/market/prices").then((r) => r.json()).then((j) => setPrices(j?.prices || {}));
  }, []);

  const fiatNum = Number(fiatAmount) || 0;
  const price = prices[toToken]?.price ?? 0;
  const fee = fiatNum > 0 ? +(fiatNum * 0.01).toFixed(2) : 0;
  const spentOnCrypto = Math.max(0, fiatNum - fee);
  const cryptoAmount = price > 0 ? spentOnCrypto / price : 0;
  const canBuy = fiatNum > 0 && fiatNum <= availableBalance && !!price;

  async function submit() {
    setErr(null);
    if (!canBuy) return;
    setLoading(true);
    try {
      const r = await fetch("/api/crypto/buy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: fiatNum, toToken, sourceCurrency: currency }),
      });
      if (!r.ok) { setErr("Purchase failed. (This endpoint may not be enabled in sandbox.)"); return; }
      setDone(true);
      setTimeout(() => onClose(), 1200);
    } catch { setErr("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <FancyModalShell title="Buy Crypto" subtitle="Fiat to crypto exchange" onClose={onClose}>
      {done ? <DoneState label="Purchase submitted" /> : (
        <>
          {/* YOU PAY */}
          <div style={{
            padding: "16px 18px", borderRadius: 16,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
            marginBottom: 6,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ ...fancyLabel, marginBottom: 0 }}>You Pay</span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "3px 10px", borderRadius: 12,
                background: "var(--bg)", border: "1px solid var(--glass-border)",
                color: "var(--text)", fontSize: 11, fontWeight: 700,
              }}>
                🇺🇸 {currency}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text)" }}>$</span>
              <input
                type="number" inputMode="decimal" value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
                  color: "var(--text)", fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)",
                }}
              />
            </div>
            {fiatNum > availableBalance && (
              <div style={{
                display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: 12,
                background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#ef4444", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              }}>Insufficient balance · Available ${availableBalance.toFixed(2)}</div>
            )}
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", justifyContent: "center", margin: "-4px 0 -4px" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(var(--primary-rgb), 0.15)", border: "2px solid var(--bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--primary)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
              </svg>
            </div>
          </div>

          {/* YOU RECEIVE */}
          <div style={{
            padding: "16px 18px", borderRadius: 16,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
            marginBottom: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ ...fancyLabel, marginBottom: 0 }}>You Receive</span>
              <div style={{ position: "relative" }}>
                <button type="button" onClick={() => setPickerOpen((o) => !o)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "3px 10px", borderRadius: 12,
                  background: "var(--bg)", border: "1px solid var(--glass-border)",
                  color: "var(--text)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}>
                  <img src={tokenIcon(toToken)} alt={toToken} width={16} height={16} style={{ borderRadius: "50%" }} />
                  {toToken}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {pickerOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 10,
                    background: "var(--bg)", border: "1px solid var(--glass-border)",
                    borderRadius: 12, overflow: "hidden", minWidth: 140,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                  }}>
                    {["BTC", "ETH", "SOL", "BNB", "XRP", "USDT", "USDC"].map((t) => (
                      <button key={t} type="button" onClick={() => { setToToken(t); setPickerOpen(false); }}
                        style={{
                          width: "100%", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8,
                          background: t === toToken ? "rgba(var(--primary-rgb), 0.1)" : "transparent",
                          border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                          color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        }}>
                        <img src={tokenIcon(t)} alt={t} width={16} height={16} style={{ borderRadius: "50%" }} />
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ color: "var(--primary)", fontSize: 28, fontWeight: 800, fontFamily: "var(--font-mono)" }}>
              {cryptoAmount.toFixed(5)} {toToken}
            </div>
          </div>

          {/* Rate line */}
          <div style={{ textAlign: "center", marginBottom: 10, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            1 {toToken} = ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span style={{ color: "var(--primary)", marginLeft: 6 }}>●</span>
          </div>

          {/* E-Wallet Balance pill */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 20,
              background: "var(--surface)", border: "1px solid rgba(var(--primary-rgb), 0.3)",
              color: "var(--text-muted)", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M22 10H2" />
              </svg>
              E-Wallet Balance
              <span style={{ color: "var(--primary)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </span>
          </div>

          <div style={{
            padding: "12px 18px", borderRadius: 14,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
            marginBottom: 14, fontSize: 11,
          }}>
            {[
              { label: "Fee", value: `$${fee.toFixed(2)}` },
              { label: "Spent on Crypto", value: `$${spentOnCrypto.toFixed(2)}` },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                <span style={{ color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>{row.label}</span>
                <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {err && (
            <div style={{
              color: "#ef4444", fontSize: 12, textAlign: "center",
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
              marginBottom: 12,
            }}>{err}</div>
          )}

          <FancyCancelConfirm onCancel={onClose} onConfirm={submit} confirmLabel="Buy Now" loading={loading} disabled={!canBuy} />
        </>
      )}
    </FancyModalShell>
  );
}

function SyncToCardModal({ onClose, onDone, availableBalance }: {
  onClose: () => void; onDone: () => void; availableBalance: number;
}) {
  const [fromToken, setFromToken] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [cards, setCards] = useState<Array<{ id: string; type?: string; kind?: string; last4?: string; number?: string; name?: string }> | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [prices, setPrices] = useState<Record<string, { price: number }>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/market/prices").then((r) => r.json()).then((j) => setPrices(j?.prices || {}));
    fetch("/api/cards/account")
      .then((r) => r.ok ? r.json() : { cards: [] })
      .then((j) => {
        const list = (j.cards ?? j.account?.cards ?? []) as Array<Record<string, unknown>>;
        const normalized = list.map((c) => ({
          id: String(c.id ?? ""),
          kind: String(c.type ?? c.kind ?? "physical").toLowerCase(),
          last4: String(c.last4 ?? c.number ?? "").slice(-4),
          name: String(c.name ?? (c.type ?? "Card")),
        }));
        setCards(normalized);
        if (normalized[0]) setSelectedCardId(normalized[0].id);
      })
      .catch(() => setCards([]));
  }, []);

  const amountNum = Number(amount) || 0;
  const price = prices[fromToken]?.price ?? 1;
  const usdEquiv = amountNum * price;
  const fee = +(usdEquiv * 0.005).toFixed(2);
  const cardReceives = Math.max(0, usdEquiv - fee);
  const canSync = amountNum > 0 && amountNum <= availableBalance && !!selectedCardId;

  async function submit() {
    setErr(null);
    if (!canSync) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/cards/${encodeURIComponent(selectedCardId)}/load`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, token: fromToken, walletType: "ewallet" }),
      });
      if (!r.ok) { setErr("Sync failed."); return; }
      setDone(true);
      setTimeout(() => { onDone(); onClose(); }, 1200);
    } catch { setErr("Network error."); }
    finally { setLoading(false); }
  }

  return (
    <FancyModalShell title="Convert & Send to Card" subtitle="Crypto to fiat to card" onClose={onClose}>
      {done ? <DoneState label="Card load submitted" /> : (
        <>
          {/* Token picker */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <button type="button" onClick={() => setPickerOpen((o) => !o)} style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "inherit",
            }}>
              <img src={tokenIcon(fromToken)} alt={fromToken} width={24} height={24} style={{ borderRadius: "50%" }} />
              <span style={{ flex: 1, textAlign: "left", color: "var(--text)", fontWeight: 700, fontSize: 14 }}>{fromToken}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {pickerOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 10,
                background: "var(--bg)", border: "1px solid var(--glass-border)",
                borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              }}>
                {["BTC", "ETH", "SOL", "BNB", "XRP", "USDT", "USDC"].map((t) => (
                  <button key={t} type="button" onClick={() => { setFromToken(t); setPickerOpen(false); }}
                    style={{
                      width: "100%", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
                      background: t === fromToken ? "rgba(var(--primary-rgb), 0.08)" : "transparent",
                      border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                      color: "var(--text)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    }}>
                    <img src={tokenIcon(t)} alt={t} width={18} height={18} style={{ borderRadius: "50%" }} />
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <input
              type="number" inputMode="decimal" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                color: "var(--primary)", fontSize: 32, fontWeight: 800,
                fontFamily: "var(--font-mono)", textAlign: "center",
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", letterSpacing: 2, marginTop: -6 }}>{fromToken}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
              {amountNum > 0 ? `≈ $${usdEquiv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : "Enter an amount to sync"}
            </div>
            {amountNum > availableBalance && (
              <div style={{
                display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: 12,
                background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#ef4444", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              }}>Insufficient balance · Available ${availableBalance.toFixed(2)}</div>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "18px 0" }} />

          {/* Card selector */}
          <label style={fancyLabel}>Select Destination</label>
          {cards === null ? (
            <div style={{
              padding: 14, borderRadius: 14, background: "var(--surface)",
              border: "1px solid var(--glass-border)", color: "var(--text-muted)",
              fontSize: 12, textAlign: "center", marginBottom: 16,
            }}>Loading your cards…</div>
          ) : cards.length === 0 ? (
            <div style={{
              padding: 16, borderRadius: 14, background: "var(--surface)",
              border: "1px solid var(--glass-border)", marginBottom: 16,
              fontSize: 13, color: "var(--text-muted)", textAlign: "center",
            }}>
              No cards yet. <a href="/cards/order" style={{ color: "var(--primary)" }}>Order a card →</a>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: cards.length > 1 ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 16 }}>
              {cards.map((c) => {
                const active = selectedCardId === c.id;
                const label = c.kind === "virtual" ? "Virtual Card" : "Physical Card";
                return (
                  <button key={c.id} type="button" onClick={() => setSelectedCardId(c.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 14,
                      background: active ? "rgba(var(--primary-rgb), 0.12)" : "var(--surface)",
                      border: `1px solid ${active ? "var(--primary)" : "var(--glass-border)"}`,
                      color: active ? "var(--primary)" : "var(--text)",
                      fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: "50%",
                      border: active ? "4px solid var(--primary)" : "1px solid var(--text-muted)",
                      flexShrink: 0,
                    }} />
                    <div style={{ textAlign: "left" }}>
                      <div>{label}</div>
                      <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: 1, marginTop: 2 }}>
                        {c.last4 ? `••••${c.last4}` : c.id.slice(0, 6)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Flow row */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr",
            gap: 8, alignItems: "center",
            padding: "12px 14px", borderRadius: 12,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
            marginBottom: 14, fontSize: 11,
          }}>
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ color: "var(--text)", fontWeight: 700 }}>{amountNum} {fromToken}</div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 4 }}>
                <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
              </svg>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ color: "var(--text)", fontWeight: 700 }}>${usdEquiv.toFixed(2)}</div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 4 }}>
                <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M22 10H2" />
              </svg>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ color: "var(--text)", fontWeight: 700 }}>Card</div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 4 }}>
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
          </div>

          <div style={{ padding: "12px 18px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--glass-border)", marginBottom: 16, fontSize: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
              <span style={{ color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>Conversion Fee</span>
              <span style={{ color: "#eab308", fontFamily: "var(--font-mono)", fontWeight: 700 }}>${fee.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
              <span style={{ color: "var(--text)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Card Receives</span>
              <span style={{ color: "var(--primary)", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 15 }}>${cardReceives.toFixed(2)}</span>
            </div>
          </div>

          {err && (
            <div style={{
              color: "#ef4444", fontSize: 12, textAlign: "center",
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
              marginBottom: 12,
            }}>{err}</div>
          )}

          <FancyCancelConfirm onCancel={onClose} onConfirm={submit} confirmLabel="Sync Now" loading={loading} disabled={!canSync} />
        </>
      )}
    </FancyModalShell>
  );
}

function ComingSoonModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>Coming Soon</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          This feature is being finalized and will be available shortly.
        </p>
      </div>
      <ModalActions onClose={onClose} loading={false} submitLabel="OK" onSubmit={onClose} />
    </ModalShell>
  );
}

// ───────────────────────── Page ─────────────────────────

export default function EWalletPage() {
  const { walletsByType, loading } = useUser();
  const w = walletsByType.ewallet;

  const [showTransfer, setShowTransfer] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  async function loadTxs() {
    const qs = new URLSearchParams({ walletType: "ewallet" });
    const res = await fetch(`/api/transactions?${qs}`);
    if (!res.ok) { setTxs([]); return; }
    const j = await res.json();
    setTxs(j.transactions ?? []);
  }

  useEffect(() => { loadTxs(); }, []);

  const filtered = (txs ?? []).filter((t) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      (t.reference?.toLowerCase().includes(s)) ||
      (t.email?.toLowerCase().includes(s)) ||
      (t.id?.toLowerCase().includes(s));
    const matchesStatus = !status || t.status?.toLowerCase().includes(status.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  // Compute today's net change
  const todayIso = new Date().toDateString();
  const todayNet = (txs ?? []).filter((t) => new Date(t.createdDate).toDateString() === todayIso)
    .reduce((s, t) => s + (t.side === "debit" || t.amount < 0 ? -Math.abs(t.amount) : Math.abs(t.amount)), 0);
  const todayUp = todayNet >= 0;

  const accountId = (w?.externalId || w?.id || "").toString().toUpperCase().slice(0, 10) || "—";

  // Pagination
  const pageSize = 7;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const pageRows = filtered.slice(pageStart, pageEnd);

  const fmtRelative = (d: string) => {
    const now = new Date();
    const then = new Date(d);
    const diff = now.getTime() - then.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60 && then.toDateString() === now.toDateString()) {
      return then.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const yd = new Date(); yd.setDate(yd.getDate() - 1);
    if (then.toDateString() === yd.toDateString()) return "Yesterday";
    const days = Math.floor(diff / (24 * 3600 * 1000));
    if (days < 7) return `${days} days ago`;
    return then.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* ─── Hero Balance Card ─── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        borderRadius: 24, padding: "28px 32px", marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{
              fontSize: 11, letterSpacing: 2, color: "var(--primary)",
              fontWeight: 600, textTransform: "uppercase",
            }}>E-Wallet Balance</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 10px", borderRadius: 16,
              background: todayUp ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${todayUp ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: todayUp ? "#10b981" : "#ef4444",
              fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {todayUp ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /> : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />}
                {todayUp ? <polyline points="17 6 23 6 23 12" /> : <polyline points="17 18 23 18 23 12" />}
              </svg>
              {todayUp ? "+" : ""}{formatMoney(todayNet, w?.currency || "USD")} TODAY
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
            <div style={{
              fontSize: 52, fontWeight: 800, fontFamily: "var(--font-mono)",
              color: "var(--text)", lineHeight: 1,
            }}>
              {loading ? "…" : formatMoney(w?.balance ?? 0, w?.currency ?? "USD")}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", letterSpacing: 1 }}>
              {w?.currency ?? "USD"}
            </div>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(w?.id || ""); }}
            title="Copy account ID"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 12px", borderRadius: 16,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)",
              letterSpacing: 1, cursor: "pointer",
            }}
          >
            ACCOUNT ID: EW-{accountId}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
        <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
          {/* Rotating dashed ring */}
          <svg
            width="130" height="130" viewBox="0 0 130 130"
            style={{
              position: "absolute", inset: 0,
              animation: "ewRingSpin 14s linear infinite",
            }}
          >
            <circle
              cx="65" cy="65" r="62"
              fill="none"
              stroke="rgba(16,185,129,0.55)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              strokeLinecap="round"
            />
          </svg>
          {/* Solid emerald disc */}
          <div style={{
            position: "absolute", inset: 22, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #10b981 0%, #0a7a5c 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 45px rgba(16,185,129,0.45), inset 0 0 20px rgba(255,255,255,0.12)",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0a1612" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="2.5" />
              <path d="M3 10h18" />
              <circle cx="16.5" cy="14.5" r="1.2" fill="#0a1612" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Action Grid ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Transfer", onClick: () => setShowTransfer(true), icon: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></> },
          { label: "Bank Withdraw", onClick: () => setShowBank(true), icon: <><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></> },
          { label: "Crypto Swap", onClick: () => setShowCrypto(true), icon: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></> },
          { label: "Card Load", onClick: () => setShowCard(true), icon: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
        ].map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            type="button"
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 10, padding: "20px 12px", borderRadius: 16,
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              color: "var(--text)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.background = "var(--glass-bg)"; }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {a.icon}
            </svg>
            {a.label}
          </button>
        ))}
      </div>

      {/* ─── Filter Bar ─── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{
          flex: 1, minWidth: 260, display: "flex", alignItems: "center", gap: 10,
          padding: "10px 18px", borderRadius: 28,
          background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reference…"
            style={{
              flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
              color: "var(--text)", fontSize: 13, fontFamily: "inherit",
            }}
          />
        </div>
        <FilterPill label="Status" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[
          { label: "All", value: "" }, { label: "Complete", value: "complete" },
          { label: "Processing", value: "pending" }, { label: "Failed", value: "failed" },
        ]} />
        <FilterPill label="Date Range" value="" onChange={() => {}} options={[{ label: "All Time", value: "" }]} disabled />
        <FilterPill label="Amount" value="" onChange={() => {}} options={[{ label: "Any", value: "" }]} disabled />
        <button
          type="button"
          onClick={() => {
            const headers = ["ID", "Reference", "Amount", "Fee", "Email", "Status", "Date"];
            const rows = filtered.map((t) => [t.id, t.reference || "", String(t.amount), String(t.fee ?? 0), t.email || "", t.status, t.createdDate]);
            const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `ewallet-transactions-${Date.now()}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 28,
            background: "transparent", border: "1px solid var(--primary)",
            color: "var(--primary)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 0 15px rgba(var(--primary-rgb), 0.15)",
          }}
        >
          Export CSV
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {/* ─── Transactions Table ─── */}
      <div style={{
        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
        borderRadius: 18, overflow: "hidden",
      }}>
        {txs === null ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading transactions…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center" }}>
            <img src="/icon-192.png" alt="" width={56} height={56} style={{ opacity: 0.35, borderRadius: 14, marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>No e-wallet transactions yet</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Your e-wallet activity will show up here.</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "90px 1.4fr 1fr 0.8fr 1.2fr 1fr 100px",
              gap: 16, padding: "16px 22px",
              borderBottom: "1px solid var(--glass-border)",
              fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
              color: "var(--text-muted)", textTransform: "uppercase",
              background: "rgba(var(--primary-rgb), 0.03)",
            }}>
              <div>ID</div><div>Reference</div><div>Amount</div><div>Fee</div><div>Counterparty</div><div>Status</div><div style={{ textAlign: "right" }}>Date</div>
            </div>
            {/* Rows */}
            {pageRows.map((t, i) => {
              const isDebit = t.side === "debit" || t.amount < 0;
              const abs = Math.abs(t.amount);
              const s = t.status.toLowerCase();
              const statusClass =
                /complete|success|confirmed/.test(s) ? "complete" :
                /fail|reject|cancel/.test(s) ? "failed" : "pending";
              const statusLabel = statusClass === "complete" ? "COMPLETED" : statusClass === "failed" ? "FAILED" : "PROCESSING";
              return (
                <div
                  key={t.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1.4fr 1fr 0.8fr 1.2fr 1fr 100px",
                    gap: 16, padding: "16px 22px",
                    borderBottom: i < pageRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    alignItems: "center", fontSize: 13,
                  }}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                    {t.id.slice(0, 7).toUpperCase()}
                  </div>
                  <div style={{ color: "var(--text)", fontWeight: 600 }}>{t.reference || "—"}</div>
                  <div style={{
                    color: isDebit ? "#ef4444" : "#10b981",
                    fontFamily: "var(--font-mono)", fontWeight: 700,
                  }}>
                    {isDebit ? "-" : "+"}{formatMoney(abs, t.currency || "USD")}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: 12 }}>
                    {t.fee ? "-" : ""}{formatMoney(t.fee ?? 0, t.currency || "USD")}
                  </div>
                  <div style={{ color: "var(--text)", fontSize: 12 }}>{t.email || "—"}</div>
                  <div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 12,
                      fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                      background:
                        statusClass === "complete" ? "rgba(16,185,129,0.1)" :
                        statusClass === "failed" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
                      border: `1px solid ${
                        statusClass === "complete" ? "rgba(16,185,129,0.3)" :
                        statusClass === "failed" ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"
                      }`,
                      color:
                        statusClass === "complete" ? "#10b981" :
                        statusClass === "failed" ? "#ef4444" : "#eab308",
                    }}>{statusLabel}</span>
                  </div>
                  <div style={{
                    textAlign: "right", fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)", fontSize: 12,
                  }}>{fmtRelative(t.createdDate)}</div>
                </div>
              );
            })}
            {/* Pagination */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 22px", borderTop: "1px solid var(--glass-border)",
              fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase",
            }}>
              <div>Showing {pageStart + 1}–{Math.min(pageEnd, filtered.length)} of {filtered.length}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 20,
                    background: "transparent", border: "1px solid var(--glass-border)",
                    color: page <= 1 ? "var(--text-muted)" : "var(--text)",
                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                    cursor: page <= 1 ? "not-allowed" : "pointer", fontFamily: "inherit",
                    opacity: page <= 1 ? 0.5 : 1,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 20,
                    background: "transparent",
                    border: `1px solid ${page >= totalPages ? "var(--glass-border)" : "var(--primary)"}`,
                    color: page >= totalPages ? "var(--text-muted)" : "var(--primary)",
                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                    cursor: page >= totalPages ? "not-allowed" : "pointer", fontFamily: "inherit",
                    opacity: page >= totalPages ? 0.5 : 1,
                  }}
                >
                  Next
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} onDone={loadTxs} availableBalance={w?.balance ?? 0} currency={w?.currency ?? "USD"} />}
      {showBank && <BankWithdrawModal onClose={() => setShowBank(false)} onDone={loadTxs} availableBalance={w?.balance ?? 0} currency={w?.currency ?? "USD"} />}
      {showCrypto && <BuyCryptoModal onClose={() => setShowCrypto(false)} availableBalance={w?.balance ?? 0} currency={w?.currency ?? "USD"} />}
      {showCard && <SyncToCardModal onClose={() => setShowCard(false)} onDone={loadTxs} availableBalance={w?.balance ?? 0} />}
    </>
  );
}

// ───────────────────────── Styles + Shared ─────────────────────────

const walletHeaderStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: 24, marginBottom: 20,
  background: "var(--glass-bg)", backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)", borderRadius: 20,
};
const iconBox: React.CSSProperties = {
  width: 56, height: 56, borderRadius: 16,
  background: "rgba(var(--primary-rgb), 0.1)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const actionPill: React.CSSProperties = {
  padding: "14px 16px", borderRadius: 14,
  background: "var(--glass-bg)", backdropFilter: "blur(10px)",
  border: "1px solid var(--glass-border)", color: "var(--text)",
  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
  transition: "all 0.2s",
};
const modalInput: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  background: "var(--surface)", border: "1px solid var(--glass-border)",
  color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif",
};
const tableHead: React.CSSProperties = {
  padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
  letterSpacing: 1, color: "var(--text-muted)", borderBottom: "1px solid var(--glass-border)",
};
const tableRow: React.CSSProperties = { borderBottom: "1px solid var(--glass-border)" };
const tableCell: React.CSSProperties = { padding: "12px 16px", fontSize: 13 };
const monoSmall: React.CSSProperties = { fontFamily: "JetBrains Mono, monospace", fontSize: 12 };

function FilterPill({ label, value, onChange, options, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[]; disabled?: boolean;
}) {
  return (
    <div style={{
      position: "relative", display: "inline-flex", alignItems: "center",
      padding: "10px 14px 10px 16px", borderRadius: 28,
      background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
      opacity: disabled ? 0.5 : 1,
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "var(--text-muted)",
        textTransform: "uppercase", marginRight: 8,
      }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          background: "transparent", border: "none", outline: "none",
          color: "var(--text)", fontSize: 11, fontWeight: 600,
          fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer",
          paddingRight: 14,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "var(--bg)", color: "var(--text)" }}>{o.label}</option>
        ))}
      </select>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 14, pointerEvents: "none" }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

function VerifiedDot() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)" aria-label="Verified">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

function StatusBadge({ kind, label }: { kind: "complete" | "pending" | "failed"; label: string }) {
  const color = kind === "complete" ? "var(--success)" : kind === "failed" ? "var(--danger)" : "var(--warning)";
  const bg = kind === "complete" ? "rgba(16,185,129,0.1)" : kind === "failed" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: bg, color, border: `1px solid ${color}33`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 440,
        background: "var(--bg-elevated, #0b1c16)", border: "1px solid var(--glass-border)",
        borderRadius: 20, padding: 24, animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button type="button" onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "1px solid var(--glass-border)",
            background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 18,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--text-muted)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ModalActions({ onClose, loading, submitLabel, onSubmit }: { onClose: () => void; loading: boolean; submitLabel: string; onSubmit?: () => void }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
      <button type="button" onClick={onClose} style={{
        flex: 1, padding: 12, borderRadius: 10, border: "1px solid var(--glass-border)",
        background: "transparent", color: "var(--text-secondary)", fontWeight: 600, fontSize: 14, cursor: "pointer",
      }}>Cancel</button>
      <button type={onSubmit ? "button" : "submit"} onClick={onSubmit} disabled={loading} style={{
        flex: 1, padding: 12, borderRadius: 10, border: "none",
        background: loading ? "var(--text-muted)" : "var(--primary)",
        color: "var(--bg)", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
      }}>{loading ? "Please wait..." : submitLabel}</button>
    </div>
  );
}

function SuccessState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{
        width: 60, height: 60, margin: "0 auto 16px", borderRadius: "50%",
        background: "rgba(16,185,129,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{label}</h3>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>Redirecting...</p>
    </div>
  );
}
