"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/UserProvider";
import ProfileModal from "@/components/modals/ProfileModal";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "E-Wallet", href: "/e-wallet" },
  { label: "Crypto", href: "/crypto" },
  { label: "Cards", href: "/cards" },
  { label: "Orders", href: "/orders" },
  { label: "Transactions", href: "/transactions" },
  { label: "Reports", href: "/reports" },
];

export function TopNav() {
  const pathname = usePathname();
  const { user, initials } = useUser();
  const [isDark, setIsDark] = useState(true);
  const [unread, setUnread] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("crymad-mode") || "dark";
    setIsDark(saved === "dark");
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function toggleMode() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("crymad-mode", next);
  }

  // Unread notification badge
  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications?unread=1&limit=1", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setUnread(j?.unreadCount ?? 0))
      .catch(() => setUnread(0));
  }, [user]);

  const firstName = user?.firstName || user?.email?.split("@")[0] || "";

  return (
    <nav className="top-nav">
      <Link href="/dashboard" className="nav-logo" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <img src="/icon-192.png" alt="" width={28} height={28} style={{ borderRadius: 8 }} />
        <span>CRYMAD CA$H</span>
      </Link>
      <div className="nav-items">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                ? "active"
                : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="nav-profile">
        <button
          className="mode-toggle"
          onClick={toggleMode}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <Link href="/notifications" className="nav-bell" aria-label="Notifications">
          <svg viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unread > 0 && <div className="nav-bell-badge">{unread > 9 ? "9+" : unread}</div>}
        </Link>

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="nav-profile-name"
          style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}
        >
          {firstName || "\u00A0"}
        </button>
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="nav-avatar"
          style={{ background: "var(--primary)", color: "var(--bg)", border: "none", cursor: "pointer", font: "inherit" }}
          aria-label="Open profile"
        >
          {initials}
        </button>
      </div>
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </nav>
  );
}
