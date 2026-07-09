import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Harris Capital Mortgage Group",
  description:
    "Get in touch with Harris Capital Mortgage Group. Call 888-441-3930 or send a message. Licensed mortgage lender serving FL, TX, GA, NV, CO, VA, DC, MD, CA & MS. NMLS# 1918223.",
  alternates: { canonical: "https://hcmgloans.com/contact" },
  openGraph: {
    title: "Contact HCMG | Harris Capital Mortgage Group",
    description:
      "Reach a licensed HCMG loan officer by phone, email, or the form below. No hard credit check, no commitment.",
    url: "https://hcmgloans.com/contact",
    images: ["/hcmg-social.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
