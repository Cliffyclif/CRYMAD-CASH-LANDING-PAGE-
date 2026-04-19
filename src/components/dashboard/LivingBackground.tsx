"use client";

/** The animated blob background. Shared by every dashboard page. */
export function LivingBackground() {
  return (
    <div className="bg-canvas">
      <div className="energy-blob" />
      <div className="energy-blob" />
      <div className="energy-blob" />
      <div className="energy-blob" />
    </div>
  );
}
