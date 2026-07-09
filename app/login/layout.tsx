import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Login | Harris Capital Mortgage Group",
  description:
    "Loan officer and staff login for the HCMG portal. Access your leads, funnels, and co-branded materials.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
