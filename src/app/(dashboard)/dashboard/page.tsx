"use client";

import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { WalletCapsules } from "@/components/dashboard/WalletCapsules";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useUser } from "@/components/providers/UserProvider";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";

  return (
    <>
      <ProfileCard />

      <WalletCapsules />

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/e-wallet" className="action-pill" style={{ textDecoration: "none" }}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
          <span>Send Money</span>
        </Link>
        <Link href="/e-wallet" className="action-pill" style={{ textDecoration: "none" }}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
          <span>Receive</span>
        </Link>
        <Link href="/crypto" className="action-pill" style={{ textDecoration: "none" }}>
          <svg viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /></svg>
          <span>Swap</span>
        </Link>
        <Link href="/orders" className="action-pill" style={{ textDecoration: "none" }}>
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          <span>Pay Bills</span>
        </Link>
      </div>

      <ActivityFeed limit={6} />

      {/* Welcome Card */}
      <div className="welcome-card">
        <h2>
          Welcome{user?.firstName ? `, ${firstName}` : ""} to <span className="gradient-text">Crymad Cash</span>
        </h2>
        <p>
          Your all-in-one financial command center. Manage wallets, send crypto, track
          transactions, and access banking services — all from a single, beautifully crafted
          dashboard. Built for speed, security, and seamless experience.
        </p>
        <div className="welcome-orbit">
          <div className="orbit-ring" />
          <div className="orbit-dot" />
        </div>
      </div>
    </>
  );
}
