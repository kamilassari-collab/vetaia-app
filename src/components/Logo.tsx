// VetaIA logo — from Figma export
// Usage:
//   <Logo />              full wordmark at default size
//   <Logo height={28} />  scale by height
//   <Logo mark />         icon only (geometric mark)
//   <Logo dark />         inverted navy → white (for dark backgrounds)

interface LogoProps {
  height?: number;
  mark?: boolean;
  dark?: boolean;
  className?: string;
}

export function Logo({ height = 36, mark = false, dark = false, className }: LogoProps) {
  const navy = dark ? "white" : "#111D1B";
  const teal = "#0B7A6A";

  if (mark) {
    return (
      <svg
        width={height}
        height={height}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="VetaIA"
      >
        <path d="M 0 30 L 30 0 L 30 30 L 30 60 L 0 60 Z" fill={teal} />
        <path d="M 30 0 L 60 0 L 60 30 L 30 60 L 30 30 Z" fill={navy} />
      </svg>
    );
  }

  // Full wordmark — viewBox tightened to actual content bounds
  const viewW = 265;
  const viewH = 90;
  const width = (height / viewH) * viewW;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`15 15 ${viewW} ${viewH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VetaIA"
    >
      <g transform="translate(15, 24)">
        <path d="M 0 30 L 30 0 L 30 30 L 30 60 L 0 60 Z" fill={teal} />
        <path d="M 30 0 L 60 0 L 60 30 L 30 60 L 30 30 Z" fill={navy} />
      </g>
      <text
        x="100"
        y="72"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="52"
        fontWeight="700"
        fill={navy}
        letterSpacing="-0.5"
      >
        Veta
      </text>
      <text
        x="214"
        y="72"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="52"
        fontWeight="700"
        fill={teal}
        letterSpacing="-0.5"
      >
        IA
      </text>
    </svg>
  );
}
