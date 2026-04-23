type LogoVariant = "primary-light" | "primary-dark" | "mark" | "on-orange";

interface OrangeKeyLogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}

function KeyMark({ fill, size }: { fill: string | "gradient"; size: number }) {
  const h = size;
  const w = Math.round(size * (60 / 88));
  return (
    <svg width={w} height={h} viewBox="0 0 60 88" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {fill === "gradient" && (
        <defs>
          <linearGradient id="ok-g" x1="4" y1="2" x2="56" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFAF00" />
            <stop offset="42%" stopColor="#FF7800" />
            <stop offset="100%" stopColor="#E84F00" />
          </linearGradient>
        </defs>
      )}
      <path
        fillRule="evenodd"
        fill={fill === "gradient" ? "url(#ok-g)" : fill}
        d="M30 2C14.536 2 2 14.536 2 30s12.536 28 28 28 28-12.536 28-28S45.464 2 30 2zm0 10c9.941 0 18 8.059 18 18s-8.059 18-18 18-18-8.059-18-18 8.059-18 18-18z"
      />
      <rect
        x="24" y="48" width="12" height="38" rx="6"
        fill={fill === "gradient" ? "url(#ok-g)" : fill}
      />
    </svg>
  );
}

export function OrangeKeyLogo({ variant = "primary-light", size = 40, className = "" }: OrangeKeyLogoProps) {
  const wordmarkColor = variant === "primary-dark" || variant === "on-orange" ? "#FFFFFF" : "#1A2B42";
  const showMark = true;
  const showWordmark = variant !== "mark";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Orange Key">
      {showMark && (
        <KeyMark
          fill={variant === "on-orange" ? "#FFFFFF" : "gradient"}
          size={size}
        />
      )}
      {showWordmark && (
        <span
          style={{
            fontWeight: 800,
            fontSize: Math.round(size * 0.45),
            letterSpacing: "0.06em",
            color: wordmarkColor,
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          ORANGE KEY
        </span>
      )}
    </span>
  );
}
