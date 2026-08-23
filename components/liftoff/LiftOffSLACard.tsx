"use client";

/**
 * Lift Off — SLA Promise Card
 *
 * Displays the ops team's turnaround commitments for every request type.
 * All times are measured during Lock Desk business hours (Mon–Sun, 10 AM–7 AM ET).
 */

const SLA_ITEMS = [
  {
    icon:    "🔒",
    label:   "Lock Desk Request",
    sla:     "60 minutes",
    detail:  "From submission to lock confirmation in lender portal",
    color:   "text-green-700",
    bg:      "bg-green-50",
    border:  "border-green-200",
    dot:     "bg-green-500",
  },
  {
    icon:    "📋",
    label:   "Register + Disclosure",
    sla:     "60 minutes",
    detail:  "From submission to registered in ARIVE + disclosures sent",
    color:   "text-green-700",
    bg:      "bg-green-50",
    border:  "border-green-200",
    dot:     "bg-green-500",
  },
  {
    icon:    "📄",
    label:   "Disclosure Only",
    sla:     "60 minutes",
    detail:  "From submission to disclosures sent",
    color:   "text-green-700",
    bg:      "bg-green-50",
    border:  "border-green-200",
    dot:     "bg-green-500",
  },
  {
    icon:    "🚀",
    label:   "Submission",
    sla:     "24–48 hours",
    detail:  "Full intake — register, disclose, pre-UW, processor assigned",
    color:   "text-blue-700",
    bg:      "bg-blue-50",
    border:  "border-blue-200",
    dot:     "bg-blue-500",
  },
  {
    icon:    "🛎",
    label:   "Loan Help Desk",
    sla:     "4 hours",
    detail:  "Ops guidance on suspense conditions, income, AUS, exceptions, and other active file questions",
    color:   "text-purple-700",
    bg:      "bg-purple-50",
    border:  "border-purple-200",
    dot:     "bg-purple-500",
  },
];

export function LiftOffSLACard() {
  return (
    <div className="rounded-2xl border border-line bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-line px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Our Promise</p>
          <h2 className="mt-0.5 text-sm font-extrabold text-ink">Lift Off Turnaround SLAs</h2>
        </div>
        <span className="rounded-full border border-line bg-sand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted/60">
          Business Hours
        </span>
      </div>

      {/* SLA rows */}
      <div className="divide-y divide-line">
        {SLA_ITEMS.map(item => (
          <div key={item.label} className="flex items-center gap-4 px-6 py-4">
            {/* Icon */}
            <span className="text-xl flex-shrink-0 w-7 text-center">{item.icon}</span>

            {/* Request type + detail */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink">{item.label}</p>
              <p className="text-[11px] text-muted/60 mt-0.5 leading-relaxed">{item.detail}</p>
            </div>

            {/* SLA pill */}
            <span className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border ${item.bg} ${item.border} ${item.color}`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
              {item.sla}
            </span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="border-t border-line bg-sand px-6 py-3">
        <p className="text-[11px] text-muted/60 leading-relaxed">
          Lock Desk SLAs measured Mon–Sat, 10:00 AM–7:00 PM ET only.
          All other SLAs measured in elapsed business-day time, Mon–Sat, any hour. Sundays excluded.
        </p>
      </div>
    </div>
  );
}
