"use client";

import { useState } from "react";
import Link from "next/link";
import { CourseCard } from "@/components/university/CourseCard";
import type { UniCourse } from "@/lib/database.types";

interface ContinueLesson {
  lesson_id: string;
  course_id: string;
  watch_pct: number;
  lesson_title: string;
  course_title: string;
  lesson_number: number;
  total_lessons: number;
}

interface Props {
  profileName: string;
  courses: UniCourse[];
  enrolledCourseIds: string[];
  progressMap: Record<string, { completed: number; total: number }>;
  completedLessons: number;
  activePaths: number;
  continueLesson: ContinueLesson | null;
}

const FILTERS = [
  { key: "all",        label: "All training" },
  { key: "start",      label: "New LO Fast Start" },
  { key: "sales",      label: "Sales & Conversion" },
  { key: "product",    label: "Products & Guidelines" },
  { key: "operations", label: "Systems & Operations" },
  { key: "compliance", label: "Compliance" },
];

const PATHS = [
  { key: "start",   label: "New LO Fast Start",       meta: "7 lessons · 1.4 hours" },
  { key: "sales",   label: "Producer to Top Producer", meta: "10 lessons · 2.8 hours" },
  { key: "product", label: "Non-QM Specialist",        meta: "8 lessons · 2.1 hours" },
];

