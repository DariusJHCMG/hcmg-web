"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const VOLUME_OPTIONS = [
  { label: "$250,000",   value: 250_000  },
  { label: "$500,000",   value: 500_000  },
  { label: "$750,000",   value: 750_000  },
  { label: "$1,000,000", value: 1_000_000 },
  { label: "$1,250,000", value: 1_250_000 },
  { label: "$1,500,000", value: 1_500_000 },
  { label: "$2,000,000", value: 2_000_000 },
  { label: "$2,500,000", value: 2_500_000 },
  { label: "Custom",     value: 0        },
];

const UNIT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20];

interface CommitFormProps {
  goalMonthId: string;
  monthLabel: string;
  fundedVolumeGoal: number;
  fundedUnitsGoal: number;
  existingCommitment?: {
    funded_volume_commitment: number;
    funded_units_commitment: number;
    app_volume_commitment: number;
    app_units_commitment: number;
    biggest_focus: string | null;
    biggest_challenge: string | null;
    confidence_pct: number | null;
    comments: string | null;
    locked: boolean;
  } | null;
}

export function CommitForm({
  goalMonthId,
  monthLabel,
  fundedVolumeGoal,
  fundedUnitsGoal,
  existingCommitment,
}: CommitFormProps) {
  const router  = useRouter();
  const locked  = existingCommitment?.locked ?? false;

  const [selectedVolumeOption, setSelectedVolumeOption] = useState<number | null>(
    existingCommitment?.funded_volume_commitment
      ? VOLUME_OPTIONS.find((o) => o.value === existingCommitment.funded_volume_commitment)?.value ?? 0
      : null,
  );
  const [customVolume, setCustomVolume]           = useState(
    existingCommitment?.funded_volume_commitment ?? "",
  );
  const [fundedUnits, setFundedUnits]             = useState(existingCommitment?.funded_units_commitment ?? 3);
  const [appVolume, setAppVolume]                 = useState(existingCommitment?.app_volume_commitment ?? "");
  const [appUnits, setAppUnits]                   = useState(existingCommitment?.app_units_commitment ?? 0);
  const [biggestFocus, setBiggestFocus]           = useState(existingCommitment?.biggest_focus ?? "");
  const [biggestChallenge, setBiggestChallenge]   = useState(existingCommitment?.biggest_challenge ?? "");
  const [confidencePct, setConfidencePct]         = useState(existingCommitment?.confidence_pct ?? 80);
  const [comments, setComments]                   = useState(existingCommitment?.comments ?? "");
  const [agreed, setAgreed]                       = useState(false);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState<string | null>(null);

  const resolvedVolume = selectedVolumeOption === 0
    ? Number(customVolume) || 0
    : selectedVolumeOption ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreed) { setError("You must agree to the digital commitment."); return; }
    if (resolvedVolume <= 0) { setError("Please select or enter a funded volume commitment."); return; }
    if (fundedUnits <= 0) { setError("Please select how many loans you're committing to."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/goal-engine/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_month_id:             goalMonthId,
          funded_volume_commitment:  resolvedVolume,
          funded_units_commitment:   fundedUnits,
          app_volume_commitment:     Number(appVolume) || 0,
          app_units_commitment:      appUnits,
          biggest_focus:             biggestFocus   || null,
          biggest_challenge:         biggestChallenge || null,
          confidence_pct:            confidencePct,
          comments:                  comments       || null,
          digital_agreement:         true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit.");
        return;
      }

      router.push("/portal/goal-engine?committed=1");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (locked) {
    return (
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-8 text-center">
        <p className="text-4xl mb-3">🔒</p>
        <h2 className="text-lg font-bold text-green-900 mb-2">Commitment Locked</h2>
        <p className="text-sm text-green-700 mb-4">
          Your {monthLabel} commitment is submitted and locked. Contact an admin if you need to make changes.
        </p>
        <div className="text-left max-w-sm mx-auto space-y-2 mt-4">
          <p className="text-sm"><strong>Volume:</strong> ${existingCommitment!.funded_volume_commitment.toLocaleString()}</p>
          <p className="text-sm"><strong>Units:</strong> {existingCommitment!.funded_units_commitment} loans</p>
          {existingCommitment?.biggest_focus && (
            <p className="text-sm"><strong>Focus:</strong> {existingCommitment.biggest_focus}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Volume Commitment */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-bold text-ink mb-1">Funded Volume Commitment</h2>
        <p className="text-sm text-muted mb-5">How much funded volume are you committing to this month?</p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
          {VOLUME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedVolumeOption(opt.value)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                selectedVolumeOption === opt.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line bg-sand text-ink hover:border-accent/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectedVolumeOption === 0 && (
          <div>
            <label className="block text-xs font-bold text-muted mb-1.5">Custom Amount ($)</label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 875000"
              value={customVolume}
              onChange={(e) => setCustomVolume(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        )}

        {resolvedVolume > 0 && (
          <p className="mt-3 text-xs text-muted">
            Your commitment: <strong className="text-accent">${resolvedVolume.toLocaleString()}</strong>
            {" "}({Math.round((resolvedVolume / fundedVolumeGoal) * 100)}% of company goal)
          </p>
        )}
      </div>

      {/* Unit Commitment */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-bold text-ink mb-1">Funded Units (Loans)</h2>
        <p className="text-sm text-muted mb-5">How many loans are you committing to fund this month?</p>
        <div className="flex flex-wrap gap-2">
          {UNIT_OPTIONS.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setFundedUnits(u)}
              className={`rounded-xl border w-14 py-2.5 text-sm font-bold transition-all ${
                fundedUnits === u
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line bg-sand text-ink hover:border-accent/50"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        {fundedUnits > 0 && (
          <p className="mt-3 text-xs text-muted">
            Committing to <strong>{fundedUnits} loans</strong> ({Math.round((fundedUnits / fundedUnitsGoal) * 100)}% of company goal)
          </p>
        )}
      </div>

      {/* Application Goals (optional) */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-bold text-ink mb-1">Application Commitment <span className="text-muted font-normal text-sm">(optional)</span></h2>
        <p className="text-sm text-muted mb-5">How many applications are you targeting this month?</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted mb-1.5">App Volume ($)</label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 2000000"
              value={appVolume}
              onChange={(e) => setAppVolume(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted mb-1.5">App Units</label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 6"
              value={appUnits || ""}
              onChange={(e) => setAppUnits(Number(e.target.value))}
              className="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      {/* Strategy Questions */}
      <div className="rounded-2xl border border-line bg-white p-6 space-y-6">
        <div>
          <h2 className="font-bold text-ink mb-1">What are you going to do differently this month?</h2>
          <p className="text-sm text-muted mb-3">Share your strategy — this stays visible on your dashboard.</p>
          <textarea
            value={biggestFocus}
            onChange={(e) => setBiggestFocus(e.target.value)}
            rows={3}
            placeholder="e.g. I'll focus on purchase referrals from 3 real estate partners and follow up with all pre-approvals from last month..."
            className="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink resize-none focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <h2 className="font-bold text-ink mb-1">What obstacles could prevent you from reaching this goal?</h2>
          <textarea
            value={biggestChallenge}
            onChange={(e) => setBiggestChallenge(e.target.value)}
            rows={3}
            placeholder="e.g. Rate volatility, limited purchase inventory in my market..."
            className="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink resize-none focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <h2 className="font-bold text-ink mb-3">Confidence Level</h2>
          <div className="flex flex-wrap gap-2">
            {[50, 60, 70, 80, 90, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setConfidencePct(pct)}
                className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                  confidencePct === pct
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line bg-sand text-ink hover:border-accent/50"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted mb-1.5">Additional Comments (optional)</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={2}
            placeholder="Anything else leadership should know..."
            className="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink resize-none focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Digital Commitment */}
      <div className={`rounded-2xl border-2 p-6 transition-all ${agreed ? "border-green-300 bg-green-50" : "border-line bg-white"}`}>
        <label className="flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 accent-green-600"
          />
          <div>
            <p className="font-bold text-ink">I commit to doing everything possible to hit this goal.</p>
            <p className="mt-1 text-sm text-muted">
              By checking this box, I digitally sign my {monthLabel} commitment to Harris Capital Mortgage Group. 
              I understand this commitment will be visible to leadership and will lock upon submission.
            </p>
          </div>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !agreed}
        className="w-full rounded-xl bg-accent py-4 text-base font-extrabold text-white shadow-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting…" : "🥧 Submit My Commitment"}
      </button>
    </form>
  );
}
