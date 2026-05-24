"use client";

import { useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nmls: string;
  currentCompany: string;
  statesLicensed: string;
  monthlyVolume: string;
  message: string;
};

const VOLUME_OPTIONS = [
  "Under $1M / month",
  "$1M – $3M / month",
  "$3M – $5M / month",
  "$5M – $10M / month",
  "$10M+ / month",
];

export function RecruitingForm() {
  const [state, setState] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nmls: "",
    currentCompany: "",
    statesLicensed: "",
    monthlyVolume: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function validate(): string | null {
    if (!state.firstName.trim()) return "Please enter your first name.";
    if (!state.lastName.trim()) return "Please enter your last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) return "Please enter a valid email.";
    if (state.phone.replace(/\D/g, "").length < 10) return "Please enter a 10-digit phone number.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    // Frontend-only for now — no backend wired. Replace with a POST to
    // /api/recruiting-lead once the recruiting CRM pipeline is set up.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-card sm:p-12">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white"
          style={{ background: "var(--ok-gradient)" }}
          aria-hidden
        >
          ✓
        </div>
        <h3 className="text-2xl font-extrabold text-ink">
          Thanks{state.firstName ? `, ${state.firstName}` : ""} — we&apos;ll be in touch.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted">
          A member of HCMG&apos;s recruiting team will reach out within one business day to walk through
          pricing, compensation, and what joining HCMG looks like for your business.
        </p>
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-line bg-sand px-4 py-2 text-xs font-semibold text-muted">
          Confirmation reference: HCMG-REC-{Date.now().toString(36).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="First name *"
          value={state.firstName}
          onChange={(v) => set("firstName", v)}
          placeholder="First name"
          autoComplete="given-name"
        />
        <Field
          label="Last name *"
          value={state.lastName}
          onChange={(v) => set("lastName", v)}
          placeholder="Last name"
          autoComplete="family-name"
        />
        <Field
          label="Email *"
          type="email"
          value={state.email}
          onChange={(v) => set("email", v)}
          placeholder="you@email.com"
          autoComplete="email"
        />
        <Field
          label="Phone *"
          type="tel"
          value={state.phone}
          onChange={(v) => set("phone", v)}
          placeholder="(555) 000-0000"
          autoComplete="tel"
        />
        <Field
          label="NMLS ID"
          value={state.nmls}
          onChange={(v) => set("nmls", v)}
          placeholder="e.g. 1234567"
          inputMode="numeric"
        />
        <Field
          label="Current company"
          value={state.currentCompany}
          onChange={(v) => set("currentCompany", v)}
          placeholder="Where you originate today"
          autoComplete="organization"
        />
        <Field
          label="States licensed"
          value={state.statesLicensed}
          onChange={(v) => set("statesLicensed", v)}
          placeholder="e.g. NV, TX, GA"
        />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">Monthly loan volume</label>
          <select
            value={state.monthlyVolume}
            onChange={(e) => set("monthlyVolume", e.target.value)}
            className="h-12 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="">Select range</option>
            {VOLUME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-semibold text-ink">Message</label>
        <textarea
          rows={5}
          value={state.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us about your business — what you're producing today, what's not working, and what you'd want from a new platform."
          className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted/70">
          Your information stays with HCMG&apos;s recruiting team — we never sell or share it.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="primary-button !py-4 !text-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Recruiting Inquiry →"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink placeholder:text-muted/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
      />
    </div>
  );
}
