"use client";

import { useState } from "react";
import { CourseCard } from "@/components/university/CourseCard";
import type { UniCourse } from "@/lib/database.types";

const FILTERS = [
  { key: "all",        label: "All training" },
  { key: "start",      label: "New LO Fast Start" },
  { key: "sales",      label: "Sales & Conversion" },
  { key: "product",    label: "Products & Guidelines" },
  { key: "operations", label: "Systems & Operations" },
  { key: "compliance", label: "Compliance" },
];

interface Props {
  courses: UniCourse[];
  enrolledIds: string[];
  progressMap: Record<string, { completed: number; total: number }>;
}

export function UniversitySearchClient({ courses, enrolledIds, progressMap }: Props) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = courses.filter(c => {
    const catMatch  = filter === "all" || c.category === filter || c.path_tag === filter;
    const q         = search.trim().toLowerCase();
    const textMatch = !q || c.title.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q);
    return catMatch && textMatch;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(32px,5vw,56px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", width: 16, height: 2, background: "#f58220" }} />
          Training library
        </p>
        <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-1.5px", fontFamily: "Manrope, system-ui", marginBottom: 24 }}>
          Build your edge.
        </h1>

        {/* Search */}
        <label style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          borderRadius: 10, padding: "0 16px", height: 48,
          maxWidth: 520,
        }}>
          <span style={{ color: "#687383", fontSize: 18 }}>⌕</span>
          <input
            type="search"
            placeholder="Search lessons, products, or skills"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 14, color: "#fff", flex: 1,
            }}
          />
        </label>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "7px 16px", borderRadius: 20,
                border: filter === f.key ? "1.5px solid #f58220" : "1.5px solid rgba(255,255,255,0.15)",
                background: filter === f.key ? "#f58220" : "transparent",
                color: filter === f.key ? "#fff" : "#b9c5d0",
                fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>
        {filtered.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                progress={progressMap[course.id]}
                isEnrolled={enrolledIds.includes(course.id)}
              />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#687383", padding: "60px 0", fontSize: 14 }}>
            No lessons match your search.
          </p>
        )}
      </div>
    </div>
  );
}
