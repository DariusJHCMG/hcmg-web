const TEXTS = {
  estimate: "Estimates are for informational purposes only and are not a loan approval or commitment to lend. Rates and terms subject to credit approval and change without notice.",
  rate: "Rates shown are estimates only and are not a rate quote or commitment to lend. Actual rates depend on credit profile, loan amount, and property type.",
  full: "Orange Key is a registered trade name of Harris Capital Mortgage Group, LLC dba Orange Key · NMLS# 1918223 · Equal Housing Lender · Not a commitment to lend.",
};

interface DisclosureProps {
  variant?: keyof typeof TEXTS;
  text?: string;
  className?: string;
}

export function Disclosure({ variant = "estimate", text, className = "" }: DisclosureProps) {
  return (
    <p className={`text-xs leading-5 text-muted/70 ${className}`}>
      {text ?? TEXTS[variant]}
    </p>
  );
}
