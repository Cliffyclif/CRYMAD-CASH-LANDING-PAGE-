import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@crymad/ui";
import { useLogin } from "../lib/hooks";

export function LoginScreen() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const login = useLogin();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email });
      nav("/");
    } catch {
      /* via mutation.error */
    }
  }

  return (
    <main className="relative z-10 flex flex-col px-6 pb-8">
      {/* Brand Header */}
      <header className="flex w-full flex-col items-center pb-4 pt-6">
        <h1 className="gradient-emerald font-sans text-[32px] font-extrabold uppercase leading-none tracking-tighter">
          CRYMAD CA$H
        </h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
          DIGITAL FINANCE PLATFORM
        </p>
      </header>

      {/* Breathing Logo */}
      <div className="my-8 flex justify-center">
        <div className="relative flex h-[120px] w-[120px] items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            style={{ animation: "breathe 4s ease-in-out infinite" }}
          >
            <defs>
              <linearGradient id="ringGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="url(#ringGradMobile)"
              strokeWidth="2"
              strokeDasharray="15 5"
            />
          </svg>
          <Logo size={88} />
        </div>
      </div>
      <style>{`@keyframes breathe { 0%,100% { transform: scale(1); opacity: 0.6 } 50% { transform: scale(1.05); opacity: 1 } }`}</style>

      {/* Heading */}
      <div className="mb-6 flex flex-col">
        <h2 className="gradient-emerald font-sans text-[28px] font-extrabold leading-tight">
          Welcome Back
        </h2>
        <p className="mt-1 text-[14px] text-text opacity-70">Sign in to your bioluminescent wallet</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label className="ml-1 block font-mono text-[11px] uppercase tracking-widest text-primary">
            EMAIL
          </label>
          <div
            className="flex h-[56px] items-center rounded-[20px] border border-primary/10 px-5 transition-all focus-within:ring-1 focus-within:ring-primary/40"
            style={{ background: "rgba(44, 55, 51, 0.4)", backdropFilter: "blur(20px)" }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@crymadcash.io"
              className="w-full border-none bg-transparent font-mono text-[14px] text-text outline-none placeholder:text-text/30"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="ml-1 block font-mono text-[11px] uppercase tracking-widest text-primary">
            PASSWORD
          </label>
          <div
            className="flex h-[56px] items-center rounded-[20px] border border-primary/10 px-5 transition-all focus-within:ring-1 focus-within:ring-primary/40"
            style={{ background: "rgba(44, 55, 51, 0.4)", backdropFilter: "blur(20px)" }}
          >
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-none bg-transparent font-mono text-[14px] text-text outline-none"
            />
            <span
              onClick={() => setShowPwd(!showPwd)}
              className="material-symbols-outlined cursor-pointer text-text/50"
            >
              {showPwd ? "visibility_off" : "visibility"}
            </span>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div
            onClick={() => setRemember(!remember)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-primary/10 px-3 py-1.5"
            style={{ background: "rgba(44, 55, 51, 0.4)" }}
          >
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary/40">
              <div className={`h-2 w-2 rounded-sm bg-primary transition-opacity ${remember ? "opacity-100" : "opacity-0"}`} />
            </div>
            <span className="font-mono text-[10px] uppercase text-text/80">Remember me</span>
          </div>
          <Link to="/forgot-password" className="font-mono text-[10px] uppercase text-primary transition-colors hover:text-secondary">
            Forgot Password? →
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={login.isPending}
          className="mt-6 h-[56px] w-full rounded-full bg-primary text-[14px] font-bold uppercase tracking-widest text-[#002113] shadow-[0_8px_25px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_8px_35px_rgba(16,185,129,0.5)] active:scale-95 disabled:opacity-50"
        >
          {login.isPending ? "Authenticating..." : "Sign In →"}
        </button>

        {login.error && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 p-3 font-mono text-[10px] text-danger">
            {(login.error as Error).message}
          </div>
        )}
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 border-t border-dashed border-text/20" />
        <span className="font-mono text-[11px] uppercase text-text/40">OR</span>
        <div className="flex-1 border-t border-dashed border-text/20" />
      </div>

      {/* Social */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <button
          className="flex h-[50px] items-center justify-center gap-2 rounded-[20px] border border-primary/10 transition-colors hover:bg-white/5"
          style={{ background: "rgba(44, 55, 51, 0.4)" }}
        >
          <svg className="h-5 w-5 opacity-80" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-mono text-[11px] uppercase tracking-wider text-text">GOOGLE</span>
        </button>
        <button
          className="flex h-[50px] items-center justify-center gap-2 rounded-[20px] border border-primary/10 transition-colors hover:bg-white/5"
          style={{ background: "rgba(44, 55, 51, 0.4)" }}
        >
          <svg className="h-5 w-5 opacity-80" viewBox="0 0 24 24" fill="currentColor">
            <path className="text-text" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
          </svg>
          <span className="font-mono text-[11px] uppercase tracking-wider text-text">APPLE</span>
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-center pb-6">
        <p className="font-mono text-[12px] text-text/60">
          New to Crymad?
          <Link to="/register" className="ml-1 font-bold uppercase text-primary active:opacity-60">
            Create Account →
          </Link>
        </p>
      </div>
    </main>
  );
}
