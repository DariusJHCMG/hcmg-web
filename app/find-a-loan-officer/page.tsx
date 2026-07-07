import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { teamMembers } from "@/data/team";
import { FindLOClient } from "./FindLOClient";

export const metadata: Metadata = {
  title: "Find a Loan Officer | Harris Capital Mortgage Group",
  description:
    "Browse HCMG licensed loan officers by state. Get matched with a licensed mortgage professional in your area. NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/find-a-loan-officer" },
};

const LICENSED_STATES = ["FL","TX","GA","NV","CO","VA","DC","MD"];
const PENDING_STATES  = ["OH","MI","AL","OR","NJ","TN","NC","SC","IL","IN","OK","NM","AZ","PA"];

const STATE_NAMES: Record<string,string> = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California",
  CO:"Colorado", CT:"Connecticut", DC:"Washington D.C.", DE:"Delaware",
  FL:"Florida", GA:"Georgia", HI:"Hawaii", ID:"Idaho", IL:"Illinois",
  IN:"Indiana", IA:"Iowa", KS:"Kansas", KY:"Kentucky", LA:"Louisiana",
  ME:"Maine", MD:"Maryland", MA:"Massachusetts", MI:"Michigan", MN:"Minnesota",
  MS:"Mississippi", MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada",
  NH:"New Hampshire", NJ:"New Jersey", NM:"New Mexico", NY:"New York",
  NC:"North Carolina", ND:"North Dakota", OH:"Ohio", OK:"Oklahoma",
  OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina",
  SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont",
  VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming",
};

export default async function FindALoanOfficerPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const initialState = state && [...LICENSED_STATES, ...PENDING_STATES].includes(state)
    ? state : null;

  const members = teamMembers.map((m) => ({
    slug: m.slug, name: m.name, role: m.role, nmls: m.nmls,
    photo: m.photo, shortBio: m.shortBio, offices: m.offices ?? [],
    phone: m.phone ?? null, email: m.email ?? null,
  }));

  return (
    <main>
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 0 }}>
        <div className="container-shell max-w-4xl text-center">
          <SectionEyebrow>Find a Loan Officer</SectionEyebrow>
          <h1 className="mt-3 font-extrabold tracking-tight text-ink"
              style={{ fontSize:"clamp(36px,5vw,56px)", lineHeight:1.05 }}>
            A licensed HCMG expert<br />in your state.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
            Select your state below to find a licensed loan officer near you.
            Every HCMG LO answers their own phone, knows your file, and gets you to the closing table.
          </p>
        </div>
      </section>

      <FindLOClient
        teamMembers={members}
        licensedStates={LICENSED_STATES}
        pendingStates={PENDING_STATES}
        stateNames={STATE_NAMES}
        initialState={initialState}
      />

      <Footer />
    </main>
  );
}
