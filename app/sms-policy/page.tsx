import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "SMS Terms, HCMG",
  description: "SMS Terms and Conditions for Harris Capital Mortgage Group, LLC. NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/sms-policy" },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 text-xl font-bold text-ink">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-7 text-muted">{children}</p>;
}

export default function SmsPolicy() {
  return (
    <main>
      <NavBar />
      <section className="section-pad">
        <div className="container-shell max-w-3xl">
          <h1 className="mb-2 text-3xl font-extrabold text-ink">SMS Terms and Conditions</h1>
          <p className="mb-8 text-sm text-muted">Effective date: January 1, 2026 · Last updated: January 1, 2026</p>

          <H2>Program Description</H2>
          <P>
            Harris Capital Mortgage Group, LLC (NMLS# 1918223) sends SMS text messages to users who
            have provided their phone number and consented to receive texts regarding:
          </P>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>Mortgage estimate follow-up and scheduling</li>
            <li>Updates from assigned loan officers</li>
            <li>Product announcements and rate alerts (if opted in)</li>
            <li>General account and application notifications</li>
          </ul>
          <P><strong className="text-ink">Program Name:</strong> HCMG Mortgage Alerts</P>

          <H2>Message Frequency</H2>
          <P>
            Message frequency varies. You may receive up to 4 messages per month unless additional messages are
            required to service an active mortgage inquiry.
          </P>

          <H2>Message and Data Rates</H2>
          <P>
            Message and data rates may apply. Check with your mobile carrier for details on your specific plan.
          </P>

          <H2>How to Opt Out, STOP</H2>
          <P>
            <strong className="text-ink">TO STOP RECEIVING TEXTS:</strong> Reply <strong>STOP</strong> to any
            message. You will receive one final confirmation and no further messages will be sent.
          </P>
          <P>You may also opt out by:</P>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>Emailing sms@getorangekey.com with STOP in the subject line</li>
            <li>Calling 888-441-3930</li>
            <li>Updating your preferences at getorangekey.com</li>
          </ul>

          <H2>How to Get Help</H2>
          <P>
            Reply <strong>HELP</strong> to any message or contact us at:<br />
            Email: sms@getorangekey.com<br />
            Phone: 888-441-3930
          </P>

          <H2>Data Use and Privacy</H2>
          <P>
            Your phone number will never be sold or shared with third parties for their marketing purposes. See our{" "}
            <a href="/privacy" className="text-accent underline">Privacy Policy</a> at getorangekey.com/privacy.
          </P>

          <H2>Supported Carriers</H2>
          <P>
            AT&amp;T, Verizon, T-Mobile, Sprint, US Cellular, Boost Mobile, and other major US carriers. Carrier is not
            liable for delayed or undelivered messages.
          </P>

          <H2>Not for Emergencies</H2>
          <P>
            Do not use SMS to communicate emergencies. Call 911.
          </P>

          <H2>Contact</H2>
          <div className="rounded-2xl border border-line bg-sand p-6 text-sm leading-7 text-muted">
            <strong className="text-ink">Harris Capital Mortgage Group, LLC</strong><br />
            NMLS# 1918223<br />
            HQ: 6375 S Pecos Rd, Suite 208, Las Vegas, NV 89120<br />
            Branch: 9801 Westheimer Ave, Suite 300, Houston, TX 77032<br />
            888-441-3930 · Fax: 404-882-4100<br />
            info@harriscapitalmortgage.com
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
