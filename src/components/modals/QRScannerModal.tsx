"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

export function QRScannerModal({ onScan, onClose }: Props) {
  const containerId = "qr-scanner-region";
  const scannerRef = useRef<unknown>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    let instance: { start: Function; stop: () => Promise<void>; clear: () => Promise<void> } | null = null;

    (async () => {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Ctor = (mod as any).Html5Qrcode as new (id: string) => {
          start: (src: unknown, cfg: unknown, ok: (t: string) => void, fail?: () => void) => Promise<void>;
          stop: () => Promise<void>;
          clear: () => Promise<void>;
        };
        instance = new Ctor(containerId) as unknown as typeof instance;
        scannerRef.current = instance;
        await instance!.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            onScan(decoded);
          },
          () => {},
        );
      } catch (e) {
        setErr((e as Error).message || "Camera unavailable. Grant camera access and try again.");
      }
    })();

    return () => {
      cancelled = true;
      const inst = scannerRef.current as typeof instance;
      if (inst) {
        inst.stop().catch(() => {}).finally(() => inst.clear().catch(() => {}));
      }
    };
  }, [onScan]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
          borderRadius: 20, padding: 20, width: "100%", maxWidth: 360,
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 16 }}>Scan QR Code</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div
          id={containerId}
          style={{
            width: "100%", aspectRatio: "1 / 1", borderRadius: 12, overflow: "hidden",
            background: "#000", border: "1px solid var(--glass-border)",
          }}
        />
        {err ? (
          <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 12 }}>{err}</div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Point your camera at a crypto address QR code
          </div>
        )}
      </div>
    </div>
  );
}
