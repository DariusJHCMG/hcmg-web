import { createServiceClient } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";

async function getTeam(): Promise<Profile[]> {
  const sb = createServiceClient();
  const { data } = await sb.from("profiles").select("*").order("full_name");
  return (data ?? []) as Profile[];
}

const ROLE_COLORS: Record<string, string> = {
  admin:        "bg-orange-50 text-orange-700",
  developer:    "bg-blue-50 text-blue-700",
  loan_officer: "bg-purple-50 text-purple-700",
};

export default async function TeamPage() {
  const team = await getTeam();
  const leaders = team.filter((p) => p.role !== "loan_officer");
  const los     = team.filter((p) => p.role === "loan_officer");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Team</h1>
        <p className="mt-1 text-sm text-muted">{team.length} active members</p>
      </div>

      {/* Leadership */}
      <Section title="Leadership & Admin" members={leaders} />

      {/* Loan Officers */}
      <Section title="Loan Officers" members={los} />
    </div>
  );
}

function Section({ title, members }: { title: string; members: Profile[] }) {
  if (members.length === 0) return null;
  return (
    <div>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-muted/70">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <div key={m.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white"
                  style={{ background: "var(--ok-gradient)" }}
                >
                  {m.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-bold text-ink leading-tight">{m.full_name}</p>
                  {m.nmls && (
                    <p className="text-[11px] text-muted/60">NMLS# {m.nmls}</p>
                  )}
                </div>
              </div>
              <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${ROLE_COLORS[m.role] ?? ""}`}>
                {m.role.replace("_", " ")}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted">
              <p>{m.email}</p>
              {m.phone && <p>{m.phone}</p>}
              {m.lo_slug && (
                <p>
                  Funnel:{" "}
                  <a
                    href={`https://hcmg-web.vercel.app/go/${m.lo_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline hover:opacity-80"
                  >
                    /go/{m.lo_slug}
                  </a>
                </p>
              )}
              <p className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {m.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
