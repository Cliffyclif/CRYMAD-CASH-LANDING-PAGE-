interface LogoProps {
  size?: number;
  src?: string;
  glow?: boolean;
  rounded?: boolean;
}

export function Logo({ size = 64, src = "/icon-192.png", glow = true, rounded = true }: LogoProps) {
  return (
    <img
      src={src}
      alt="CRYMAD CA$H"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: rounded ? "24%" : 0,
        boxShadow: glow
          ? "0 0 30px rgba(16, 185, 129, 0.35), 0 0 60px rgba(16, 185, 129, 0.15)"
          : undefined,
        imageRendering: "crisp-edges",
      }}
    />
  );
}
