import Link from "next/link";
import type { UniCourse, UniProgress } from "@/lib/database.types";

const PILL_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  orange: { bg: "rgba(245,130,32,0.15)", color: "#f58220",  label: "NEW LO FAST START" },
  blue:   { bg: "rgba(59,130,246,0.15)", color: "#60a5fa",  label: "SYSTEMS & OPERATIONS" },
  gold:   { bg: "rgba(163,108,9,0.2)",   color: "#d4a017",  label: "PRODUCTS & GUIDELINES" },
  green:  { bg: "rgba(17,133,104,0.15)", color: "#34d399",  label: "SALES & CONVERSION" },
  red:    { bg: "rgba(178,59,59,0.15)",  color: "#f87171",  label: "COMPLIANCE" },
  gray:   { bg: "rgba(255,255,255,0.08)", color: "#b9c5d0", label: "GENERAL" },
};

interface Props {
  course: UniCourse;
  progress?: { completed: number; total: number };
  isEnrolled?: boolean;
}

export function CourseCard({ course, progress, isEnrolled }: Props) {
  const pill   = PILL_COLORS[course.pill_color ?? "gray"] ?? PILL_COLORS.gray;
  const pct    = progress && progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;
  const status = !isEnrolled ? "Enroll" : pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue";

  return (
    <Link href={`/university/course/${course.slug}`} style={{ textDecoration: "none" }}>
      <article style={{
        background: "#0d2a48",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 55px rgba(7,26,46,.35)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
      >
        {/* Thumbnail */}
        <div style={{
          background: "linear-gradient(135deg, #0d2a48, #071a2e)",
          height: 140, position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail_url} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ fontSize: 40, opacity: 0.3 }}>▶</div>
          )}
          {course.duration_label && (
            <span style={{
              position: "absolute", bottom: 8, right: 10,
              fontSize: 11, fontWeight: 700, color: "#fff",
              background: "rgba(0,0,0,0.55)", padding: "2px 7px", borderRadius: 5,
            }}>
              {course.duration_label}
            </span>
          )}
          {course.is_required && (
            <span style={{
              position: "absolute", top: 8, left: 10,
              fontSize: 10, fontWeight: 700, color: "#fff",
              background: "#b23b3b", padding: "2px 8px", borderRadius: 5,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Required
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.8px",
            textTransform: "uppercase",
            background: pill.bg, color: pill.color,
            padding: "3px 8px", borderRadius: 4, alignSelf: "flex-start",
          }}>
            {pill.label}
          </span>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.35 }}>
            {course.title}
          </h3>
          {course.description && (
            <p style={{ fontSize: 12, color: "#b9c5d0", margin: 0, lineHeight: 1.55, flex: 1 }}>
              {course.description}
            </p>
          )}

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: "#687383" }}>{course.duration_label ?? ""}</span>
            {isEnrolled && progress && progress.total > 0 ? (
              pct === 100 ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399" }}>✓ Complete</span>
              ) : (
                <span style={{ fontSize: 11, color: "#f58220", fontWeight: 600 }}>{pct}% done</span>
              )
            ) : (
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#f58220",
                background: "rgba(245,130,32,0.12)", padding: "2px 8px", borderRadius: 4,
              }}>
                {status}
              </span>
            )}
          </div>

          {isEnrolled && progress && progress.total > 0 && pct < 100 && (
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#f58220", borderRadius: 2, transition: "width 0.4s" }} />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
