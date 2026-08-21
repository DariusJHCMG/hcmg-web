"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { appendUtms } from "@/lib/utm";
import { getLoAttribution } from "@/lib/lo-attribution";

interface Props {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * Drop-in link component that appends stored UTM params to the href.
 * Also appends ?lo= from LO attribution when linking to /get-started.
 * Server-renders the bare href, hydrates with UTMs + attribution on the client.
 */
export function UtmLink({ href, className, children, onClick }: Props) {
  const [resolvedHref, setResolvedHref] = useState(href);

  useEffect(() => {
    let resolved = appendUtms(href);
    // Append attributed LO slug to /get-started links when no ?lo= is already present
    if (resolved.startsWith("/get-started") && !resolved.includes("lo=")) {
      const slug = getLoAttribution();
      if (slug) {
        resolved += (resolved.includes("?") ? "&" : "?") + `lo=${encodeURIComponent(slug)}`;
      }
    }
    setResolvedHref(resolved);
  }, [href]);

  return (
    <Link href={resolvedHref} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
