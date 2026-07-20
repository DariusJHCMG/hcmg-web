"use client";

import { useEffect, useState } from "react";
import { submitLead } from "@/lib/lead";

export type AgentFunnel = "partnership" | "meeting" | "portal" | "cobrand";
const COPY = {
  partnership: { eyebrow: "Agent partnership", title: "Let’s grow together", intro: "Tell us about your business and the buyers you serve." },
  meeting: { eyebrow: "Schedule a meeting", title: "Find a time that works", intro: "Share your availability and our partnership team will confirm a meeting." },
  portal: { eyebrow: "Realtor Portal", title: "Request portal access", intro: "Request access to loan milestones, resources, and partner tools." },
  cobrand: { eyebrow: "Co-branded buyer page", title: "Get your custom page", intro: "Tell us about your brand and we’ll create a shared buyer-conversion page with your HCMG loan partner." },
};

export function AgentFunnelModal({ funnel, onClose }: { funnel: AgentFunnel; onClose: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", brokerage: "", market: "", details: "", consent: false });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const copy = COPY[funnel];
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); setStatus("loading");
    const result = await submitLead({
      firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
      smsConsent: form.consent, source: "real-estate-agent",
      funnelType: `agent-${funnel === "portal" ? "portal-access" : funnel === "cobrand" ? "cobrand-page" : funnel}`,
      notes: [`Brokerage: ${form.brokerage}`, `Market: ${form.market}`, form.details ? `${funnel === "meeting" ? "Preferred meeting time" : "Details"}: ${form.details}` : ""].filter(Boolean).join("\n"),
    });
    setStatus(result.success ? "success" : "error");
  }

  const input = "h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="agent-funnel-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{copy.eyebrow}</p><h2 id="agent-funnel-title" className="mt-2 text-2xl font-extrabold text-ink">{copy.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{copy.intro}</p></div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-xl text-muted" aria-label="Close">×</button>
        </div>
        {status === "success" ? (
          <div className="py-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</div><h3 className="mt-5 text-xl font-extrabold text-ink">Request received</h3><p className="mt-2 text-sm text-muted">Our agent partnership team will follow up shortly.</p><button type="button" onClick={onClose} className="primary-button mt-6">Done</button></div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2"><input required className={input} placeholder="First name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/><input required className={input} placeholder="Last name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></div>
            <div className="grid gap-4 sm:grid-cols-2"><input required type="email" className={input} placeholder="Work email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required type="tel" className={input} placeholder="Phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
            <div className="grid gap-4 sm:grid-cols-2"><input required className={input} placeholder="Brokerage" value={form.brokerage} onChange={e=>setForm({...form,brokerage:e.target.value})}/><input required className={input} placeholder="Primary market / city" value={form.market} onChange={e=>setForm({...form,market:e.target.value})}/></div>
            <textarea className={`${input} h-24 py-3`} placeholder={funnel === "meeting" ? "Preferred days and times" : funnel === "portal" ? "Team size or portal needs (optional)" : funnel === "cobrand" ? "Website, colors, logo link, or what you want featured (optional)" : "Tell us about your business (optional)"} value={form.details} onChange={e=>setForm({...form,details:e.target.value})}/>
            <label className="flex items-start gap-3 text-xs leading-5 text-muted"><input required type="checkbox" className="mt-1 accent-accent" checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})}/><span>I agree to be contacted by HCMG by phone, text, or email about this request. Message and data rates may apply. Reply STOP to opt out.</span></label>
            {status === "error" && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">We couldn’t submit your request. Please try again or call 888-441-3930.</p>}
            <button disabled={status === "loading" || !form.consent} className="primary-button w-full disabled:opacity-50">{status === "loading" ? "Sending…" : funnel === "meeting" ? "Request my meeting →" : funnel === "portal" ? "Request portal access →" : funnel === "cobrand" ? "Get my co-branded page →" : "Start my partnership →"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export function AgentFunnelButton({ funnel, children, className }: { funnel: AgentFunnel; children: React.ReactNode; className: string }) {
  const [open, setOpen] = useState(false);
  return <><button type="button" className={className} onClick={() => setOpen(true)}>{children}</button>{open && <AgentFunnelModal funnel={funnel} onClose={() => setOpen(false)} />}</>;
}
