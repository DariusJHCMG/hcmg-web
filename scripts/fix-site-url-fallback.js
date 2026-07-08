const fs = require("fs");
const path = require("path");

// Replace hcmgloans.com → hcmg-web.vercel.app ONLY in NEXT_PUBLIC_SITE_URL fallback strings
// Leaves all other hcmgloans.com references (canonical URLs, email froms, etc.) untouched
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walk(full); continue; }
    if (!/\.(ts|tsx|js)$/.test(e.name)) continue;
    const src = fs.readFileSync(full, "utf8");
    // Match: NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app" (single or double quotes)
    const updated = src
      .replace(/NEXT_PUBLIC_SITE_URL\s*\?\?\s*"https:\/\/hcmgloans\.com"/g,
        'NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app"')
      .replace(/NEXT_PUBLIC_SITE_URL\s*\?\?\s*'https:\/\/hcmgloans\.com'/g,
        "NEXT_PUBLIC_SITE_URL ?? 'https://hcmg-web.vercel.app'")
      // Also handle || pattern
      .replace(/NEXT_PUBLIC_SITE_URL\s*\|\|\s*"https:\/\/hcmgloans\.com"/g,
        'NEXT_PUBLIC_SITE_URL || "https://hcmg-web.vercel.app"')
      .replace(/NEXT_PUBLIC_SITE_URL\s*\|\|\s*'https:\/\/hcmgloans\.com'/g,
        "NEXT_PUBLIC_SITE_URL || 'https://hcmg-web.vercel.app'");
    if (updated !== src) {
      fs.writeFileSync(full, updated, "utf8");
      console.log("Fixed:", full.replace(process.cwd() + "\\", ""));
    }
  }
}

walk(".");
console.log("Done");
