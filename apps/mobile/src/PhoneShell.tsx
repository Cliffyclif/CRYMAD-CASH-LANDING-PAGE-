import type { ReactNode } from "react";

interface PhoneShellProps {
  children: ReactNode;
}

/**
 * Pure iPhone 14 Pro chrome — notch, rounded corners, shadow.
 * All status bars, tab bars, headers live inside the stitch HTML content.
 */
export function PhoneShell({ children }: PhoneShellProps) {
  return (
    <div className="phone-shell">
      <div className="phone-notch" />
      <div className="phone-viewport">{children}</div>
    </div>
  );
}
