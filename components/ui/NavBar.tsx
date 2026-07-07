"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OrangeKeyLogo } from "./OrangeKeyLogo";
import { TopBanner } from "./TopBanner";

const NAV_LINKS = [
  { label: "Buy", href: "/#calculator" },
  { label: "Refinance", href: "/get-started" },
  { label: "Our Team", href: "/team" },
  { label: "About", href: "/about" },
  { label: "Glossary", href: "/glossary" },
  { label: "Join HCMG", href: "/careers" },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <div className="sticky top-0 z-50">
    <TopBanner />
    <header
      className="transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.95)",
        borderBottom: scrolled ? "1px solid #E2E8F0" : "1px solid transparent",
        backdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 1px 24px rgba(26,43,66,0.08)" : "none",
      }}
    >
      <div className="container-shell flex h-[96px] items-center justify-between">
        <Link href="/" className="flex-shrink-0" aria-label="HCMG home">
          <OrangeKeyLogo variant="primary-light" size={68} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted transition-colors duration-150 hover:bg-sand hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/contact" className="secondary-button !py-2.5 !px-5 !text-sm">
            Contact
          </Link>
          <Link href="/get-started" className="primary-button !py-2.5 !px-5 !text-sm">
            See what I qualify for
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {menuOpen ? (
              <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-line bg-white px-5 pb-5 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-xl px-4 py-3 text-base font-semibold text-ink transition-colors hover:bg-sand"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/contact" className="secondary-button justify-center" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
            <Link href="/get-started" className="primary-button justify-center" onClick={() => setMenuOpen(false)}>
              See what I qualify for
            </Link>
          </div>
        </div>
      )}
    </header>
    </div>
    </>
  );
}
