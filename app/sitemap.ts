import type { MetadataRoute } from "next";
import { seoPages } from "@/data/seo-pages";
import { glossaryTerms } from "@/data/glossary";
import { teamMembers } from "@/data/team";
import { learnArticles } from "@/data/learn";

const BASE = "https://hcmgloans.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const SEO_DATE   = new Date("2026-07-08");
  const TEAM_DATE  = new Date("2026-07-01");
  const GLOSS_DATE = new Date("2026-07-01");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1.0, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator`, changeFrequency: "monthly", priority: 0.95, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/get-started`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/find-a-loan-officer`, changeFrequency: "weekly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/glossary`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/team`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/careers`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/join`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/careers/producing-manager`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/careers/move-your-team`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/careers/corporate`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/privacy`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/terms`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/legal-disclaimer`, changeFrequency: "monthly", priority: 0.4, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/sms-policy`, changeFrequency: "monthly", priority: 0.4, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/licensing`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/learn`, changeFrequency: "weekly", priority: 0.85, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/florida`,     changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/texas`,       changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/georgia`,     changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/nevada`,      changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/colorado`,    changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/virginia`,    changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/maryland`,    changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/california`,  changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/mississippi`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator/dc`,          changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-08") },
  ];

  const seoRoutes: MetadataRoute.Sitemap = seoPages.map((p) => ({
    url: `${BASE}/seo/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: SEO_DATE,
  }));

  const glossaryRoutes: MetadataRoute.Sitemap = glossaryTerms.map((t) => ({
    url: `${BASE}/glossary/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: GLOSS_DATE,
  }));

  const learnRoutes: MetadataRoute.Sitemap = learnArticles.map((a) => ({
    url: `${BASE}/learn/${a.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: new Date(a.publishedAt),
  }));

  const teamRoutes: MetadataRoute.Sitemap = teamMembers.map((m) => ({
    url: `${BASE}/team/${m.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: TEAM_DATE,
  }));

  return [...staticRoutes, ...learnRoutes, ...seoRoutes, ...glossaryRoutes, ...teamRoutes];
}
