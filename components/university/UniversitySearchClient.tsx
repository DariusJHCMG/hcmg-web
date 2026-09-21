"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CourseCard } from "@/components/university/CourseCard";
import type { UniCourse } from "@/lib/database.types";

const FILTERS = [
  { key: "all",             label: "All training" },
  { key: "enrolled",        label: "My courses" },
  { key: "required",        label: "Required" },
  { key: "start",           label: "New LO Fast Start" },
  { key: "harrys_playbook", label: "Harry's Playbook" },
  { key: "sales",           label: "Sales & Conversion" },
  { key: "product",         label: "Products & Guidelines" },
  { key: "operations",      label: "Systems & Operations" },
  { key: "compliance",      label: "Compliance" },
];

const PATH_TO_FILTER: Record<string, string> = {
  harrys_playbook: "harrys_playbook",
  fast_start:      "start",
  required:        "required",
  enrolled:        "enrolled",
};

interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  rank?: number;
}

interface Props {
  courses: UniCourse[];
  enrolledIds: string[];
  progressMap: Record<string, { completed: number; total: number }>;
}

export function UniversitySearchClient({ courses, enrolledIds, progressMap }: Props) {
  // Stable set from prop array — useMemo avoids recreation on every render
  const enrolledSet = React.useMemo(() => new Set(enrolledIds), [enrolledIds]);
  const searchParams  = useSearchParams();
  const pathParam     = searchParams.get("path");
  const initialFilter = pathParam ? (PATH_TO_FILTER[pathParam] ?? "all") : "all";

  const [filter, setFilter]     = useState(initialFilter);
  const [search, setSearch]     = useState("");
  const [ftsIds, setFtsIds]     = useState<Set<string> | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const p = searchParams.get("path");
    setFilter(p ? (PATH_TO_FILTER[p] ?? "all") : "all");
  }, [searchParams]);

  // Call FTS API when user types a query; clear results when query is empty
  const runFts = useCallback((q: string) => {
    if (!q.trim()) {
      setFtsIds(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    fetch(`/api/university/search?q=${encodeURIComponent(q.trim())}&type=course`)
      .then(r => r.json())
      .then((data: { results?: SearchResult[] }) => {
        setFtsIds(new Set((data.results ?? []).map((r: SearchResult) => r.id)));
      })
      .catch(() => setFtsIds(null))
      .finally(() => setSearching(false));
  }, []);

  function handleSearch(q: string) {
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runFts(q), 300);
  }

  // When a search query exists and FTS has returned results, show only those
  // course cards. Otherwise fall back to local category filter.
  const filtered = courses.filter(c => {
    // Special "enrolled" / "required" filters
    if (filter === "enrolled") {
      if (!enrolledSet.has(c.id)) return false;
    } else if (filter === "required") {
      if (!c.is_required) return false;
    } else if (filter !== "all") {
      if (c.category !== filter && c.path_tag !== filter) return false;
    }

    if (search.trim() && ftsIds !== null) {
      return ftsIds.has(c.id);
    }
    return true;
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
          <span style={{ color: searching ? "#f58220" : "#687383", fontSize: 18, transition: "color 0.2s" }}>⌕</span>
          <input
            type="search"
            placeholder="Search lessons, products, or skills"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 14, color: "#fff", flex: 1,
            }}
          />
          {searching && (
            <span style={{ fontSize: 11, color: "#687383", whiteSpace: "nowrap" }}>Searching…</span>
          )}
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
        {/* Show searching placeholder */}
        {searching && (
          <p style={{ textAlign: "center", color: "#687383", padding: "40px 0", fontSize: 14 }}>Searching…</p>
        )}

        {!searching && filtered.length > 0 && (
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
        )}

        {!searching && filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#687383", padding: "60px 0", fontSize: 14 }}>
            {search.trim() ? `No results for "${search}".` : "No courses in this category."}
          </p>
        )}
      </div>
    </div>
  );
}
