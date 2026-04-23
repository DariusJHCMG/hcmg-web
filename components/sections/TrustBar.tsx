const STATES = ["FL", "TX", "GA", "NV", "CO", "VA", "DC", "MD"];

export function TrustBar() {
  return (
    <div className="border-y border-line bg-sand">
      <div className="container-shell flex h-16 flex-wrap items-center justify-center gap-x-6 gap-y-2 overflow-x-auto">
        <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-muted/60">
          Licensed in:
        </span>
        {STATES.map((s, i) => (
          <span key={s} className="flex items-center gap-4 flex-shrink-0">
            <span className="text-sm font-bold text-ink">{s}</span>
            {i < STATES.length - 1 && (
              <span className="h-4 w-px bg-line" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
