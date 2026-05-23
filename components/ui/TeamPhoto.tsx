/* eslint-disable @next/next/no-img-element */
const PLACEHOLDER_SRC = "/team/placeholder.svg";

function getInitials(name: string): string {
  const cleaned = name
    .replace(/['"()]/g, "")
    .replace(/\s+(Sr\.?|Jr\.?|II|III|IV)$/i, "")
    .trim();
  const words = cleaned.split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
  if (words.length === 0) return "";
  const first = words[0]?.[0] ?? "";
  const last = words[words.length - 1]?.[0] ?? "";
  return (first + (words.length > 1 ? last : "")).toUpperCase();
}

export function TeamPhoto({
  photo,
  name,
  className = "",
  aspect = "1 / 1",
}: {
  photo: string;
  name: string;
  className?: string;
  aspect?: string;
}) {
  const isPlaceholder = photo === PLACEHOLDER_SRC;
  if (isPlaceholder) {
    const initials = getInitials(name);
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-brand ${className}`}
        style={{ aspectRatio: aspect }}
        aria-label={`${name} portrait placeholder`}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(243,112,33,0.55) 0%, transparent 55%)",
          }}
        />
        <span
          className="relative font-extrabold text-white"
          style={{ fontSize: "clamp(48px, 9vw, 110px)", letterSpacing: 1 }}
        >
          {initials}
        </span>
        <span
          aria-hidden
          className="absolute left-3 top-3 h-3 w-3"
          style={{ background: "#F37021" }}
        />
      </div>
    );
  }
  return (
    <img
      src={photo}
      alt={`${name}, portrait`}
      className={`block object-cover ${className}`}
      style={{ aspectRatio: aspect, width: "100%", height: "100%" }}
    />
  );
}
