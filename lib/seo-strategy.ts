/**
 * Controls which city × loan-type pages are pre-rendered and set to index:true.
 * All other generated pages remain available on-demand but are noindex.
 *
 * Rule: a page is "priority" if it meets either condition below.
 *   A) The city is in PRIORITY_CITIES  AND  the loan type is in PRIORITY_LOANS
 *   B) The city is in an always-index override set (high-volume cities)
 */

/** High-intent loan types — every priority city gets indexed for these */
const PRIORITY_LOANS = new Set([
  "FHA Loan", "VA Loan", "Conventional Loan", "First-Time Buyer",
  "Down Payment Assistance", "Refinance", "USDA Loan",
]);

/** All markets where HCMG is active and worth ranking for */
const PRIORITY_CITIES = new Set([
  // Florida
  "Orlando", "Miami", "Tampa", "Jacksonville", "Fort Lauderdale",
  "St. Petersburg", "Cape Coral", "Tallahassee",
  // Georgia
  "Atlanta", "Savannah", "Augusta", "Columbus",
  // Texas
  "Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "Plano",
  // Nevada
  "Las Vegas", "Henderson", "Reno", "North Las Vegas",
  // Colorado
  "Denver", "Colorado Springs", "Aurora", "Fort Collins",
  // Virginia
  "Virginia Beach", "Richmond", "Norfolk", "Chesapeake", "Alexandria",
  // DC & Maryland
  "Washington", "Baltimore", "Silver Spring", "Rockville", "Gaithersburg",
  // California
  "Los Angeles", "San Diego", "Sacramento", "San Jose", "Long Beach",
  "Anaheim", "Fresno", "Oakland",
  // Mississippi
  "Jackson", "Gulfport", "Hattiesburg",
  // Alabama — all cities indexed from launch
  "Birmingham", "Huntsville", "Mobile", "Montgomery", "Tuscaloosa", "Auburn",
]);

/** Las Vegas ARM page gets its own special treatment */
const ALWAYS_INDEX = new Set(["las-vegas-arm-loan"]);

export function isPrioritySeoPage(page: { city: string; loanType: string; slug: string }) {
  if (ALWAYS_INDEX.has(page.slug)) return true;
  return PRIORITY_CITIES.has(page.city) && PRIORITY_LOANS.has(page.loanType);
}
