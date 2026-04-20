import type { ReactNode } from "react";

interface PhoneShellProps {
  children: ReactNode;
}

/**
 * Full-viewport shell. No phone chrome — the app fills the whole screen so
 * it ships cleanly as an APK/IPA via Capacitor/WebView.
 */
export function PhoneShell({ children }: PhoneShellProps) {
  return (
    <div className="phone-shell">
      <div className="phone-viewport">{children}</div>
    </div>
  );
}
