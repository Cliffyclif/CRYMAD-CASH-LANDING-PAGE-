"use client";

import { useEffect, useState } from "react";

const LOGO_URL =
  "https://res.cloudinary.com/dxvi5d6dr/image/upload/v1766762874/photo_2025-12-24_18.04.43-removebg-preview_ck9wyx.png";

export function WalletCards() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 320, height: 310 }} />;

  return (
    <>
      <div className="cc-wallet">
        {/* Back wall */}
        <div className="cc-wallet-back" />

        {/* ── Card 1 · Platinum (deepest) ── */}
        <div className="cc-card cc-platinum">
          <div className="cc-card-inner">
            {/* Row 1 — brand + tier */}
            <div className="cc-row-top">
              <div className="cc-brand">
                <img src={LOGO_URL} alt="" className="cc-logo" />
                <span>CRYMAD CASH</span>
              </div>
              <span className="cc-tier">PLATINUM</span>
            </div>

            {/* Row 2 — chip + contactless */}
            <div className="cc-chip-row">
              <svg className="cc-chip" viewBox="0 0 50 38">
                <rect x="1" y="1" width="48" height="36" rx="6" fill="#C9A84C" />
                <rect x="1" y="1" width="48" height="36" rx="6" fill="none" stroke="#a88a3a" strokeWidth=".6" />
                <line x1="1" y1="13" x2="49" y2="13" stroke="#a88a3a" strokeWidth=".7" />
                <line x1="1" y1="25" x2="49" y2="25" stroke="#a88a3a" strokeWidth=".7" />
                <line x1="17" y1="1" x2="17" y2="13" stroke="#a88a3a" strokeWidth=".7" />
                <line x1="33" y1="25" x2="33" y2="37" stroke="#a88a3a" strokeWidth=".7" />
                <line x1="25" y1="13" x2="25" y2="25" stroke="#a88a3a" strokeWidth=".5" />
              </svg>
              <svg className="cc-contactless" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 17a7 7 0 0 1 0-10" />
                <path d="M9.5 14.5a3.5 3.5 0 0 1 0-5" />
                <circle cx="3" cy="12" r=".5" fill="currentColor" stroke="none" />
              </svg>
            </div>

            {/* Row 3 — number */}
            <div className="cc-number">
              <span className="cc-dots">•••• •••• •••• </span>
              <span className="cc-last4">8891</span>
              <span className="cc-full-num">4829 7340 1256 8891</span>
            </div>

            {/* Row 4 — holder + expiry + network */}
            <div className="cc-row-bottom">
              <div className="cc-col">
                <span className="cc-lbl">CARD HOLDER</span>
                <span className="cc-val">ALEX MORGAN</span>
              </div>
              <div className="cc-col">
                <span className="cc-lbl">EXPIRES</span>
                <span className="cc-val">12/28</span>
              </div>
              <svg className="cc-mc" viewBox="0 0 48 30">
                <circle cx="17" cy="15" r="11" fill="#EB001B" opacity=".9" />
                <circle cx="31" cy="15" r="11" fill="#F79E1B" opacity=".9" />
                <path d="M24 6.2a11 11 0 0 1 0 17.6 11 11 0 0 1 0-17.6z" fill="#FF5F00" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Card 2 · Virtual (middle) ── */}
        <div className="cc-card cc-virtual">
          <div className="cc-card-inner">
            <div className="cc-row-top">
              <div className="cc-brand">
                <img src={LOGO_URL} alt="" className="cc-logo" />
                <span>CRYMAD CASH</span>
              </div>
              <span className="cc-tier">VIRTUAL</span>
            </div>
            <div className="cc-chip-row">
              <svg className="cc-chip" viewBox="0 0 50 38">
                <rect x="1" y="1" width="48" height="36" rx="6" fill="#C9A84C" />
                <rect x="1" y="1" width="48" height="36" rx="6" fill="none" stroke="#a88a3a" strokeWidth=".6" />
                <line x1="1" y1="13" x2="49" y2="13" stroke="#a88a3a" strokeWidth=".7" />
                <line x1="1" y1="25" x2="49" y2="25" stroke="#a88a3a" strokeWidth=".7" />
                <line x1="17" y1="1" x2="17" y2="13" stroke="#a88a3a" strokeWidth=".7" />
                <line x1="33" y1="25" x2="33" y2="37" stroke="#a88a3a" strokeWidth=".7" />
                <line x1="25" y1="13" x2="25" y2="25" stroke="#a88a3a" strokeWidth=".5" />
              </svg>
              <svg className="cc-contactless" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 17a7 7 0 0 1 0-10" />
                <path d="M9.5 14.5a3.5 3.5 0 0 1 0-5" />
                <circle cx="3" cy="12" r=".5" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="cc-number">
              <span className="cc-dots">•••• •••• •••• </span>
              <span className="cc-last4">4102</span>
              <span className="cc-full-num">5173 2490 8837 4102</span>
            </div>
            <div className="cc-row-bottom">
              <div className="cc-col">
                <span className="cc-lbl">CARD HOLDER</span>
                <span className="cc-val">ALEX MORGAN</span>
              </div>
              <div className="cc-col">
                <span className="cc-lbl">EXPIRES</span>
                <span className="cc-val">06/29</span>
              </div>
              <span className="cc-visa">VISA</span>
            </div>
          </div>
        </div>

        {/* ── Card 3 · Gold (front/top) ── */}
        <div className="cc-card cc-gold">
          <div className="cc-card-inner cc-dark-text">
            <div className="cc-row-top">
              <div className="cc-brand">
                <img src={LOGO_URL} alt="" className="cc-logo" />
                <span>CRYMAD CASH</span>
              </div>
              <span className="cc-tier">GOLD</span>
            </div>
            <div className="cc-chip-row">
              <svg className="cc-chip" viewBox="0 0 50 38">
                <rect x="1" y="1" width="48" height="36" rx="6" fill="#8B7330" />
                <rect x="1" y="1" width="48" height="36" rx="6" fill="none" stroke="#6B5520" strokeWidth=".6" />
                <line x1="1" y1="13" x2="49" y2="13" stroke="#6B5520" strokeWidth=".7" />
                <line x1="1" y1="25" x2="49" y2="25" stroke="#6B5520" strokeWidth=".7" />
                <line x1="17" y1="1" x2="17" y2="13" stroke="#6B5520" strokeWidth=".7" />
                <line x1="33" y1="25" x2="33" y2="37" stroke="#6B5520" strokeWidth=".7" />
                <line x1="25" y1="13" x2="25" y2="25" stroke="#6B5520" strokeWidth=".5" />
              </svg>
              <svg className="cc-contactless" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 17a7 7 0 0 1 0-10" />
                <path d="M9.5 14.5a3.5 3.5 0 0 1 0-5" />
                <circle cx="3" cy="12" r=".5" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="cc-number">
              <span className="cc-dots">•••• •••• •••• </span>
              <span className="cc-last4">6637</span>
              <span className="cc-full-num">6221 4817 9953 6637</span>
            </div>
            <div className="cc-row-bottom">
              <div className="cc-col">
                <span className="cc-lbl">CARD HOLDER</span>
                <span className="cc-val">ALEX MORGAN</span>
              </div>
              <div className="cc-col">
                <span className="cc-lbl">EXPIRES</span>
                <span className="cc-val">09/27</span>
              </div>
              <svg className="cc-mc" viewBox="0 0 48 30">
                <circle cx="17" cy="15" r="11" fill="#EB001B" opacity=".9" />
                <circle cx="31" cy="15" r="11" fill="#F79E1B" opacity=".9" />
                <path d="M24 6.2a11 11 0 0 1 0 17.6 11 11 0 0 1 0-17.6z" fill="#FF5F00" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Pocket (front flap) ── */}
        <div className="cc-pocket">
          <svg viewBox="0 0 320 170" fill="none" preserveAspectRatio="none" className="cc-pocket-svg">
            <path d="M0 28C0 12.536 12.536 0 28 0H292C307.464 0 320 12.536 320 28V130C320 152.091 302.091 170 280 170H40C17.909 170 0 152.091 0 130V28Z" fill="#152815" />
            <path d="M0 28C0 12.536 12.536 0 28 0H292C307.464 0 320 12.536 320 28V36H0V28Z" fill="#1d3d1d" />
          </svg>
          <div className="cc-pocket-info">
            <div className="cc-balance-wrap">
              <span className="cc-bal-hidden">••••••</span>
              <span className="cc-bal-real">$24,850.00</span>
            </div>
            <div className="cc-eye-wrap">
              <svg className="cc-eye cc-eye-closed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#36D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg className="cc-eye cc-eye-open" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#36D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
        </div>

        <p className="cc-hint">Hover to see balance</p>
      </div>

      <style jsx>{`
        /* ─── Wallet shell ─── */
        .cc-wallet {
          position: relative;
          width: 320px;
          height: 310px;
          cursor: pointer;
          perspective: 1000px;
          margin: 0 auto;
          transition: transform .4s ease;
        }
        .cc-wallet:hover { transform: translateY(-6px); }

        .cc-hint {
          position: absolute;
          bottom: -32px;
          left: 0; right: 0;
          text-align: center;
          font-style: italic;
          color: #36D399;
          font-size: 13px;
          font-weight: 600;
          opacity: .65;
        }

        .cc-wallet-back {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 220px;
          background: linear-gradient(180deg, #1a301a 0%, #142814 100%);
          border-radius: 22px 22px 60px 60px;
          z-index: 1;
          box-shadow:
            inset 0 25px 40px rgba(0,0,0,.45),
            inset 0 5px 15px rgba(0,0,0,.5);
        }

        /* ─── Card base ─── */
        .cc-card {
          position: absolute;
          width: 296px;
          height: 170px;
          left: 12px;
          border-radius: 14px;
          color: #fff;
          overflow: hidden;
          box-shadow:
            0 4px 20px rgba(0,0,0,.25),
            inset 0 1px 0 rgba(255,255,255,.15);
          transition: transform .55s cubic-bezier(.34,1.56,.64,1), z-index 0s;
          animation: slideIn .8s cubic-bezier(.2,.8,.2,1) backwards;
        }

        .cc-card-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 16px 20px 14px;
          z-index: 2;
        }

        /* ─── Card variants ─── */
        .cc-platinum {
          background: linear-gradient(135deg, #0c1a10 0%, #0a2412 50%, #101c14 100%);
          bottom: 105px;
          z-index: 5;
          animation-delay: .1s;
        }
        .cc-platinum::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 80% 20%, rgba(54,211,153,.08), transparent 60%);
          z-index: 1;
        }

        .cc-virtual {
          background: linear-gradient(135deg, #0D5C2E 0%, #1B8C3E 50%, #0a6e28 100%);
          bottom: 80px;
          z-index: 10;
          animation-delay: .2s;
        }
        .cc-virtual::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 20% 80%, rgba(255,255,255,.06), transparent 50%);
          z-index: 1;
        }

        .cc-gold {
          background: linear-gradient(135deg, #d4b04e 0%, #e8c95a 40%, #c49a3c 100%);
          bottom: 55px;
          z-index: 15;
          animation-delay: .3s;
        }
        .cc-gold::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 70% 30%, rgba(255,255,255,.2), transparent 50%);
          z-index: 1;
        }

        .cc-dark-text { color: #2a1e08; }
        .cc-dark-text .cc-lbl { color: rgba(42,30,8,.5); }
        .cc-dark-text .cc-contactless { color: rgba(42,30,8,.35); }

        /* ─── Row: brand ─── */
        .cc-row-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .cc-brand {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .cc-logo {
          width: 24px;
          height: 24px;
          object-fit: contain;
          border-radius: 5px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,.3));
        }

        .cc-tier {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2.5px;
          opacity: .45;
        }

        /* ─── Row: chip ─── */
        .cc-chip-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .cc-chip {
          width: 40px;
          height: 30px;
          flex-shrink: 0;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,.2));
        }

        .cc-contactless {
          width: 20px;
          height: 20px;
          color: rgba(255,255,255,.35);
          transform: rotate(90deg);
        }

        /* ─── Card number ─── */
        .cc-number {
          font-family: 'Courier New', monospace;
          font-size: 15px;
          letter-spacing: 2px;
          font-weight: 500;
          margin-bottom: auto;
          display: flex;
          align-items: baseline;
        }

        .cc-full-num { display: none; }

        .cc-card:hover .cc-dots,
        .cc-card:hover .cc-last4 { display: none; }
        .cc-card:hover .cc-full-num { display: inline; }

        /* ─── Row: bottom ─── */
        .cc-row-bottom {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          margin-top: 6px;
        }

        .cc-col { display: flex; flex-direction: column; }

        .cc-lbl {
          font-size: 7px;
          letter-spacing: 1px;
          opacity: .5;
          text-transform: uppercase;
          margin-bottom: 1px;
        }

        .cc-val {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .8px;
        }

        .cc-mc {
          width: 44px;
          height: 28px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .cc-visa {
          margin-left: auto;
          font-size: 18px;
          font-weight: 900;
          font-style: italic;
          letter-spacing: 1.5px;
          opacity: .75;
        }

        /* ─── Pocket ─── */
        .cc-pocket {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 170px;
          z-index: 20;
          filter: drop-shadow(0 12px 30px rgba(15,30,15,.5));
        }

        .cc-pocket-svg { width: 100%; height: 100%; }

        .cc-pocket-info {
          position: absolute;
          top: 50px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          z-index: 25;
        }

        .cc-balance-wrap {
          position: relative;
          height: 28px;
          display: flex;
          align-items: center;
        }

        .cc-bal-hidden {
          color: #3a5c3a;
          font-size: 22px;
          letter-spacing: 5px;
          transition: .3s;
        }

        .cc-bal-real {
          color: #36D399;
          font-size: 20px;
          font-weight: 700;
          position: absolute;
          left: 50%;
          transform: translate(-50%, 8px);
          opacity: 0;
          transition: .3s;
          white-space: nowrap;
        }

        .cc-eye-wrap {
          width: 18px; height: 18px;
          position: relative;
          opacity: .3;
          transition: .3s;
        }

        .cc-eye {
          position: absolute;
          top: 0; left: 0;
          transition: .3s;
        }

        .cc-eye-open {
          opacity: 0;
          transform: scale(.5);
        }

        /* ─── Wallet hover ─── */
        .cc-wallet:hover .cc-platinum {
          transform: translateY(-80px) rotate(-3deg);
        }
        .cc-wallet:hover .cc-virtual {
          transform: translateY(-48px) rotate(2deg);
        }
        .cc-wallet:hover .cc-gold {
          transform: translateY(-12px);
        }

        /* Individual card hover */
        .cc-card:hover { z-index: 100 !important; }

        .cc-wallet:hover .cc-platinum:hover {
          transform: translateY(-65px) scale(1.04) rotate(0);
        }
        .cc-wallet:hover .cc-virtual:hover {
          transform: translateY(-72px) scale(1.04) rotate(0);
        }
        .cc-wallet:hover .cc-gold:hover {
          transform: translateY(-62px) scale(1.04) rotate(0);
        }

        /* Balance reveal */
        .cc-wallet:hover .cc-eye-wrap { opacity: 1; }
        .cc-wallet:hover .cc-bal-hidden { opacity: 0; }
        .cc-wallet:hover .cc-bal-real {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        .cc-wallet:hover .cc-eye-closed {
          opacity: 0;
          transform: scale(.5);
        }
        .cc-wallet:hover .cc-eye-open {
          opacity: 1;
          transform: scale(1);
        }

        @keyframes slideIn {
          0% { transform: translateY(-100px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
