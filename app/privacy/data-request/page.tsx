"use client";

import { useState } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

/**
 * /privacy/data-request, Data Subject Request (DSR) Form
 *
 * Allows consumers to exercise their privacy rights:
 *   - Right to Know (access data we hold)
 *   - Right to Correct (fix inaccurate data)
 *   - Right to Delete (CCPA/VCDPA, subject to GLBA retention requirements)
 *
 * LEGAL BASIS:
 *   California CCPA / CPRA (Cal. Civ. Code § 1798.100–.199)
 *   Virginia VCDPA (Va. Code § 59.1-571 et seq.)
 *   Colorado CPA (Colo. Rev. Stat. § 6-1-1301 et seq.)
 *   GLBA Regulation P, 30-day response requirement
 *
 * NOTE ON DELETION REQUESTS:
 *   Mortgage loan records cannot be deleted before their legal retention
 *   period (2 years FHA/VA, 7 years conventional). CCPA expressly exempts
 *   data retained to comply with "a legal obligation" (Cal. Civ. Code
 *   § 1798.105(d)(1)). We disclose this to requesters upfront.
 *
 * RESPONSE SLA:
 *   We respond within 30 days (CCPA) or 45 days (VCDPA).
 *   Requests are routed to privacy@hcmgloans.com for manual review.
 */

type RequestType = "access" | "correct" | "delete";

const REQUEST_LABELS: Record<RequestType, string> = {
  access:  "Right to Know, Send me a copy of my data",
  correct: "Right to Correct, Fix inaccurate information",
  delete:  "Right to Delete, Remove my personal information",
};

const REQUEST_NOTES: Record<RequestType, string> = {
  access:
    "We will send you a summary of the personal information we hold about you, within 30 days.",
  correct:
    "Tell us what information is incorrect and what the correct value should be.",
  delete:
    "We will delete your personal information where permitted by law. Mortgage loan records must be " +
    "retained for 2–7 years under federal law (HUD Handbook 4000.1, GLBA). These records cannot be " +
    "deleted early, but we will delete all other personal information we hold about you.",
};

export default function DataRequestPage() {
  const [requestType, setRequestType] = useState<RequestType>("access");
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]     = useState("");
  const [email,       setEmail]        = useState("");
  const [phone,       setPhone]        = useState("");
  const [details,     setDetails]      = useState("");
  const [submitting,  setSubmitting]   = useState(false);
  const [submitted,   setSubmitted]    = useState(false);
  const [error,       setError]        = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required to verify your identity.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!details.trim()) {
      setError("Please provide details about your request.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/privacy/dsr", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          requestType,
          firstName: firstName.trim(),
          lastName:  lastName.trim(),
          email:     email.trim().toLowerCase(),
          phone:     phone.trim() || null,
          details:   details.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed. Please email privacy@hcmgloans.com directly.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please email privacy@hcmgloans.com directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <NavBar />
      <section className="section-pad">
        <div className="container-shell max-w-2xl">
          <a href="/privacy" className="text-xs font-bold text-muted hover:text-accent">← Privacy Policy</a>

          <h1 className="mt-4 mb-2 text-3xl font-extrabold text-ink">Data Subject Request</h1>
          <p className="mb-8 text-sm text-muted">
            Exercise your privacy rights under CCPA, VCDPA, and other applicable laws.
            We will respond within <strong>30 days</strong>.
          </p>

          {submitted ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center">
              <div className="text-3xl mb-3">✅</div>
              <p className="font-bold text-green-800 text-lg mb-2">Request received</p>
              <p className="text-sm text-green-700">
                We have received your {REQUEST_LABELS[requestType].split(", ")[0]} request.
                You will receive a confirmation email at <strong>{email}</strong> within 24 hours,
                and a full response within <strong>30 days</strong>.
              </p>
              <p className="mt-4 text-xs text-green-700/70">
                Reference: DSR-{Date.now()} · Questions? Email{" "}
                <a href="mailto:privacy@hcmgloans.com" className="underline">privacy@hcmgloans.com</a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request type */}
              <div>
                <p className="mb-3 text-sm font-bold text-ink">What would you like to request?</p>
                <div className="space-y-3">
                  {(["access", "correct", "delete"] as RequestType[]).map(type => (
                    <label
                      key={type}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        requestType === type
                          ? "border-accent bg-accent/5"
                          : "border-line bg-white hover:border-accent/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestType"
                        value={type}
                        checked={requestType === type}
                        onChange={() => setRequestType(type)}
                        className="mt-0.5 accent-accent"
                      />
                      <div>
                        <p className="text-sm font-semibold text-ink">{REQUEST_LABELS[type].split(", ")[0]}</p>
                        <p className="text-xs text-muted mt-0.5">{REQUEST_LABELS[type].split(", ")[1]}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Context note for selected request type */}
                <div className="mt-3 rounded-xl border border-line bg-sand p-4 text-xs leading-6 text-muted">
                  {REQUEST_NOTES[requestType]}
                </div>
              </div>

              {/* Identity verification */}
              <div>
                <p className="mb-3 text-sm font-bold text-ink">Your identity (required for verification)</p>
                <p className="mb-3 text-xs text-muted">
                  To protect your privacy, we verify your identity before processing any data request.
                  We may ask you to confirm additional information by email.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-ink" htmlFor="firstName">First name *</label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-ink" htmlFor="lastName">Last name *</label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-bold text-ink" htmlFor="email">Email address *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                    placeholder="The email you used when applying"
                  />
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-bold text-ink" htmlFor="phone">Phone number (optional, helps verify identity)</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
                    placeholder="(702) 555-0100"
                  />
                </div>
              </div>

              {/* Request details */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink" htmlFor="details">
                  Details of your request *
                </label>
                <p className="mb-2 text-xs text-muted">
                  {requestType === "correct"
                    ? "Describe what information is incorrect and what the correct value should be."
                    : requestType === "delete"
                    ? "Tell us what data you want deleted and any relevant context (e.g., loan application date, property address)."
                    : "Tell us what information you'd like to access (e.g., all data, specific loan application, lead inquiry)."}
                </p>
                <textarea
                  id="details"
                  required
                  rows={5}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none resize-none"
                  placeholder="Describe your request..."
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Submitting…" : "Submit Data Request →"}
              </button>

              {/* Legal note */}
              <p className="text-center text-xs leading-6 text-muted/70">
                By submitting this form, you are making a formal privacy rights request under applicable state law.
                We will verify your identity and respond within 30 days. Mortgage loan records required to be
                retained by federal law cannot be deleted before their legal retention period.
              </p>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
