"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { appendUtms } from "@/lib/utm";

interface Props {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * Drop-in link component that appends stored UTM params to the href.
 * Server-renders the bare href, hydrates with UTMs on the client.
 */
export function UtmLink({ href, className, children, onClick }: Props) {
  const [resolvedHref, setResolvedHref] = useState(href);

  useEffect(() => {
    setResolvedHref(appendUtms(href));
  }, [href]);

  return (
    <Link href={resolvedHref} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
