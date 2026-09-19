/**
 * Shared compliance calculation helpers used by:
 *   - /university/admin/compliance
 *   - /university/hr
 *   - /university/manager
 *   - cron/compliance
 *
 * One authoritative definition for all compliance rules.
 */

export interface ComplianceProgressRow {
  profile_id: string;
  course_id: string;
  completed: boolean;
}

export interface ComplianceEnrollmentRow {
  profile_id: string;
  course_id: string;
  due_date: string | null;
}

export interface ComplianceCertRow {
  profile_id: string;
  course_id: string;
  revoked_at: string | null;
  expires_at: string | null;
}

export interface ComplianceExemptionRow {
  profile_id: string;
  course_id: string;
  revoked_at: string | null;
  expires_at: string | null;
}

export interface RequiredCourse {
  id: string;
  title: string;
}

/**
 * Build a progress lookup map keyed by "profile_id:course_id".
 * Value is { completed: number of completed lessons, total: total lessons with progress rows }
 */
export function buildProgressMap(
  progress: ComplianceProgressRow[]
): Map<string, { completed: number; total: number }> {
  const map = new Map<string, { completed: number; total: number }>();
  for (const p of progress) {
    const k = `${p.profile_id}:${p.course_id}`;
    const cur = map.get(k) ?? { completed: 0, total: 0 };
    cur.total++;
    if (p.completed) cur.completed++;
    map.set(k, cur);
  }
  return map;
}

/**
 * Build a cert map keyed by "profile_id:course_id".
 * Value is the expires_at string (or null if never expires).
 * Only includes non-revoked, non-expired certificates.
 */
export function buildActiveCertSet(
  certs: ComplianceCertRow[],
  now = new Date()
): Set<string> {
  const set = new Set<string>();
  for (const c of certs) {
    if (c.revoked_at) continue;
    if (c.expires_at && new Date(c.expires_at) < now) continue;
    set.add(`${c.profile_id}:${c.course_id}`);
  }
  return set;
}

/**
 * Build an exemption set keyed by "profile_id:course_id".
 * Only includes non-revoked, non-expired exemptions.
 */
export function buildExemptionSet(
  exemptions: ComplianceExemptionRow[],
  now = new Date()
): Set<string> {
  const set = new Set<string>();
  for (const e of exemptions) {
    if (e.revoked_at) continue;
    if (e.expires_at && new Date(e.expires_at) < now) continue;
    set.add(`${e.profile_id}:${e.course_id}`);
  }
  return set;
}

/**
 * Returns true if the employee has completed (or is exempted from) all required courses.
 * An employee with zero required courses assigned is counted as compliant.
 */
export function isCompliant(opts: {
  profileId: string;
  requiredCourses: RequiredCourse[];
  progressMap: Map<string, { completed: number; total: number }>;
  exemptionSet: Set<string>;
}): boolean {
  const { profileId, requiredCourses, progressMap, exemptionSet } = opts;
  if (requiredCourses.length === 0) return true;
  for (const req of requiredCourses) {
    const key = `${profileId}:${req.id}`;
    if (exemptionSet.has(key)) continue; // exempted — counts as compliant
    const prog = progressMap.get(key);
    if (!prog || prog.total === 0 || prog.completed < prog.total) return false;
  }
  return true;
}

/**
 * For a single employee + course, determine the overdue state.
 */
export function isOverdue(opts: {
  profileId: string;
  courseId: string;
  enrollment: ComplianceEnrollmentRow | undefined;
  progressMap: Map<string, { completed: number; total: number }>;
  exemptionSet: Set<string>;
  now?: Date;
}): boolean {
  const { profileId, courseId, enrollment, progressMap, exemptionSet, now = new Date() } = opts;
  if (!enrollment?.due_date) return false;
  if (exemptionSet.has(`${profileId}:${courseId}`)) return false;
  const prog = progressMap.get(`${profileId}:${courseId}`);
  const pct = prog && prog.total > 0 ? prog.completed / prog.total : 0;
  if (pct >= 1) return false;
  return new Date(enrollment.due_date) < now;
}

/**
 * Days until a date (negative means past).
 */
export function daysUntil(dateStr: string, now = new Date()): number {
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
