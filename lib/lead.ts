export interface LeadPayload {
  firstName: string;
  email: string;
  phone: string;
  smsConsent: boolean;
  smsConsentText: string;
  smsConsentTimestamp: string;
  goal?: string;
  priceRange?: string;
  creditRange?: string;
  incomeRange?: string;
  estimatedBuyingPowerLow?: number;
  estimatedBuyingPowerHigh?: number;
  estimatedMonthlyPayment?: number;
  recommendedLoanType?: string;
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: (data as { error?: string }).error ?? "Submission failed." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
