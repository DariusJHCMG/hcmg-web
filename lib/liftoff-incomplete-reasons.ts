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
    "Pricing screenshot is missing — please attach to ARIVE",
    "Pricing screenshot appears stale — rate/price may have changed",
    "Loan is not yet registered in ARIVE",
    "ARIVE loan number not found or not provided",
    "Lender not specified",
    "Loan product not specified (e.g. 30-yr fixed, FHA, VA)",
    "Lock period not specified (e.g. 30, 45, or 60 days)",
    "Requested close date is missing or past",
    "Loan amount does not match ARIVE",
    "Borrower name or SSN mismatch in ARIVE",
    "LO has not confirmed pricing — waiting on LO sign-off",
    "Lock request submitted with float status — please confirm intent to lock",
  ],
};

export function getIncompleteReasons(requestType: LiftOffRequestType): string[] {
  return INCOMPLETE_REASONS[requestType] ?? [];
}