export function UniversityDashboardClient({
  profileName,
  courses,
  enrolledCourseIds,
  progressMap,
  completedLessons,
  activePaths,
  continueLesson,
}: Props) {
  const [filter, setFilter]  = useState("start");
  const [search, setSearch]  = useState("");

  const firstName = profileName.split(" ")[0] ?? profileName;

  const filtered = courses.filter(c => {
    const catMatch = filter === "all" || c.category === filter || c.path_tag === filter;
    const q        = search.trim().toLowerCase();
    const textMatch = !q || c.title.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q);
    return catMatch && textMatch;
  });

  const harrysPlaybook = courses.find(c => c.path_tag === "harrys_playbook");

  // Path progress
  function pathPct(key: string) {
    const pathCourses = courses.filter(c => c.category === key || c.path_tag === key);
    if (!pathCourses.length) return 0;
    const enrolledInPath = pathCourses.filter(c => enrolledCourseIds.includes(c.id));
    if (!enrolledInPath.length) return 0;
    const totalLessons = enrolledInPath.reduce((sum, c) => sum + (progressMap[c.id]?.total ?? 0), 0);
    const doneLessons  = enrolledInPath.reduce((sum, c) => sum + (progressMap[c.id]?.completed ?? 0), 0);
    return totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
  }

  return (
    <div style={{ background: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#142234" }}>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: 420,
        background: "radial-gradient(circle at 75% 30%, #173d63 0, transparent 35%), linear-gradient(110deg, #06182a, #0c2b4b)",
        color: "#fff",
        padding: "clamp(40px,6vw,70px) clamp(24px,8vw,80px)",
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: "clamp(30px,6vw,80px)",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Watermark */}
        <div style={{
          position: "absolute", right: "-4%", top: "-15%",
          font: "800 520px/1 Manrope, system-ui, sans-serif",
          color: "rgba(255,255,255,0.018)",
          pointerEvents: "none", userSelect: "none",
        }}>U</div>

        {/* Copy */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 20, height: 2, background: "#f58220", verticalAlign: "middle" }} />
            Your HCMG advantage
          </p>
          <h1 style={{ fontSize: "clamp(38px,5vw,62px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 16, fontFamily: "Manrope, system-ui, sans-serif" }}>
            Learn it today.<br />
            <em style={{ fontStyle: "normal", color: "#f58220" }}>Fund it tomorrow.</em>
          </h1>
          <p style={{ fontSize: 15, color: "#b9c5d0", lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>
            Short, practical training built for the way HCMG loan officers actually work—from first conversation to clear to close.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <Link
              href="/university/search"
              style={{
                padding: "13px 26px", borderRadius: 10,
                background: "linear-gradient(135deg,#FF9847,#F37021)",
                color: "#fff", fontWeight: 700, fontSize: 14,
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {continueLesson ? "Continue learning" : "Start learning"} <span>→</span>
            </Link>
            <Link href="/university/search" style={{ fontSize: 14, color: "#b9c5d0", textDecoration: "none", fontWeight: 500 }}>
              Browse all training
            </Link>
          </div>
        </div>

        {/* Continue card */}
        {continueLesson ? (
          <aside style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            overflow: "hidden",
          }}>
            <div style={{
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              height: 140, position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ position: "absolute", bottom: 8, right: 10, fontSize: 11, fontWeight: 700, background: "rgba(0,0,0,0.4)", padding: "2px 7px", borderRadius: 5, color: "#fff" }}>
                HCMG FAST START
              </span>
              <Link href={`/university/lesson/${continueLesson.lesson_id}`} style={{ textDecoration: "none" }}>
                <button style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(0,0,0,0.3)", border: "2px solid rgba(255,255,255,0.6)",
                  color: "#fff", fontSize: 18, cursor: "pointer",
                }}>▶</button>
              </Link>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#687383" }}>CONTINUE WATCHING</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f58220" }}>{continueLesson.watch_pct}%</span>
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{continueLesson.course_title}</h2>
              <p style={{ fontSize: 12, color: "#b9c5d0", marginBottom: 12 }}>
                Lesson {continueLesson.lesson_number} of {continueLesson.total_lessons} · {continueLesson.lesson_title}
              </p>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${continueLesson.watch_pct}%`, background: "#f58220", borderRadius: 2 }} />
              </div>
            </div>
          </aside>
        ) : (
          <aside style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "32px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
            <p style={{ color: "#b9c5d0", fontSize: 14 }}>Welcome, {firstName}!<br />Start your first lesson below.</p>
          </aside>
        )}
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        background: "#071a2e",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[
          { value: completedLessons, label: "Lessons completed" },
          { value: `${Math.round((completedLessons * 12) / 60 * 10) / 10} hrs`, label: "Time invested" },
          { value: activePaths,     label: "Courses enrolled" },
          { value: "🔥 Train. Learn. Close. Win.", label: "The HCMG standard", small: true },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: "20px 24px",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined,
          }}>
            <strong style={{ fontSize: stat.small ? 13 : 28, fontWeight: 800, color: "#fff", display: "block", fontFamily: "Manrope, system-ui, sans-serif" }}>
              {stat.value}
            </strong>
            <span style={{ fontSize: 12, color: "#687383" }}>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* ── HARRY'S PLAYBOOK ─────────────────────────────────────────────────── */}
      {harrysPlaybook && (
        <section style={{
          maxWidth: 1100,
          margin: "60px auto 0",
          padding: "0 clamp(16px,4vw,40px)",
        }}>
          <div style={{
            background: "#071a2e",
            borderRadius: 14,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            boxShadow: "0 18px 55px rgba(7,26,46,.18)",
          }}>
            {/* Art */}
            <Link href={`/university/course/${harrysPlaybook.slug}`} style={{
              position: "relative", minHeight: 480,
              background: "#061525", overflow: "hidden",
              display: "block",
            }}>
              {harrysPlaybook.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={harrysPlaybook.thumbnail_url}
                  alt="Harry's Playbook"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <div style={{ fontSize: 64, opacity: 0.2 }}>📖</div>
                </div>
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, #071a2e)" }} />
              <div style={{
                position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
                width: 60, height: 60, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, color: "#fff",
              }}>▶</div>
            </Link>

            {/* Copy */}
            <div style={{ padding: "clamp(32px,5vw,56px)", color: "#fff" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#687383", marginBottom: 8 }}>
                Signature HCMG curriculum
              </p>
              <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, fontFamily: "Manrope, system-ui, sans-serif", margin: "0 0 14px" }}>
                Harry&apos;s Playbook
              </h2>
              <p style={{ fontSize: 15, color: "#b9c7d3", lineHeight: 1.65, maxWidth: 500, marginBottom: 0 }}>
                The official HCMG success system—turned into short, practical video lessons your team can use in the field.
              </p>

              {/* Formula */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 8, margin: "24px 0",
                padding: "18px 0",
                borderTop: "1px solid #2c4358", borderBottom: "1px solid #2c4358",
              }}>
                {["Mindset","Activity","Skill","Accountability"].map((item, i) => (
                  <>
                    <div key={item} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#f58220", fontFamily: "Manrope, system-ui" }}>0{i + 1}</div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.7px", color: "#fff" }}>{item}</div>
                    </div>
                    {i < 3 && <span key={`plus-${i}`} style={{ color: "#f58220", fontSize: 18, fontWeight: 700 }}>+</span>}
                  </>
                ))}
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                {[
                  "Build trust and create urgency",
                  "Overcome objections confidently",
                  "Operate inside the HCMG Success OS",
                  "Own your results and close as one team",
                ].map(item => (
                  <li key={item} style={{ fontSize: 12, color: "#d5dde4", display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <span style={{ color: "#f58220", fontWeight: 800, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Link
                  href={`/university/course/${harrysPlaybook.slug}`}
                  style={{
                    padding: "12px 24px", borderRadius: 10,
                    background: "linear-gradient(135deg,#FF9847,#F37021)",
                    color: "#fff", fontWeight: 700, fontSize: 14,
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
                  }}
                >
                  Start the playbook <span>▶</span>
                </Link>
                <small style={{ color: "#94a5b4", fontSize: 12 }}>7 modules · Train. Learn. Close. Win.</small>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── LIBRARY ──────────────────────────────────────────────────────────── */}
      <section id="library" style={{
        maxWidth: 1100, margin: "60px auto 0",
        padding: "0 clamp(16px,4vw,40px)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#071a2e", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 16, height: 2, background: "#f58220" }} />
              Training library
            </p>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-1.5px", fontFamily: "Manrope, system-ui" }}>
              Build your edge.
            </h2>
          </div>
          <label style={{
            display: "flex", alignItems: "center", gap: 8,
            border: "1.5px solid #dfe4e8", borderRadius: 10,
            padding: "0 14px", background: "#fff", height: 42,
          }}>
            <span style={{ color: "#687383", fontSize: 16 }}>⌕</span>
            <input
              type="search"
              placeholder="Search lessons, products, or skills"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 13, color: "#142234", background: "transparent", minWidth: 220 }}
            />
          </label>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "7px 16px", borderRadius: 20,
                border: filter === f.key ? "1.5px solid #071a2e" : "1.5px solid #dfe4e8",
                background: filter === f.key ? "#071a2e" : "#fff",
                color: filter === f.key ? "#fff" : "#687383",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Course grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}>
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                progress={progressMap[course.id]}
                isEnrolled={enrolledCourseIds.includes(course.id)}
              />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#687383", padding: "48px 0", fontSize: 14 }}>
            No lessons match your search.
          </p>
        )}
      </section>

      {/* ── LEARNING PATHS ───────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(50px,6vw,80px) clamp(24px,8vw,80px)",
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: "clamp(30px,5vw,60px)",
        alignItems: "center",
      }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 16, height: 2, background: "#f58220" }} />
            Guided development
          </p>
          <h2 style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 800, letterSpacing: "-2px", color: "#fff", lineHeight: 1.15, fontFamily: "Manrope, system-ui" }}>
            Don&apos;t just watch.<br />
            <em style={{ fontStyle: "normal", color: "#f58220" }}>Build mastery.</em>
          </h2>
          <p style={{ fontSize: 14, color: "#b9c5d0", lineHeight: 1.7, marginTop: 16, maxWidth: 400 }}>
            Follow a curated sequence of short lessons, field assignments, and knowledge checks built around the role you want to master.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PATHS.map((path, i) => {
            const pct = pathPct(path.key);
            return (
              <button
                key={path.key}
                onClick={() => setFilter(path.key)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr auto auto",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "rgba(245,130,32,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: "#f58220",
                  fontFamily: "Manrope, system-ui",
                }}>0{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{path.label}</div>
                  <div style={{ fontSize: 11, color: "#687383" }}>{path.meta}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f58220", minWidth: 36, textAlign: "right" }}>
                  {pct}%
                </div>
                <div style={{ color: "#687383", fontSize: 16 }}>→</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "#071a2e",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "28px clamp(24px,6vw,80px)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: "#f58220",
            clipPath: "polygon(50% 0,100% 24%,92% 80%,50% 100%,8% 80%,0 24%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "#fff",
          }}>H</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>HCMG <span style={{ color: "#f58220" }}>U</span></span>
        </div>
        <p style={{ fontSize: 12, color: "#687383", textAlign: "center" }}>
          Harris Capital Mortgage Group, LLC · NMLS #1918223<br />
          Internal training resource for authorized HCMG team members.
        </p>
        <a href="https://www.hcmgloans.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#687383", textDecoration: "none" }}>
          hcmgloans.com ↗
        </a>
      </footer>
    </div>
  );
}
