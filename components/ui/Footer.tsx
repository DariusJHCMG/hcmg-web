import Link from "next/link";
import { OrangeKeyLogo } from "./OrangeKeyLogo";

const COMPANY_LINKS = [
  { label: "Buy a Home", href: "/get-started" },
  { label: "Refinance", href: "/get-started" },
  { label: "Calculator", href: "/#calculator" },
  { label: "Contact", href: "/contact" },
];
const RESOURCE_LINKS = [
  { label: "Meet the Team", href: "/team" },
  { label: "Mortgage Glossary", href: "/glossary" },
  { label: "Careers at HCMG", href: "/careers" },
  { label: "Local Markets", href: "/seo/orlando-fl-fha-loan" },
  { label: "FAQ", href: "/#faq" },
  { label: "About HCMG", href: "/about" },
];
const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Licensing", href: "/licensing" },
  { label: "Legal Disclaimer", href: "/legal-disclaimer" },
];
const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/harriscapitalmortgage" },
  { label: "Instagram", href: "https://www.instagram.com/harriscapitalmortgage" },
  { label: "Twitter", href: "https://twitter.com/harriscapitalmtg" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-sand">
      {/* Main grid */}
      <div className="container-shell grid gap-10 py-14 md:grid-cols-4">
        {/* Brand + contact */}
        <div>
          <OrangeKeyLogo variant="full-light" size={88} className="mb-4" />
          <p className="mb-4 text-sm leading-6 text-muted">
            Fast path to home-ready. Instant mortgage estimates, no hard credit check, no commitment.
          </p>

          <div className="space-y-1 text-sm text-muted">
            <a href="tel:+18884413930" className="block hover:text-accent transition-colors">
              888-441-3930
            </a>
            <a href="mailto:info@harriscapitalmortgage.com" className="block hover:text-accent transition-colors">
              info@harriscapitalmortgage.com
            </a>
            <p>Fax: 404-882-4100</p>
          </div>

          <div className="mt-4 space-y-2 text-xs text-muted/70">
            <p>
              <span className="font-semibold text-muted">HQ:</span> 6375 S Pecos Rd, Suite 208,{" "}
              Las Vegas, NV 89120
            </p>
            <p>
              <span className="font-semibold text-muted">Branch:</span> 9801 Westheimer Ave, Suite 300,{" "}
              Houston, TX 77032
            </p>
          </div>

          {/* Social links */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Follow Us</p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-accent transition-colors underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <FooterColumn title="Company" links={COMPANY_LINKS} />
        <FooterColumn title="Resources" links={RESOURCE_LINKS} />
        <FooterColumn title="Legal" links={LEGAL_LINKS} />
      </div>

      {/* SMS / EHL notice */}
      <div className="border-t border-line">
        <div className="container-shell py-5 text-center text-xs leading-6 text-muted/60">
          By providing your phone number you agree to receive text messages from HCMG regarding your mortgage
          inquiry. Reply STOP to opt out at any time. Message and data rates may apply.
        </div>
      </div>

      {/* Compliance footer */}
      <div className="border-t border-line bg-white">
        <div className="container-shell py-5 text-xs leading-6 text-muted/50">
          <span className="mr-2 text-base" aria-label="Equal Housing Lender">⌂</span>
          Equal Housing Lender ·{" "}
          Harris Capital Mortgage Group, LLC · NMLS# 1918223 ·{" "}
          <a
            href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1918223"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            NMLS Consumer Access
          </a>{" "}
          · Not a commitment to lend. Subject to credit approval. Rates and terms subject to change without notice.
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line bg-white">
        <div className="container-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <p className="text-xs text-muted/50">
            © {new Date().getFullYear()} Harris Capital Mortgage Group, LLC
          </p>
          <div className="flex gap-4 text-xs">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-muted/50 hover:text-accent">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-4 text-sm font-semibold text-ink">{title}</div>
      <div className="space-y-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="block text-sm text-muted transition-colors hover:text-accent">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
