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
  { label: "Local Markets", href: "/seo/orlando-fl-fha-loan" },
  { label: "FAQ", href: "/#faq" },
  { label: "About HCMG", href: "/contact" },
];
const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "SMS Policy", href: "/sms-policy" },
  { label: "Licensing", href: "/licensing" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-sand">
      {/* Main grid */}
      <div className="container-shell grid gap-10 py-14 md:grid-cols-4">
        <div>
          <OrangeKeyLogo variant="full-light" size={88} className="mb-4" />
          <p className="mb-4 text-sm leading-6 text-muted">
            Fast path to home-ready. Instant mortgage estimates — no hard credit check, no commitment.
          </p>
          <p className="text-xs text-muted/60">Equal Housing Lender</p>
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
          Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender · 455 E Eisenhower Pkwy, Suite 300,
          Ann Arbor, MI 48108 · 888-441-3930 · Not a commitment to lend. Subject to credit approval. Rates and terms
          subject to change without notice. To verify licensing visit{" "}
          <a
            href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1918223"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            nmlsconsumeraccess.org
          </a>
          .
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
