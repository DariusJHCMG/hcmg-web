import { readFileSync } from "fs";

const glossary = readFileSync("data/glossary.ts", "utf8");
const team     = readFileSync("data/team.ts", "utf8");
const seoPages = readFileSync("data/seo-pages.ts", "utf8");

const glossaryTerms = [...glossary.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);
const teamSlugs     = [...team.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]);
const cityLines     = seoPages.split("\n").filter(l => /^\s+\["[^"]+",\s*"[A-Z]{2}"\]/.test(l));
const loanTypeList  = ["FHA Loan","VA Loan","Conventional Loan","Refinance","First-Time Buyer","Jumbo Loan","USDA Loan","Down Payment Assistance","HELOC","ARM Loan","Investment Property Loan","Condo Loan"];

console.log(JSON.stringify({
  glossaryTermCount: glossaryTerms.length,
  teamMemberCount: teamSlugs.length,
  citiesInFile: cityLines.length,
  loanTypes: loanTypeList.length,
  totalSeoPages: cityLines.length * loanTypeList.length,
}, null, 2));
