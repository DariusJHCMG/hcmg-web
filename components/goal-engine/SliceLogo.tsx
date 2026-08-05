/**
 * SliceLogo — matches the uploaded SLICE brand mark exactly.
 * Orange S-shape with diagonal cut lines, bold dark "SLICE" text
 * with orange accent bar on the "I".
 *
 * Usage:
 *   <SliceLogo size={48} />            — icon only (square)
 *   <SliceLogo size={48} full />       — icon + "SLICE by HCMG" wordmark
 *   <SliceLogo size={48} full light /> — white text version for dark bg
 */

interface Props {
  size?: number;
  full?: boolean;
  light?: boolean;
  className?: string;
}

export function SliceLogo({ size = 48, full = false, light = false, className }: Props) {
  const textColor = light ? "#ffffff" : "#1A2B42";
  const subColor  = light ? "rgba(255,255,255,0.45)" : "#64748B";

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Main S-shape body ── */}
      {/* Top arc of S */}
      <path
        d="M62 14 C80 14 88 24 88 34 C88 44 80 51 65 51 L44 51 C36 51 30 55 30 62 C30 69 36 73 44 73 L78 73"
        stroke="#F37021"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Bottom arc of S */}
      <path
        d="M38 86 C20 86 12 76 12 66 C12 56 20 49 35 49 L56 49 C64 49 70 45 70 38 C70 31 64 27 56 27 L22 27"
        stroke="#F37021"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* ── Diagonal slash cuts ── */}
      {/* Top-right slash */}
      <line x1="68" y1="8"  x2="90" y2="8"  stroke="#F37021" strokeWidth="7" strokeLinecap="round" />
      <line x1="63" y1="18" x2="85" y2="18" stroke="#F37021" strokeWidth="5" strokeLinecap="round" />
      {/* Bottom-left slash */}
      <line x1="10" y1="82" x2="32" y2="82" stroke="#F37021" strokeWidth="7" strokeLinecap="round" />
      <line x1="15" y1="92" x2="37" y2="92" stroke="#F37021" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );

  if (!full) return <span className={className}>{icon}</span>;

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {icon}
      <div>
        {/* SLICE wordmark — S L I C E with orange bar on I */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 0, lineHeight: 1 }}>
          <span style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: size * 0.45,
            fontWeight: 900,
            color: textColor,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            SL
          </span>
          {/* I with orange accent underbar */}
          <span style={{ position: "relative", display: "inline-block" }}>
            <span style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: size * 0.45,
              fontWeight: 900,
              color: textColor,
              letterSpacing: "0.08em",
            }}>I</span>
            <span style={{
              position: "absolute",
              bottom: -2,
              left: 0,
              right: 0,
              height: 3,
              background: "#F37021",
              borderRadius: 2,
            }} />
          </span>
          <span style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: size * 0.45,
            fontWeight: 900,
            color: textColor,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            CE
          </span>
        </div>
        {/* Sub-label */}
        <div style={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: size * 0.14,
          fontWeight: 700,
          color: subColor,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginTop: 2,
        }}>
          by HCMG
        </div>
      </div>
    </div>
  );
}
