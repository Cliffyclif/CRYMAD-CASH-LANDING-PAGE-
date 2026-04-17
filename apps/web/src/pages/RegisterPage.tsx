import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@crymad/ui";
import { useRegister } from "../lib/hooks";

export function RegisterPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"personal" | "business">("personal");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [tos, setTos] = useState(true);
  const [privacy, setPrivacy] = useState(true);
  const register = useRegister();

  const strength = Math.min(3, Math.floor(password.length / 4));
  const strengthLabel = ["WEAK", "FAIR", "GOOD", "STRONG"][strength];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tos || !privacy) return;
    try {
      await register.mutateAsync({ email, firstName, lastName });
      nav("/");
    } catch {
      /* via mutation.error */
    }
  }

  return (
    <main className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-20">
      <div className="w-full max-w-[520px]">
        {/* Glass Card */}
        <div
          className="relative overflow-hidden rounded-[32px] border border-primary/10 p-8 md:p-10"
          style={{
            background: "rgba(44, 55, 51, 0.4)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 20px 40px rgba(4,13,10,0.5), 0 0 20px rgba(16,185,129,0.05)",
          }}
        >
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size={64} />
            <div className="mt-4 mb-4 inline-block rounded-full border border-primary/20 px-4 py-1" style={{ background: "rgba(44, 55, 51, 0.4)" }}>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Biometric Protocol v2.4
              </span>
            </div>
            <h1 className="gradient-emerald mb-2 text-3xl font-extrabold">Create Account</h1>
            <p className="font-sans text-xs text-text-muted/60">Join the bioluminescent economy</p>
          </div>

          {/* Pill Toggle */}
          <div className="mb-10 flex justify-center">
            <div
              className="flex w-full max-w-[320px] rounded-full border border-primary/10 p-1"
              style={{ background: "rgba(44, 55, 51, 0.4)" }}
            >
              <button
                type="button"
                onClick={() => setTab("personal")}
                className={`flex-1 rounded-full py-2 font-mono text-[10px] font-bold tracking-widest transition-all ${
                  tab === "personal"
                    ? "bg-gradient-to-r from-primary to-secondary text-[#002113] shadow-lg shadow-primary/20"
                    : "text-text-muted hover:text-primary"
                }`}
              >
                PERSONAL
              </button>
              <button
                type="button"
                onClick={() => setTab("business")}
                className={`flex-1 rounded-full py-2 font-mono text-[10px] font-bold tracking-widest transition-all ${
                  tab === "business"
                    ? "bg-gradient-to-r from-primary to-secondary text-[#002113] shadow-lg shadow-primary/20"
                    : "text-text-muted hover:text-primary"
                }`}
              >
                BUSINESS
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="mb-2 block font-mono text-[10px] tracking-widest text-primary">
                  FIRST NAME
                </label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-0 border-b border-[#3c4a42] bg-transparent px-0 py-3 font-sans text-sm text-text outline-none transition-all placeholder:text-[#3c4a42]/50 focus:border-primary"
                />
              </div>
              <div className="group">
                <label className="mb-2 block font-mono text-[10px] tracking-widest text-primary">
                  LAST NAME
                </label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-0 border-b border-[#3c4a42] bg-transparent px-0 py-3 font-sans text-sm text-text outline-none transition-all placeholder:text-[#3c4a42]/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className="mb-2 block font-mono text-[10px] tracking-widest text-primary">
                EMAIL ADDRESS
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@crymad.cash"
                className="w-full border-0 border-b border-[#3c4a42] bg-transparent px-0 py-3 font-sans text-sm text-text outline-none transition-all placeholder:text-[#3c4a42]/50 focus:border-primary"
              />
            </div>

            {/* Password + strength */}
            <div className="space-y-3">
              <div className="group">
                <label className="mb-2 block font-mono text-[10px] tracking-widest text-primary">
                  ACCESS KEY
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border-0 border-b border-[#3c4a42] bg-transparent px-0 py-3 font-sans text-sm text-text outline-none transition-all placeholder:text-[#3c4a42]/50 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex h-1 gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full ${
                        i < strength
                          ? "bg-primary shadow-[0_0_8px_rgba(78,222,163,0.5)]"
                          : "bg-[#2c3733]"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-tighter text-primary">
                    STRENGTH: {strengthLabel}
                  </span>
                  <span className="material-symbols-outlined filled text-[14px] text-primary">
                    verified_user
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm */}
            <div className="group">
              <label className="mb-2 block font-mono text-[10px] tracking-widest text-primary">
                RE-ENTRY KEY
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border-0 border-b border-[#3c4a42] bg-transparent px-0 py-3 pr-8 font-sans text-sm text-text outline-none transition-all placeholder:text-[#3c4a42]/50 focus:border-primary"
                />
                {confirm && confirm === password && (
                  <span className="material-symbols-outlined filled absolute bottom-3 right-0 text-lg text-primary">
                    check_circle
                  </span>
                )}
              </div>
            </div>

            {/* Business locked fields */}
            {tab === "business" && (
              <div className="pointer-events-none grid grid-cols-2 gap-4 opacity-40 grayscale">
                <div className="flex items-center justify-between rounded-lg border border-primary/10 p-3" style={{ background: "rgba(44, 55, 51, 0.4)" }}>
                  <span className="font-mono text-[9px] tracking-tight text-text-muted">CORP_ID</span>
                  <span className="material-symbols-outlined text-sm">lock</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-primary/10 p-3" style={{ background: "rgba(44, 55, 51, 0.4)" }}>
                  <span className="font-mono text-[9px] tracking-tight text-text-muted">TAX_REF</span>
                  <span className="material-symbols-outlined text-sm">lock</span>
                </div>
              </div>
            )}

            {/* Checkbox pills */}
            <div className="flex flex-wrap gap-3">
              <label
                onClick={() => setTos(!tos)}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-primary/10 px-4 py-2 transition-all hover:border-primary/40"
                style={{ background: "rgba(44, 55, 51, 0.4)" }}
              >
                <div className={`h-4 w-4 rounded border ${tos ? "border-primary bg-primary/20" : "border-[#3c4a42]"} flex items-center justify-center`}>
                  {tos && <span className="material-symbols-outlined text-[12px] text-primary">check</span>}
                </div>
                <span className="font-mono text-[10px] text-text-muted">Terms of Service</span>
              </label>
              <label
                onClick={() => setPrivacy(!privacy)}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-primary/10 px-4 py-2 transition-all hover:border-primary/40"
                style={{ background: "rgba(44, 55, 51, 0.4)" }}
              >
                <div className={`h-4 w-4 rounded border ${privacy ? "border-primary bg-primary/20" : "border-[#3c4a42]"} flex items-center justify-center`}>
                  {privacy && <span className="material-symbols-outlined text-[12px] text-primary">check</span>}
                </div>
                <span className="font-mono text-[10px] text-text-muted">Privacy Policy</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={register.isPending || !tos || !privacy}
              className="group flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary transition-all hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-[#002113] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {register.isPending ? "CREATING..." : "CREATE ACCOUNT"}
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>

            {register.error && (
              <div className="rounded-md border border-danger/40 bg-danger/10 p-3 font-mono text-[10px] text-danger">
                {(register.error as Error).message}
              </div>
            )}
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="group inline-flex items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary transition-colors hover:text-secondary"
            >
              ALREADY HAVE AN ACCOUNT? SIGN IN
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
