/** Pages with enough commercial priority and unique local data to invite indexing. */
const PRIORITY_CITIES = new Set(["Las Vegas", "Savannah", "Atlanta", "Houston", "Dallas", "Orlando", "Miami", "Tampa", "Denver", "Virginia Beach", "Baltimore", "Los Angeles", "Jackson"]);
const PRIORITY_LOANS = new Set(["FHA Loan", "VA Loan", "Conventional Loan", "First-Time Buyer"]);

export function isPrioritySeoPage(page: { city: string; loanType: string }) {
  return ["Las Vegas", "Savannah"].includes(page.city) || (PRIORITY_CITIES.has(page.city) && PRIORITY_LOANS.has(page.loanType));
}
