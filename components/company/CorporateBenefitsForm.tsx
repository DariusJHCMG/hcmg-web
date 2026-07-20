"use client";

import { useState } from "react";
import { submitLead } from "@/lib/lead";

export function CorporateBenefitsForm({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", employees: "", role: "", consent: false });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setStatus("loading");
    const result = await submitLead({
      firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
      smsConsent: form.consent, source: "corporate-benefits", funnelType: "corporate-home-benefits",
      notes: [`Company: ${form.company}`, `Role: ${form.role}`, `Employee count: ${form.employees}`].join("\n"),
    });
    setStatus(result.success ? "success" : "error");
  }

  const input = "h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
  if (status === "success") return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center"><div className="text-2xl text-emerald-700">✓</div><p className="mt-2 font-extrabold text-ink">Thank you. We’ll be in touch.</p><p className="mt-1 text-sm text-muted">Our Corporate Home Benefits team will contact you to discuss your workforce.</p></div>;

  return (
    <form onSubmit={submit} className={compact ? "space-y-3" : "space-y-4"}>
      <div className="grid gap-3 sm:grid-cols-2"><input required className={input} placeholder="First name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/><input required className={input} placeholder="Last name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></div>
      <input required type="email" className={input} placeholder="Work email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
      <input required type="tel" className={input} placeholder="Phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
      <div className="grid gap-3 sm:grid-cols-2"><input required className={input} placeholder="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/><input required className={input} placeholder="Your role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/></div>
      <select required className={input} value={form.employees} onChange={e=>setForm({...form,employees:e.target.value})}><option value="">Company size</option><option>Under 100 employees</option><option>100–499 employees</option><option>500–999 employees</option><option>1,000–4,999 employees</option><option>5,000+ employees</option></select>
      <label className="flex items-start gap-3 text-[11px] leading-5 text-muted"><input required type="checkbox" className="mt-1 accent-accent" checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})}/><span>I agree to be contacted by HCMG by phone, text, or email about the Corporate Home Benefits Program. Message and data rates may apply. Reply STOP to opt out.</span></label>
      {status === "error" && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">We couldn’t submit your request. Please try again or call 888-441-3930.</p>}
      <button disabled={status === "loading" || !form.consent} className="primary-button w-full disabled:opacity-50">{status === "loading" ? "Sending…" : "Request a program consultation →"}</button>
    </form>
  );
}
