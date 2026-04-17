import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Logo } from "@crymad/ui";
import { api } from "../lib/api";

function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; firstName: string; lastName: string }) =>
      api<{ ok: boolean; user: Record<string, unknown> }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function RegisterScreen() {
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
  const strengthColors = ["bg-danger", "bg-warning", "bg-primary"];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tos || !privacy) return;
    try {
      await register.mutateAsync({ email, firstName, lastName });
      nav("/");
    } catch {
      /* handled */
    }
  }

  return (
    <main className="relative z-10 flex flex-col space-y-8 px-6 pb-8">
      {/* Back nav */}
      <nav className="pt-2">
        <Link
          to="/login"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/10"
          style={{ background: "rgba(44, 55, 51, 0.4)" }}
        >
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </Link>
      </nav>

      {/* Header */}
      <header className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
        <Logo size={56} />
        <div>
          <h1 className="gradient-emerald font-sans text-4xl font-extrabold tracking-tighter">
            Create Account
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
            JOIN THE BIOLUMINESCENT ECONOMY
          </p>
        </div>
      </header>

      {/* Account Toggle */}
      <div
        className="flex h-[52px] gap-1 rounded-full border border-primary/10 p-1.5"
        style={{ background: "rgba(44, 55, 51, 0.4)" }}
      >
        <button
          type="button"
          onClick={() => setTab("personal")}
          className={`flex-1 rounded-full text-sm font-bold transition-all ${
            tab === "personal"
              ? "bg-gradient-to-r from-primary to-secondary text-[#002113] shadow-lg shadow-primary/20"
              : "text-text-muted hover:bg-white/5"
          }`}
        >
          PERSONAL
        </button>
        <button
          type="button"
          onClick={() => setTab("business")}
          className={`flex-1 rounded-full text-sm font-bold transition-all ${
            tab === "business"
              ? "bg-gradient-to-r from-primary to-secondary text-[#002113] shadow-lg shadow-primary/20"
              : "text-text-muted hover:bg-white/5"
          }`}
        >
          BUSINESS
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group relative">
            <label className="absolute left-5 top-2 font-mono text-[10px] tracking-wider text-primary/60">
              FIRST NAME
            </label>
            <div
              className="flex h-14 w-full items-end rounded-[20px] border border-primary/10 px-5 pb-2 transition-all group-focus-within:ring-1 group-focus-within:ring-primary/20"
              style={{ background: "rgba(44, 55, 51, 0.4)" }}
            >
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border-none bg-transparent p-0 font-mono text-sm text-text outline-none"
              />
            </div>
          </div>
          <div className="group relative">
            <label className="absolute left-5 top-2 font-mono text-[10px] tracking-wider text-primary/60">
              LAST NAME
            </label>
            <div
              className="flex h-14 w-full items-end rounded-[20px] border border-primary/10 px-5 pb-2 transition-all group-focus-within:ring-1 group-focus-within:ring-primary/20"
              style={{ background: "rgba(44, 55, 51, 0.4)" }}
            >
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border-none bg-transparent p-0 font-mono text-sm text-text outline-none"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="group relative">
          <label className="absolute left-5 top-2 font-mono text-[10px] tracking-wider text-primary/60">
            EMAIL ADDRESS
          </label>
          <div
            className="flex h-14 w-full items-end rounded-[20px] border border-primary/10 px-5 pb-2 transition-all group-focus-within:ring-1 group-focus-within:ring-primary/20"
            style={{ background: "rgba(44, 55, 51, 0.4)" }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="archive@bio.network"
              className="w-full border-none bg-transparent p-0 font-mono text-sm text-text outline-none placeholder:text-text-muted/50"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="group relative">
            <label className="absolute left-5 top-2 font-mono text-[10px] tracking-wider text-primary/60">
              PASSWORD
            </label>
            <div
              className="flex h-14 w-full items-end rounded-[20px] border border-primary/10 px-5 pb-2 transition-all group-focus-within:ring-1 group-focus-within:ring-primary/20"
              style={{ background: "rgba(44, 55, 51, 0.4)" }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full border-none bg-transparent p-0 font-mono text-sm text-text outline-none"
              />
            </div>
          </div>
          {password && (
            <div className="mt-3 px-1">
              <div className="flex h-1 gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-full ${
                      i < strength ? strengthColors[i] : "bg-text/20"
                    }`}
                    style={i < strength ? { boxShadow: "0 0 8px currentColor" } : {}}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-widest text-primary">STRENGTH: {strengthLabel}</span>
                <span className="font-mono text-[9px] text-text-muted opacity-60">MIN 12 CHARS</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div className="group relative">
          <label className="absolute left-5 top-2 font-mono text-[10px] tracking-wider text-primary/60">
            CONFIRM PASSWORD
          </label>
          <div
            className="flex h-14 w-full items-end rounded-[20px] border border-primary/10 px-5 pb-2 transition-all group-focus-within:ring-1 group-focus-within:ring-primary/20"
            style={{ background: "rgba(44, 55, 51, 0.4)" }}
          >
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border-none bg-transparent p-0 font-mono text-sm text-text outline-none"
            />
            {confirm && confirm === password && (
              <span className="material-symbols-outlined filled mb-1 text-primary">check_circle</span>
            )}
          </div>
        </div>

        {/* Legal */}
        <div className="space-y-3">
          <div
            onClick={() => setTos(!tos)}
            className="flex cursor-pointer items-center gap-4 rounded-[20px] border border-primary/10 p-4"
            style={{ background: "rgba(44, 55, 51, 0.4)" }}
          >
            <div className={`flex h-6 w-6 items-center justify-center rounded-lg border ${tos ? "border-primary bg-primary/20" : "border-primary/30"}`}>
              {tos && <span className="material-symbols-outlined text-[18px] font-bold text-primary">check</span>}
            </div>
            <span className="text-xs text-text-muted">
              I accept the <span className="font-semibold text-primary">Terms of Service</span>
            </span>
          </div>
          <div
            onClick={() => setPrivacy(!privacy)}
            className="flex cursor-pointer items-center gap-4 rounded-[20px] border border-primary/10 p-4"
            style={{ background: "rgba(44, 55, 51, 0.4)" }}
          >
            <div className={`flex h-6 w-6 items-center justify-center rounded-lg border ${privacy ? "border-primary bg-primary/20" : "border-primary/30"}`}>
              {privacy && <span className="material-symbols-outlined text-[18px] font-bold text-primary">check</span>}
            </div>
            <span className="text-xs text-text-muted">
              I accept the <span className="font-semibold text-primary">Privacy Policy</span>
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={register.isPending || !tos || !privacy}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-extrabold uppercase tracking-widest text-[#002113] shadow-[0_10px_40px_rgba(16,185,129,0.2)] transition-all active:scale-95 disabled:opacity-50"
          style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
        >
          {register.isPending ? "CREATING..." : "CREATE ACCOUNT"}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        {register.error && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 p-3 font-mono text-[10px] text-danger">
            {(register.error as Error).message}
          </div>
        )}
      </form>

      {/* Footer */}
      <footer className="pb-4 pt-4 text-center">
        <p className="font-mono text-[11px] text-text-muted">
          Already have an account?
          <Link to="/login" className="ml-1 font-bold text-primary active:opacity-60">
            Sign In →
          </Link>
        </p>
      </footer>
    </main>
  );
}
