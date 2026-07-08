"use client";

import { useState } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { Disclosure } from "@/components/ui/Disclosure";

function ContactInfo() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">HQ</p>
        <p className="text-sm leading-7 text-ink">
          6375 S Pecos Rd, Suite 208<br />
          Las Vegas, NV 89120
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Branch</p>
        <p className="text-sm leading-7 text-ink">
          9801 Westheimer Ave, Suite 300<br />
          Houston, TX 77032
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Phone</p>
        <a href="tel:+18884413930" className="text-sm font-semibold text-ink hover:text-accent transition-colors">
          888-441-3930
        </a>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Fax</p>
        <p className="text-sm text-ink">404-882-4100</p>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Email</p>
        <a href="mailto:info@hcmgloans.com" className="text-sm font-semibold text-ink hover:text-accent transition-colors">
          info@hcmgloans.com
        </a>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Hours</p>
        <p className="text-sm leading-7 text-muted">Mon – Fri, 9am – 6pm ET</p>
      </div>
      <div className="rounded-2xl border border-line bg-sand p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">NMLS# 1918223</p>
        <p className="text-xs leading-6 text-muted">
          Harris Capital Mortgage Group, LLC.<br />
          Equal Housing Lender.
        </p>
      </div>
    </div>
  );
}

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [state, setState] = useState<FormState>("idle");
  const [consent, setConsent] = useState(false);
  const [propertyState, setPropertyState] = useState("");
  const [stateError, setStateError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const LICENSED_STATES = [
    { code: "FL", label: "Florida (FL)" },
    { code: "TX", label: "Texas (TX)" },
    { code: "GA", label: "Georgia (GA)" },
    { code: "NV", label: "Nevada (NV)" },
    { code: "CO", label: "Colorado (CO)" },
    { code: "VA", label: "Virginia (VA)" },
    { code: "DC", label: "Washington DC (DC)" },
    { code: "MD", label: "Maryland (MD)" },
    { code: "CA", label: "California (CA)" },
    { code: "MS", label: "Mississippi (MS)" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyState) {
      setStateError("Select the state for your property.");
      return;
    }
    setStateError("");
    setState("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          smsConsent: consent,
          source: "contact",
          propertyState,
          notes: formData.message,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setState("success");
    } catch {
      setState("error");
    }
  }

  const inputClass =
    "input-base w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition";
  const labelClass = "mb-1.5 block text-xs font-semibold text-ink";

  return (
    <main>
      <NavBar />

      <section className="section-pad">
        <div className="container-shell max-w-5xl">
          <div className="mb-12 text-center">
            <div className="ok-gradient-text mb-3 text-xs font-bold uppercase tracking-[0.2em]">
              Harris Capital Mortgage Group · NMLS# 1918223
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              Get in touch
            </h1>
            <p className="mt-3 text-base text-muted">
              Questions about your mortgage options? We&apos;d love to help.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            {/* Left: Contact info */}
            <div className="rounded-3xl border border-line bg-sand p-8">
              <h2 className="mb-6 text-lg font-bold text-ink">Contact Information</h2>
              <ContactInfo />
            </div>

            {/* Right: Form */}
            <div className="rounded-3xl border border-line bg-white p-8 shadow-card">
              {state === "success" ? (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                  <div
                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl text-white"
                    style={{ background: "var(--ok-gradient)" }}
                  >
                    ✓
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-ink">Message received!</h3>
                  <p className="text-sm leading-7 text-muted">
                    One of our licensed loan officers will reach out within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>First name *</label>
                      <input
                        required
                        type="text"
                        className={inputClass}
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last name *</label>
                      <input
                        required
                        type="text"
                        className={inputClass}
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      required
                      type="email"
                      className={inputClass}
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Phone number *</label>
                    <input
                      required
                      type="tel"
                      className={inputClass}
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Property state *</label>
                    <select
                      required
                      value={propertyState}
                      onChange={(e) => { setPropertyState(e.target.value); setStateError(""); }}
                      className={`${inputClass} ${stateError ? "border-red-300" : ""} ${propertyState === "" ? "text-muted/60" : "text-ink"}`}
                    >
                      <option value="">Select a state…</option>
                      {LICENSED_STATES.map((s) => (
                        <option key={s.code} value={s.code}>{s.label}</option>
                      ))}
                    </select>
                    {stateError && <p className="mt-1 text-xs font-semibold text-red-600">{stateError}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Message</label>
                    <textarea
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell us about your home buying situation or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>

                  {/* TCPA consent */}
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-accent"
                    />
                    <span className="text-xs leading-5 text-muted">
                      I agree to be contacted by Harris Capital Mortgage Group by phone, text, or email about my mortgage inquiry. Message and data rates may apply. Reply STOP to opt out of texts at any time.
                    </span>
                  </label>

                  {state === "error" && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                      Something went wrong. Please try again or call us at 888-441-3930.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={state === "loading" || !consent}
                    className="primary-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state === "loading" ? "Sending…" : "Send message →"}
                  </button>

                  <Disclosure variant="estimate" />
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
