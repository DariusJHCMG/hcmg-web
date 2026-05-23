/* eslint-disable @next/next/no-img-element */
type LogoVariant = "primary-light" | "primary-dark" | "mark" | "on-orange";

interface OrangeKeyLogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}

const SOURCES: Record<LogoVariant, { src: string; ratio: number }> = {
  "primary-light": { src: "/hcmg-logo-on-light.svg", ratio: 800 / 380 },
  "primary-dark": { src: "/hcmg-logo-on-dark.svg", ratio: 800 / 380 },
  "on-orange": { src: "/hcmg-logo-on-dark.svg", ratio: 800 / 380 },
  mark: { src: "/hcmg-favicon.svg", ratio: 1 },
};

export function OrangeKeyLogo({ variant = "primary-light", size = 40, className = "" }: OrangeKeyLogoProps) {
  const { src, ratio } = SOURCES[variant];
  const height = size;
  const width = Math.round(size * ratio);

  return (
    <img
      src={src}
      alt="HCMG — Harris Capital Mortgage Group"
      width={width}
      height={height}
      className={className}
      style={{ display: "block", height, width }}
    />
  );
}
