import LiftOffWizard from "@/components/liftoff/LiftOffWizard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Lift Off Request — HCMG" };

export default function NewLiftOffPage() {
  return <LiftOffWizard />;
}
