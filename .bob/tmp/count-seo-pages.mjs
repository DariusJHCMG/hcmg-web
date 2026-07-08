import { readFileSync } from "fs";
const src = readFileSync("data/seo-pages.ts", "utf8");

// Count city entries (lines with ["CityName", "ST"] pattern)
const cityLines = src.split("\n").filter(l => /^\s+\["[^"]+",\s*"[A-Z]{2}"\]/.test(l));
const loanTypeNames = [
  "FHA Loan","VA Loan","Conventional Loan","Refinance","First-Time Buyer",
  "Jumbo Loan","USDA Loan","Down Payment Assistance","HELOC",
  "ARM Loan","Investment Property Loan","Condo Loan",
];
// Count STATE_COPY keys
const stateCopyKeys = [...src.matchAll(/"([A-Z]{2})":/g)].map(m => m[1]);
const uniqueStateKeys = [...new Set(stateCopyKeys)];

// Count FAQ keys
const faqKeys = [...src.matchAll(/^\s+"([^"]+)":\s*\[/gm)].map(m => m[1]).filter(k => !["q","a"].includes(k));

console.log("Cities in list:", cityLines.length);
console.log("Loan types:", loanTypeNames.length);
console.log("Total SEO pages:", cityLines.length * loanTypeNames.length);
console.log("STATE_COPY states:", uniqueStateKeys.join(", "));
console.log("LOAN_TYPE_FAQS entries:", faqKeys.length);
console.log("FAQ keys:", faqKeys.join(", "));
