import type { LiftOffRequestType } from "@/lib/database.types";

export const INCOMPLETE_REASONS: Record<LiftOffRequestType, string[]> = {
  register_disclosure: [
    "Missing 1003 Application",
    "Credit report not attached",
    "Purchase agreement missing or expired",
    "HOI binder missing or insufficient",
    "Title order not placed",
    "Borrower information incomplete or mismatched",
    "ARIVE loan number not found",
  ],
  disclosure_only: [
    "Missing 1003 Application",
    "Credit report not attached",
    "HOI binder missing or insufficient",
    "Borrower information incomplete or mismatched",
    "ARIVE loan number not found",
  ],
  submission: [
    "Missing 1003 Application",
    "Credit report not attached",
    "Purchase agreement missing or expired",
    "HOI binder missing or insufficient",
    "Title order not placed",
    "Borrower information incomplete or mismatched",
    "ARIVE loan number not found",
    "W-2s missing or incomplete (need 2 years)",
    "Paystubs missing or outdated (need 30-day)",
    "Tax returns missing (need 2 years)",
    "Bank statements missing or insufficient",
    "Appraisal not yet ordered or missing",
    "IPAC notes incomplete",
    "Loan does not match 1003",
  ],
  loan_help_desk: [
    "Issue description too vague — please provide more detail",
    "ARIVE loan number not found or not provided",
    "Sub-type not selected",
    "Supporting documents missing",
  ],
  lock_request: [
    "Pricing not confirmed in ARIVE",
    "Loan not yet registered",
    "Lock period not specified",
    "Rate / price data missing or stale",
    "Lender or product not specified",
  ],
};

export function getIncompleteReasons(requestType: LiftOffRequestType): string[] {
  return INCOMPLETE_REASONS[requestType] ?? [];
}
