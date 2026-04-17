import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@crymad/ui";
import { useLogin } from "../lib/hooks";

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const login = useLogin();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email });
      nav("/");
    } catch {
      /* shown via mutation.error */
    }
  }

  return (
    <main className="relative z-10 flex min-h-screen w-full items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        {/* Brand Intro */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={72} />
          <div>
            <h1 className="gradient-emerald font-sans text-3xl font-extrabold uppercase tracking-tighter">
              CRYMAD CA$H
            </h1>
            <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-text-muted/60">
              DIGITAL FINANCE PLATFORM
            </p>
          </div>
        </div>

        {/* Centered Glass Card */}
        <div
          className="rounded-[32px] border border-primary/10 p-8"
          style={{
            background: "rgba(44, 55, 51, 0.4)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 20px 40px rgba(4,13,10,0.5), 0 0 20px rgba(16,185,129,0.05)",
          }}
        >
          {/* Welcome */}
          <div className="mb-8 flex flex-col items-center">
            <h2 className="gradient-emerald mb-1 text-2xl font-extrabold">Welcome Back</h2>
            <p className="text-[12px] text-text-muted">Sign in to your bioluminescent wallet</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="group">
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-text-muted/70 transition-colors group-focus-within:text-primary">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@crymadcash.io"
                className="w-full border-0 border-b border-[#2c3733] bg-transparent px-0 py-2 text-sm text-text outline-none transition-all placeholder:text-text-muted/30 focus:border-primary"
              />
            </div>

            <div className="group relative">
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-text-muted/70 transition-colors group-focus-within:text-primary">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-0 border-b border-[#2c3733] bg-transparent px-0 py-2 pr-8 text-sm text-text outline-none transition-all placeholder:text-text-muted/30 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute bottom-2 right-0 text-text-muted transition-colors hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPwd ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Utilities Row */}
            <div className="flex items-center justify-between pt-2">
              <label
                onClick={() => setRemember(!remember)}
                className="group flex cursor-pointer items-center space-x-2"
              >
                <div
                  className={`relative h-4 w-8 rounded-full border transition-all ${
                    remember ? "border-primary bg-primary/20" : "border-[#3c4a42]/30 bg-[#2c3733]"
                  } group-hover:border-primary/40`}
                >
                  <div
                    className={`absolute top-1 h-2 w-2 rounded-full transition-all ${
                      remember ? "left-5 bg-primary" : "left-1 bg-text-muted"
                    }`}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  REMEMBER
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="flex items-center font-mono text-[10px] uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
              >
                FORGOT PASSWORD?
                <span className="material-symbols-outlined ml-1 text-[12px]">arrow_forward</span>
              </Link>
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              disabled={login.isPending}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-primary/30 font-mono text-[12px] uppercase tracking-widest text-primary transition-all hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 hover:shadow-[0_0_20px_rgba(78,222,163,0.1)] disabled:opacity-50"
            >
              {login.isPending ? "AUTHENTICATING..." : "SIGN IN"}
              <span className="material-symbols-outlined ml-2 text-[14px]">trending_flat</span>
            </button>

            {login.error && (
              <div className="rounded-md border border-danger/40 bg-danger/10 p-3 font-mono text-[10px] text-danger">
                {(login.error as Error).message}
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-dashed border-[#3c4a42]/30" />
            <span className="px-4 font-mono text-[10px] uppercase tracking-widest text-text-muted/40">
              OR
            </span>
            <div className="flex-grow border-t border-dashed border-[#3c4a42]/30" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex h-10 items-center justify-center rounded-full border border-[#3c4a42]/20 bg-[#131e1a]/50 transition-colors hover:bg-[#222c29]">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-wider text-text">Google</span>
            </button>
            <button className="flex h-10 items-center justify-center rounded-full border border-[#3c4a42]/20 bg-[#131e1a]/50 transition-colors hover:bg-[#222c29]">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path className="text-text" fill="currentColor" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-wider text-text">Apple</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-text-muted/60">
              New to Crymad?
              <Link
                to="/register"
                className="ml-1 inline-flex items-center font-mono font-bold text-primary underline-offset-4 decoration-primary/30 transition-all hover:underline"
              >
                Create Account
                <span className="material-symbols-outlined ml-1 text-[12px]">north_east</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Hardware Label */}
        <div className="mt-6 flex justify-center opacity-30">
          <div className="rounded-full border border-[#3c4a42]/20 px-3 py-1">
            <p className="font-mono text-[8px] uppercase tracking-[0.3em]">
              Security Protocol v4.0.2 // Encrypted Pulse
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
