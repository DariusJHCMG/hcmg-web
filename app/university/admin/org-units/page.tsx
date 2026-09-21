import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Org Units",
  robots: { index: false, follow: false },
};

type OrgUnit = {
  id: string;
  name: string;
  unit_type: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

const UNIT_TYPES = ["division", "department", "branch", "team", "location"];

async function handleCreate(formData: FormData): Promise<void> {
  "use server";
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) return;

  const name      = (formData.get("name") as string)?.trim();
  const unit_type = (formData.get("unit_type") as string)?.trim();
  const parent_id = (formData.get("parent_id") as string) || null;
  const sort_order = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;

  if (!name || !unit_type) return;

  const sb = createServiceClient();
  const { data: created } = await sb
    .from("uni_org_units")
    .insert({ name, unit_type, parent_id, sort_order, created_by: profile.id })
    .select("id")
    .single();

  if (created?.id) {
    await logUniAudit("org_unit_created", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "org_unit",
      entityId: created.id,
      details: { name, unit_type, parent_id },
    });
  }
  redirect("/university/admin/org-units");
}

async function handleDeactivate(formData: FormData): Promise<void> {
  "use server";
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) return;

  const id = formData.get("id") as string;
  if (!id) return;

  const sb = createServiceClient();
  await sb.from("uni_org_units").update({ is_active: false }).eq("id", id);

  await logUniAudit("org_unit_deactivated", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "org_unit",
    entityId: id,
    details: {},
  });
  redirect("/university/admin/org-units");
}

async function handleRename(formData: FormData): Promise<void> {
  "use server";
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) return;

  const id   = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!id || !name) return;

  const sb = createServiceClient();
  await sb.from("uni_org_units").update({ name }).eq("id", id);
  redirect("/university/admin/org-units");
}

async function handleActivate(formData: FormData): Promise<void> {
  "use server";
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) return;

  const id = formData.get("id") as string;
  if (!id) return;

  const sb = createServiceClient();
  await sb.from("uni_org_units").update({ is_active: true }).eq("id", id);
  redirect("/university/admin/org-units");
}

function buildTree(units: OrgUnit[]): Map<string | null, OrgUnit[]> {
  const map = new Map<string | null, OrgUnit[]>();
  for (const u of units) {
    const key = u.parent_id ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(u);
  }
  return map;
}

function UnitTree({
  parentId,
  tree,
  depth,
}: {
  parentId: string | null;
  tree: Map<string | null, OrgUnit[]>;
  depth: number;
}) {
  const children = tree.get(parentId) ?? [];
  if (children.length === 0) return null;

  return (
    <>
      {children.map(u => (
        <div key={u.id}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px",
            paddingLeft: `${14 + depth * 24}px`,
            borderBottom: "1px solid #dfe4e8",
            background: u.is_active ? (depth % 2 === 0 ? "#fff" : "#f7f8fa") : "rgba(255,0,0,0.03)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {depth > 0 && (
                <span style={{ color: "#dfe4e8", fontSize: 16 }}>└</span>
              )}
              <div>
                <span style={{ fontWeight: 600, color: u.is_active ? "#071a2e" : "#687383", fontSize: 13 }}>
                  {u.name}
                </span>
                <span style={{
                  marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                  textTransform: "uppercase" as const, letterSpacing: "0.5px",
                  background: "rgba(245,130,32,0.1)", color: "#f58220",
                }}>
                  {u.unit_type}
                </span>
                {!u.is_active && (
                  <span style={{ marginLeft: 6, fontSize: 10, color: "#687383" }}>(inactive)</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Rename inline form */}
              <form action={handleRename} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input type="hidden" name="id" value={u.id} />
                <input
                  name="name"
                  defaultValue={u.name}
                  required
                  style={{
                    fontSize: 12, padding: "3px 8px", borderRadius: 5,
                    border: "1px solid #dfe4e8", fontFamily: "inherit",
                    color: "#071a2e", width: 140,
                  }}
                />
                <button type="submit" style={{ fontSize: 11, fontWeight: 700, color: "#f58220", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "0 4px" }}>
                  Rename
                </button>
              </form>
              {u.is_active ? (
                <form action={handleDeactivate}>
                  <input type="hidden" name="id" value={u.id} />
                  <button
                    type="submit"
                    style={{ fontSize: 12, color: "#687383", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Deactivate
                  </button>
                </form>
              ) : (
                <form action={handleActivate}>
                  <input type="hidden" name="id" value={u.id} />
                  <button
                    type="submit"
                    style={{ fontSize: 12, color: "#34d399", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Reactivate
                  </button>
                </form>
              )}
            </div>
          </div>
          {/* Recursively render children */}
          <UnitTree parentId={u.id} tree={tree} depth={depth + 1} />
        </div>
      ))}
    </>
  );
}

export default async function OrgUnitsPage() {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/org-units");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sb = createServiceClient();
  const { data: units } = await sb
    .from("uni_org_units")
    .select("id, name, unit_type, parent_id, sort_order, is_active, created_at")
    .order("unit_type")
    .order("sort_order")
    .order("name");

  const allUnits = (units ?? []) as OrgUnit[];
  const activeUnits = allUnits.filter(u => u.is_active);
  const tree = buildTree(allUnits);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>
          ← Admin
        </Link>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 8 }}>
          Organization Structure
        </p>
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
          Org Units
        </h1>
        <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 4 }}>
          Define your organizational hierarchy: divisions, departments, branches, and teams.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>

        {/* Create form */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope" }}>
            Add New Org Unit
          </h2>
          <form
            action={handleCreate}
            style={{
              background: "#f7f8fa", border: "1px solid #dfe4e8",
              borderRadius: 12, padding: 24,
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
            }}
          >
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
                Name <span style={{ color: "#f58220" }}>*</span>
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Sales Division"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" as const }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
                Type <span style={{ color: "#f58220" }}>*</span>
              </label>
              <select
                name="unit_type"
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, fontFamily: "inherit", background: "#fff" }}
              >
                {UNIT_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
                Parent unit (optional)
              </label>
              <select
                name="parent_id"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, fontFamily: "inherit", background: "#fff" }}
              >
                <option value="">— Top level —</option>
                {activeUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.unit_type}: {u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
                Sort order
              </label>
              <input
                name="sort_order"
                type="number"
                defaultValue={0}
                min={0}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" as const }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button
                type="submit"
                style={{
                  padding: "10px 24px", borderRadius: 9,
                  background: "linear-gradient(135deg,#FF9847,#F37021)",
                  color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Add Org Unit
              </button>
            </div>
          </form>
        </section>

        {/* Tree */}
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope" }}>
            Organization Hierarchy ({allUnits.length} units)
          </h2>
          {allUnits.length > 0 ? (
            <div style={{ border: "1px solid #dfe4e8", borderRadius: 10, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr auto",
                padding: "8px 14px", background: "#071a2e",
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#687383",
              }}>
                <span>Unit</span>
                <span>Actions</span>
              </div>
              <UnitTree parentId={null} tree={tree} depth={0} />
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#687383", background: "#f7f8fa", borderRadius: 12, border: "1px solid #dfe4e8" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏢</div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No org units yet</p>
              <p style={{ fontSize: 13 }}>Add divisions, departments, branches, and teams above to structure your organization.</p>
            </div>
          )}
        </section>

        <p style={{ marginTop: 24, fontSize: 12, color: "#687383" }}>
          Org units are used to assign learners to departments and filter compliance reports by division or team.
          Deactivated units are hidden from dropdowns but preserved for historical records.
        </p>
      </div>
    </div>
  );
}
