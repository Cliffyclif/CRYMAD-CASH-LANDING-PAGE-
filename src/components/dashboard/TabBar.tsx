"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SubItem { label: string; href: string; }
interface TabItem { label: string; href: string; subs?: SubItem[]; }

const TABS: TabItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "E-Wallet", href: "/e-wallet", subs: [
    { label: "Overview", href: "/e-wallet" },
    { label: "Beneficiaries", href: "/e-wallet/beneficiaries" },
  ]},
  { label: "Crypto", href: "/crypto", subs: [
    { label: "Overview", href: "/crypto" },
    { label: "Deposit", href: "/crypto/deposit" },
    { label: "Withdraw", href: "/crypto/withdraw" },
    { label: "Swap", href: "/crypto/swap" },
    { label: "Buy", href: "/crypto/buy" },
  ]},
  { label: "Cards", href: "/cards", subs: [
    { label: "My Cards", href: "/cards" },
    { label: "Order Card", href: "/cards/order" },
    { label: "Card Setup", href: "/cards/setup" },
    { label: "Fee Schedule", href: "/cards/fees" },
  ]},
  { label: "Orders", href: "/orders" },
  { label: "Transactions", href: "/transactions" },
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "More", href: "#", subs: [
    { label: "Reports", href: "/reports" },
    { label: "Banking", href: "/banking" },
    { label: "Notifications", href: "/notifications" },
    { label: "Help / FAQs", href: "/help" },
    { label: "Ecosystem", href: "/ecosystem" },
    { label: "Payouts", href: "/payouts" },
    { label: "Recurring Payments", href: "/recurring-payments" },
    { label: "Rewards", href: "/rewards" },
    { label: "API Settings", href: "/settings/api" },
  ]},
];

function TabPill({ tab }: { tab: TabItem }) {
  const pathname = usePathname();
  const triggerRef = useRef<HTMLLIElement | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive =
    pathname === tab.href ||
    (tab.href !== "/dashboard" && tab.href !== "#" && pathname.startsWith(tab.href)) ||
    (tab.subs?.some((s) => pathname === s.href || pathname.startsWith(s.href)));

  if (!tab.subs) {
    return (
      <Link href={tab.href} className={`tt-tab ${isActive ? "active" : ""}`}>
        {tab.label}
      </Link>
    );
  }

  const openMenu = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.bottom + 8, left: r.left });
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <li
        ref={triggerRef}
        className="tt-nav-link"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <Link
          href={tab.href === "#" ? "#" : tab.href}
          onClick={(e) => { if (tab.href === "#") e.preventDefault(); }}
          className={`tt-tab ${isActive ? "active" : ""} ${open ? "tt-tab-open" : ""}`}
        >
          {tab.label}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}><polyline points="6 9 12 15 18 9" /></svg>
        </Link>
      </li>
      {open && coords && typeof document !== "undefined" && createPortal(
        <div
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            zIndex: 2147483000,
            minWidth: 208,
          }}
        >
          <ul className="tt-menu">
            {tab.subs.map((sub) => {
              const subActive = pathname === sub.href;
              return (
                <li key={sub.href} className="tt-link">
                  <Link href={sub.href} onClick={() => setOpen(false)} className={subActive ? "tt-active" : ""}>
                    {sub.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body,
      )}
    </>
  );
}

export function TabBar() {
  return (
    <>
      <style>{`
        /* ── Tooltip Dropdown System (adapted from Uiverse.io/Zain-Muhammad) ── */
        .tt-bar {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          padding: 6px;
          margin: 0;
          border-radius: 14px;
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          /* overflow must NOT be "hidden" or "auto" — dropdowns need to escape.
             Use flex-wrap for narrow viewports instead. */
          flex-wrap: wrap;
        }

        .tt-nav-link {
          position: relative;
          list-style: none;
        }
        .tt-nav-link:hover { z-index: 9999; }

        .tt-tab {
          color: var(--text-secondary);
          background: transparent;
          padding: 8px 14px;
          letter-spacing: 0.8px;
          font-size: 11px;
          display: flex;
          align-items: center;
          column-gap: 6px;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid transparent;
          border-radius: 10px;
          transition: 0.3s ease-in-out;
          text-decoration: none;
          font-family: inherit;
          font-weight: 600;
          white-space: nowrap;
        }

        .tt-tab.active {
          background: var(--primary);
          color: var(--bg);
          border-color: var(--primary);
        }

        .tt-tab svg {
          fill: none;
          transition: 0.3s ease-in-out;
          opacity: 0.5;
        }

        .tt-nav-link:hover > .tt-tab {
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.08);
          color: var(--primary);
        }

        .tt-nav-link:hover > .tt-tab.active {
          background: var(--primary);
          color: var(--bg);
        }

        .tt-nav-link:hover > .tt-tab svg {
          transform: rotate(180deg);
          opacity: 1;
        }

        /* ── Dropdown Panel ── */
        .tt-tooltip {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 13rem;
          max-width: 16rem;
          transform: translateY(10px);
          opacity: 0;
          pointer-events: none;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 12px 0 0 0;
          z-index: 9999;
        }

        /* Arrow triangle */
        .tt-tooltip::after {
          content: "";
          width: 14px;
          height: 14px;
          background: var(--primary);
          top: 4px;
          left: 18px;
          position: absolute;
          display: inline-block;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          z-index: 1;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        /* Menu container */
        .tt-menu {
          padding: 6px 0;
          background: var(--bg);
          border: 1px solid var(--primary);
          border-radius: 10px;
          list-style: none;
          margin: 0;
          position: relative;
          box-shadow: 0 16px 48px rgba(0,0,0,0.4);
          overflow: hidden;
        }
        [data-theme="light"] .tt-menu {
          background: #ffffff;
          box-shadow: 0 12px 40px rgba(15,23,42,0.18);
        }

        .tt-link {
          position: relative;
        }

        .tt-link:not(:last-child) {
          border-bottom: 1px solid rgba(var(--primary-rgb), 0.08);
        }

        .tt-link > a {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          column-gap: 10px;
          color: var(--text-secondary);
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 500;
          transition: 0.25s ease;
          text-decoration: none;
          letter-spacing: 0.3px;
        }

        .tt-link > a:hover,
        .tt-link > a.tt-active {
          background: rgba(var(--primary-rgb), 0.08);
          color: var(--primary);
          padding-left: 22px;
        }

        .tt-link > a.tt-active {
          font-weight: 700;
          border-left: 2px solid var(--primary);
        }

        /* ── Show on hover ── */
        .tt-nav-link:hover > .tt-tooltip {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>

      <ul className="tt-bar">
        {TABS.map((tab) => (
          <TabPill key={tab.label} tab={tab} />
        ))}
      </ul>
    </>
  );
}
