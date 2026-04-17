interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  tagline?: string;
}

export function Wordmark({ size = "md", tagline }: WordmarkProps) {
  const fontSize = size === "sm" ? 18 : size === "lg" ? 32 : 22;
  return (
    <div>
      <div
        className="gradient-emerald font-sans font-extrabold tracking-tight"
        style={{ fontSize, lineHeight: 1 }}
      >
        CRYMAD CA$H
      </div>
      {tagline && (
        <div className="label-mono mt-1" style={{ fontSize: 9 }}>
          {tagline}
        </div>
      )}
    </div>
  );
}
