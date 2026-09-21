"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { UniCourse, UniLesson, UniModule, UniAssessment, UniCourseObjective, UniCertificateConfig, LessonType } from "@/lib/database.types";
import {
  STUDIO_COLORS, STATUS_CONFIG,
  StudioInput, StudioTextarea, StudioSelect, FieldLabel, StudioToggle, StudioButton,
  StatusBadge, SaveIndicator, SaveState, SectionCard, EmptyState, ErrorBanner,
  LessonTypeBadge, LESSON_TYPE_LABELS, AssessmentTypeBadge, StudioTabs, Breadcrumb,
} from "./StudioPrimitives";
import { MediaPicker } from "./MediaLibrary";
import type { UniMediaAsset } from "@/lib/database.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

const CATEGORIES = [
  { value: "general",    label: "General" },
  { value: "start",      label: "New LO Fast Start" },
  { value: "sales",      label: "Sales & Conversion" },
  { value: "product",    label: "Products & Guidelines" },
  { value: "operations", label: "Systems & Operations" },
  { value: "compliance", label: "Compliance" },
];

const DIFFICULTIES = [
  { value: "",              label: "Not set" },
  { value: "beginner",     label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced",     label: "Advanced" },
];

const PILL_COLORS = [
  { value: "orange", label: "Orange", dot: "#f58220" },
  { value: "blue",   label: "Blue",   dot: "#60a5fa" },
  { value: "gold",   label: "Gold",   dot: "#d4a017" },
  { value: "green",  label: "Green",  dot: "#34d399" },
  { value: "red",    label: "Red",    dot: "#f87171" },
  { value: "gray",   label: "Gray",   dot: "#b9c5d0" },
];

// ── Add Content Modal ─────────────────────────────────────────────────────────

const CONTENT_TYPES_LESSONS: { type: LessonType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: "text",
    label: "Text",
    description: "Create text-based content with links and images",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M7 8h10M7 12h10M7 16h6"/>
      </svg>
    ),
  },
  {
    type: "video",
    label: "Video",
    description: "Deliver video content in a variety of formats",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    type: "audio",
    label: "Audio",
    description: "Deliver audio content in a variety of formats",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </svg>
    ),
  },
];

const CONTENT_TYPES_OTHERS: { type: LessonType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: "knowledge_check",
    label: "Quiz",
    description: "Evaluate members with a variety of question types",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h.01M9 12h.01M9 15h.01M13 9h3M13 12h3M13 15h3"/>
      </svg>
    ),
  },
  {
    type: "assignment",
    label: "Assignment",
    description: "Prompt members to complete a project or assignment",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <path d="M8 13h8M8 17h5"/>
      </svg>
    ),
  },
];

function AddContentModal({
  onSelect,
  onClose,
}: {
  onSelect: (type: LessonType) => void;
  onClose: () => void;
}) {
  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(6,24,42,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{
        background: STUDIO_COLORS.white, borderRadius: 16,
        width: "min(680px, 100%)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 28px", borderBottom: `1px solid ${STUDIO_COLORS.border}`,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: STUDIO_COLORS.text, margin: 0 }}>Add Content</h2>
          <button
            type="button" onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: STUDIO_COLORS.textMuted, fontSize: 22, lineHeight: 1,
              display: "flex", alignItems: "center", padding: 4, borderRadius: 6,
            }}
          >×</button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Lessons group */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: STUDIO_COLORS.orange, marginBottom: 12,
            }}>
              Lessons
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {CONTENT_TYPES_LESSONS.map(ct => (
                <button
                  key={ct.type}
                  type="button"
                  onClick={() => onSelect(ct.type)}
                  style={{
                    display: "flex", flexDirection: "column", gap: 10,
                    padding: "18px 16px", borderRadius: 12,
                    border: `1.5px solid ${STUDIO_COLORS.border}`,
                    background: STUDIO_COLORS.white,
                    cursor: "pointer", textAlign: "left",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = STUDIO_COLORS.orange;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px rgba(245,130,32,0.08)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = STUDIO_COLORS.border;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    border: `1.5px solid ${STUDIO_COLORS.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: STUDIO_COLORS.text,
                  }}>
                    {ct.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: STUDIO_COLORS.text, marginBottom: 4 }}>{ct.label}</div>
                    <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, lineHeight: 1.5 }}>{ct.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Others group */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: STUDIO_COLORS.textMuted, marginBottom: 12,
            }}>
              Others
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {CONTENT_TYPES_OTHERS.map(ct => (
                <button
                  key={ct.type}
                  type="button"
                  onClick={() => onSelect(ct.type)}
                  style={{
                    display: "flex", flexDirection: "column", gap: 10,
                    padding: "18px 16px", borderRadius: 12,
                    border: `1.5px solid ${STUDIO_COLORS.border}`,
                    background: STUDIO_COLORS.white,
                    cursor: "pointer", textAlign: "left",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = STUDIO_COLORS.orange;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px rgba(245,130,32,0.08)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = STUDIO_COLORS.border;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    border: `1.5px solid ${STUDIO_COLORS.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: STUDIO_COLORS.text,
                  }}>
                    {ct.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: STUDIO_COLORS.text, marginBottom: 4 }}>{ct.label}</div>
                    <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, lineHeight: 1.5 }}>{ct.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type StudioTab = "overview" | "curriculum" | "assessments" | "settings";

interface ReadinessCheck {
  label: string;
  ok: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
  checks: ReadinessCheck[];
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  course,
  objectives,
  onSaved,
}: {
  course: UniCourse;
  objectives: UniCourseObjective[];
  onSaved: (c: UniCourse, objs: UniCourseObjective[]) => void;
}) {
  const [form, setForm] = useState({
    title:              course.title,
    slug:               course.slug,
    short_description:  course.short_description ?? "",
    description:        course.description ?? "",
    thumbnail_url:      course.thumbnail_url ?? "",
    category:           course.category,
    path_tag:           course.path_tag ?? "",
    difficulty:         course.difficulty ?? "",
    duration_label:     course.duration_label ?? "",
    pill_color:         course.pill_color ?? "gray",
    is_required:        course.is_required,
    audience:           course.audience ?? "",
    instructor_name:    course.instructor_name ?? "",
  });
  const [objs, setObjs] = useState<UniCourseObjective[]>(objectives);
  const [newObj, setNewObj] = useState("");
  const [slugEdited, setSlugEdited] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);

  const set = (k: keyof typeof form, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setSaveState("idle");
  };

  // Auto-slug from title for new courses
  const handleTitle = (v: string) => {
    set("title", v);
    if (!slugEdited) set("slug", slugify(v));
  };

  async function save() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.slug.trim())  { setError("Slug is required");  return; }
    setSaveState("saving"); setError("");
    try {
      const res = await fetch(`/api/university/admin/course/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:             form.title.trim(),
          slug:              form.slug.trim(),
          short_description: form.short_description.trim() || null,
          description:       form.description.trim() || null,
          thumbnail_url:     form.thumbnail_url.trim() || null,
          category:          form.category,
          path_tag:          form.path_tag.trim() || null,
          difficulty:        form.difficulty || null,
          duration_label:    form.duration_label.trim() || null,
          pill_color:        form.pill_color,
          is_required:       form.is_required,
          audience:          form.audience.trim() || null,
          instructor_name:   form.instructor_name.trim() || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Save failed"); setSaveState("error"); return; }
      const updated = await res.json();
      setSaveState("saved");
      onSaved(updated, objs);
      setTimeout(() => setSaveState("idle"), 3000);
    } catch { setError("Network error"); setSaveState("error"); }
  }

  async function addObjective() {
    if (!newObj.trim()) return;
    try {
      const res = await fetch("/api/university/admin/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: course.id, objective: newObj.trim(), sort_order: objs.length }),
      });
      if (res.ok) {
        const obj = await res.json();
        setObjs(o => [...o, obj]);
        setNewObj("");
      }
    } catch {}
  }

  async function deleteObjective(id: string) {
    await fetch(`/api/university/admin/objectives?id=${id}`, { method: "DELETE" });
    setObjs(o => o.filter(obj => obj.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Save bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <SaveIndicator state={saveState} />
        {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
        <StudioButton onClick={save} disabled={saveState === "saving"} style={{ marginLeft: "auto" }}>
          {saveState === "saving" ? "Saving…" : "Save Changes"}
        </StudioButton>
      </div>

      {/* Basic Information */}
      <SectionCard title="Basic Information" description="Core course details visible to learners">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel required>Course title</FieldLabel>
            <StudioInput value={form.title} onChange={e => handleTitle(e.target.value)} placeholder="e.g. FHA Fundamentals" />
          </div>

          <div>
            <FieldLabel required>URL slug</FieldLabel>
            <StudioInput
              value={form.slug}
              onChange={e => { setSlugEdited(true); set("slug", slugify(e.target.value)); }}
              placeholder="e.g. fha-fundamentals"
              hint={`Course URL: /university/course/${form.slug || "your-slug"}`}
            />
          </div>

          <div>
            <FieldLabel>Short description</FieldLabel>
            <StudioInput
              value={form.short_description}
              onChange={e => set("short_description", e.target.value)}
              placeholder="One-sentence summary shown on the catalog card"
            />
          </div>

          <div>
            <FieldLabel>Full description</FieldLabel>
            <StudioTextarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="What will learners gain from this course? Describe outcomes, content, and relevance."
              rows={4}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <FieldLabel>Instructor / Trainer</FieldLabel>
              <StudioInput value={form.instructor_name} onChange={e => set("instructor_name", e.target.value)} placeholder="e.g. Harry Martinez" />
            </div>
            <div>
              <FieldLabel>Estimated duration</FieldLabel>
              <StudioInput value={form.duration_label} onChange={e => set("duration_label", e.target.value)} placeholder="e.g. 2 hours 30 min" />
            </div>
          </div>

          <div>
            <FieldLabel>Target audience</FieldLabel>
            <StudioInput value={form.audience} onChange={e => set("audience", e.target.value)} placeholder="e.g. New loan officers in their first 90 days" />
          </div>
        </div>
      </SectionCard>

      {/* Thumbnail */}
      <SectionCard title="Course Thumbnail">
        <div>
          {/* Thumbnail preview / placeholder */}
          <div style={{
            borderRadius: 10, overflow: "hidden",
            background: STUDIO_COLORS.surface, border: `1px solid ${STUDIO_COLORS.border}`,
            marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            height: form.thumbnail_url ? "auto" : 120,
          }}>
            {form.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.thumbnail_url} alt="Thumbnail preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div style={{ textAlign: "center", color: STUDIO_COLORS.textLight, padding: 20 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.4 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                </svg>
                <div style={{ fontSize: 12, marginTop: 6, color: STUDIO_COLORS.textMuted }}>No thumbnail set</div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <StudioButton size="sm" variant="secondary" onClick={() => setShowThumbnailPicker(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
              Pick from Library
            </StudioButton>
            {form.thumbnail_url && (
              <StudioButton size="sm" variant="ghost" onClick={() => set("thumbnail_url", "")}>Remove</StudioButton>
            )}
          </div>
          <FieldLabel>Or paste URL</FieldLabel>
          <StudioInput value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} placeholder="https://..." hint="Recommended: 1280×720px (16:9)" />
        </div>
      </SectionCard>

      {/* Thumbnail picker modal */}
      {showThumbnailPicker && (
        <MediaPicker
          mediaType="image"
          onPick={(asset: UniMediaAsset) => {
            set("thumbnail_url", asset.storage_path);
            setShowThumbnailPicker(false);
          }}
          onClose={() => setShowThumbnailPicker(false)}
        />
      )}

      {/* Classification */}
      <SectionCard title="Classification">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <FieldLabel>Category</FieldLabel>
            <StudioSelect value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </StudioSelect>
          </div>
          <div>
            <FieldLabel>Difficulty</FieldLabel>
            <StudioSelect value={form.difficulty} onChange={e => set("difficulty", e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </StudioSelect>
          </div>
          <div>
            <FieldLabel>Learning path tag</FieldLabel>
            <StudioInput
              value={form.path_tag}
              onChange={e => set("path_tag", e.target.value)}
              placeholder="e.g. harrys_playbook, fast_start"
              hint="Enables course to appear in the matching learning path"
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <FieldLabel>Category badge color</FieldLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {PILL_COLORS.map(p => (
              <button key={p.value} type="button" onClick={() => set("pill_color", p.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                  border: form.pill_color === p.value ? `2px solid ${p.dot}` : `1.5px solid ${STUDIO_COLORS.border}`,
                  background: form.pill_color === p.value ? `${p.dot}18` : STUDIO_COLORS.white,
                  cursor: "pointer", fontSize: 12, fontWeight: 600, color: STUDIO_COLORS.text,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.dot }} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <StudioToggle
            checked={form.is_required}
            onChange={v => set("is_required", v)}
            label="Required training"
            description="Learners are automatically assigned this course"
          />
        </div>
      </SectionCard>

      {/* Learning Objectives */}
      <SectionCard title="Learning Objectives" description="What learners will know or be able to do after completing this course">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {objs.length === 0 && (
            <p style={{ fontSize: 13, color: STUDIO_COLORS.textMuted, marginBottom: 8 }}>
              No objectives yet. Add at least 2–3 clear learning outcomes.
            </p>
          )}
          {objs.map(obj => (
            <div key={obj.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 8,
              background: STUDIO_COLORS.surface, border: `1px solid ${STUDIO_COLORS.border}`,
            }}>
              <span style={{ color: STUDIO_COLORS.orange, fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ flex: 1, fontSize: 14, color: STUDIO_COLORS.text }}>{obj.objective}</span>
              <button
                onClick={() => deleteObjective(obj.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 16, padding: "0 4px", lineHeight: 1 }}
                aria-label="Remove objective"
              >×</button>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <StudioInput
              value={newObj}
              onChange={e => setNewObj(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addObjective(); } }}
              placeholder="e.g. Identify qualifying FHA income sources"
              style={{ flex: 1 }}
            />
            <StudioButton onClick={addObjective} variant="secondary" disabled={!newObj.trim()}>
              + Add
            </StudioButton>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Curriculum Tab ────────────────────────────────────────────────────────────

function CurriculumTab({
  course,
  lessons,
  modules,
  onLessonsChange,
  onModulesChange,
  onCourseChange,
}: {
  course: UniCourse;
  lessons: UniLesson[];
  modules: UniModule[];
  onLessonsChange: (ls: UniLesson[]) => void;
  onModulesChange: (ms: UniModule[]) => void;
  onCourseChange?: (c: UniCourse) => void;
}) {
  const router = useRouter();

  // Inline course title / description editing
  const [editTitle, setEditTitle]       = useState(course.title);
  const [editDesc, setEditDesc]         = useState(course.short_description ?? "");
  const [savingMeta, setSavingMeta]     = useState(false);
  const titleInputRef                   = React.useRef<HTMLInputElement>(null);

  async function saveMeta() {
    if (!editTitle.trim() || savingMeta) return;
    setSavingMeta(true);
    try {
      const res = await fetch(`/api/university/admin/course/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), short_description: editDesc.trim() || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        onCourseChange?.(updated);
      }
    } catch {}
    setSavingMeta(false);
  }

  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editModuleDesc, setEditModuleDesc] = useState("");
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [dragLesson, setDragLesson] = useState<string | null>(null);
  // addContentFor: null = closed, "root" = unassigned, moduleId string = that module
  const [addContentFor, setAddContentFor] = useState<string | null>(null);

  // Group lessons by module
  const unassigned = lessons.filter(l => !l.module_id);
  const lessonsByModule = (mid: string) => lessons.filter(l => l.module_id === mid)
    .sort((a, b) => a.module_sort_order - b.module_sort_order);

  const toggleCollapse = (mid: string) => {
    setCollapsedModules(s => {
      const n = new Set(s);
      n.has(mid) ? n.delete(mid) : n.add(mid);
      return n;
    });
  };

  async function createModule() {
    if (!newModuleTitle.trim()) return;
    try {
      const res = await fetch("/api/university/admin/module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: course.id, title: newModuleTitle.trim(), sort_order: modules.length }),
      });
      if (!res.ok) { setError("Failed to create module"); return; }
      const mod = await res.json();
      onModulesChange([...modules, mod]);
      setNewModuleTitle("");
      setAddingModule(false);
    } catch { setError("Network error"); }
  }

  async function saveModuleEdits(moduleId: string) {
    if (!editModuleTitle.trim()) return;
    try {
      const res = await fetch(`/api/university/admin/module/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editModuleTitle.trim(), description: editModuleDesc.trim() || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        onModulesChange(modules.map(m => m.id === moduleId ? updated : m));
        setEditingModuleId(null);
      }
    } catch {}
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module? Lessons will be unassigned (not deleted).")) return;
    await fetch(`/api/university/admin/module/${moduleId}`, { method: "DELETE" });
    onModulesChange(modules.filter(m => m.id !== moduleId));
    onLessonsChange(lessons.map(l => l.module_id === moduleId ? { ...l, module_id: null } : l));
  }

  async function assignLessonToModule(lessonId: string, moduleId: string | null) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const targetLessons = moduleId
      ? lessons.filter(l => l.module_id === moduleId)
      : lessons.filter(l => !l.module_id);
    await fetch(`/api/university/admin/lesson/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: moduleId, module_sort_order: targetLessons.length }),
    });
    onLessonsChange(lessons.map(l => l.id === lessonId ? { ...l, module_id: moduleId, module_sort_order: targetLessons.length } : l));
  }

  function openLessonEditor(lessonId: string) {
    router.push(`/university/admin/studio/${course.id}/lesson/${lessonId}`);
  }

  async function createLesson(moduleId: string | null, lessonType: LessonType = "video") {
    try {
      const targetLessons = moduleId ? lessonsByModule(moduleId) : unassigned;
      const typeLabel = lessonType.charAt(0).toUpperCase() + lessonType.slice(1).replace("_", " ");
      const res = await fetch("/api/university/admin/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: course.id,
          module_id: moduleId,
          title: `New ${typeLabel} Lesson`,
          lesson_type: lessonType,
          sort_order: lessons.length,
          module_sort_order: targetLessons.length,
        }),
      });
      if (!res.ok) return;
      const lesson = await res.json();
      onLessonsChange([...lessons, lesson]);
      router.push(`/university/admin/studio/${course.id}/lesson/${lesson.id}`);
    } catch {}
  }

  function handleAddContent(type: LessonType) {
    const moduleId = addContentFor === "root" ? null : (addContentFor ?? null);
    setAddContentFor(null);
    createLesson(moduleId, type);
  }

  function LessonRow({ lesson, moduleId }: { lesson: UniLesson; moduleId: string | null }) {
    return (
      <div
        draggable
        onDragStart={() => setDragLesson(lesson.id)}
        onDragEnd={() => setDragLesson(null)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 8,
          background: dragLesson === lesson.id ? "#f0f9ff" : STUDIO_COLORS.white,
          border: `1px solid ${STUDIO_COLORS.border}`,
          cursor: "grab", transition: "background 0.1s",
        }}
      >
        {/* Drag handle */}
        <div style={{ color: STUDIO_COLORS.textLight, fontSize: 13, flexShrink: 0, cursor: "grab" }}>⠿</div>

        {/* Status dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
          background: lesson.is_published ? STUDIO_COLORS.green : STUDIO_COLORS.border,
        }} />

        {/* Type + title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <LessonTypeBadge lessonType={lesson.lesson_type ?? "video"} />
            <span style={{ fontSize: 14, fontWeight: 600, color: STUDIO_COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {lesson.title}
            </span>
          </div>
          <div style={{ fontSize: 11, color: STUDIO_COLORS.textMuted, display: "flex", gap: 10 }}>
            {lesson.duration_label && <span>⏱ {lesson.duration_label}</span>}
            {(lesson.lesson_type === "video" || !lesson.lesson_type) && !lesson.video_token && (
              <span style={{ color: STUDIO_COLORS.amber }}>⚠ No video</span>
            )}
            <span style={{
              padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700,
              background: lesson.is_published ? "rgba(52,211,153,0.1)" : "rgba(0,0,0,0.04)",
              color: lesson.is_published ? STUDIO_COLORS.greenDark : STUDIO_COLORS.textMuted,
            }}>
              {lesson.is_published ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        {/* Module assignment quick-pick */}
        {modules.length > 0 && (
          <select
            value={lesson.module_id ?? ""}
            onChange={e => assignLessonToModule(lesson.id, e.target.value || null)}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: 11, padding: "4px 8px", borderRadius: 6, border: `1px solid ${STUDIO_COLORS.border}`,
              background: STUDIO_COLORS.surface, color: STUDIO_COLORS.textMuted, cursor: "pointer", flexShrink: 0,
            }}
          >
            <option value="">No module</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        )}

        {/* Edit button */}
        <StudioButton size="sm" variant="secondary" onClick={() => openLessonEditor(lesson.id)}>
          Edit
        </StudioButton>
      </div>
    );
  }

  function ModuleSection({ mod }: { mod: UniModule }) {
    const modLessons = lessonsByModule(mod.id);
    const collapsed  = collapsedModules.has(mod.id);
    const isEditing  = editingModuleId === mod.id;

    return (
      <div
        style={{ border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 12, overflow: "hidden" }}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={() => { if (dragLesson) assignLessonToModule(dragLesson, mod.id); }}
      >
        {/* Module header */}
        <div style={{
          background: STUDIO_COLORS.surface,
          borderBottom: collapsed ? "none" : `1px solid ${STUDIO_COLORS.border}`,
        }}>
          {/* Title row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 18px",
          }}>
            <button type="button" onClick={() => toggleCollapse(mod.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 11, padding: 0, flexShrink: 0 }}>
              {collapsed ? "▶" : "▼"}
            </button>

            {isEditing ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  value={editModuleTitle}
                  onChange={e => setEditModuleTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveModuleEdits(mod.id); if (e.key === "Escape") setEditingModuleId(null); }}
                  autoFocus
                  placeholder="Chapter name"
                  style={{
                    padding: "6px 10px", borderRadius: 7,
                    border: `1.5px solid ${STUDIO_COLORS.orange}`,
                    fontSize: 15, fontWeight: 700, color: STUDIO_COLORS.text,
                    outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
                  }}
                />
                <input
                  value={editModuleDesc}
                  onChange={e => setEditModuleDesc(e.target.value)}
                  placeholder="Add chapter description..."
                  style={{
                    padding: "6px 10px", borderRadius: 7,
                    border: `1.5px solid ${STUDIO_COLORS.border}`,
                    fontSize: 13, color: STUDIO_COLORS.textMuted,
                    outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <StudioButton size="sm" onClick={() => saveModuleEdits(mod.id)}>Save</StudioButton>
                  <StudioButton size="sm" variant="secondary" onClick={() => setEditingModuleId(null)}>Cancel</StudioButton>
                </div>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: STUDIO_COLORS.text }}>
                    {mod.title}
                  </div>
                  {mod.description ? (
                    <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, marginTop: 2 }}>{mod.description}</div>
                  ) : (
                    <div style={{ fontSize: 12, color: STUDIO_COLORS.textLight, marginTop: 2, fontStyle: "italic" }}>
                      Add chapter description…
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: STUDIO_COLORS.textMuted, marginRight: 6 }}>
                    {modLessons.length} lesson{modLessons.length !== 1 ? "s" : ""}
                  </span>
                  <button type="button"
                    onClick={() => { setEditingModuleId(mod.id); setEditModuleTitle(mod.title); setEditModuleDesc(mod.description ?? ""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 12, padding: "3px 8px", borderRadius: 6 }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteModule(mod.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.red, fontSize: 12, padding: "3px 8px", borderRadius: 6 }}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Lessons */}
        {!collapsed && (
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {modLessons.length === 0 ? (
              <div style={{ fontSize: 13, color: STUDIO_COLORS.textMuted, textAlign: "center", padding: "16px 0" }}>
                Drag lessons here or{" "}
                <button type="button" onClick={() => setAddContentFor(mod.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.orange, fontWeight: 700, fontSize: 13, padding: 0 }}>
                  + add content
                </button>
              </div>
            ) : (
              modLessons.map(l => <LessonRow key={l.id} lesson={l} moduleId={mod.id} />)
            )}
            <div style={{ paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => setAddContentFor(mod.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8,
                  border: `1.5px solid ${STUDIO_COLORS.border}`,
                  background: STUDIO_COLORS.white,
                  cursor: "pointer", fontSize: 12, fontWeight: 700,
                  color: STUDIO_COLORS.orange,
                }}
              >
                + Add Content
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {/* ── Inline course header — matches CreatorLMS canvas style ── */}
      <div style={{
        background: STUDIO_COLORS.white, borderRadius: 12,
        border: `1px solid ${STUDIO_COLORS.border}`,
        padding: "0 0 20px",
        overflow: "hidden",
      }}>
        {/* Thumbnail strip */}
        <div style={{
          height: 140, background: "#f0f2f5",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c5cdd8" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
            </svg>
          )}
        </div>

        {/* Title + description */}
        <div style={{ padding: "16px 24px 0" }}>
          <input
            ref={titleInputRef}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={saveMeta}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); titleInputRef.current?.blur(); } }}
            placeholder="Enter Course Title"
            style={{
              width: "100%", border: "none", outline: "none", background: "transparent",
              fontSize: 22, fontWeight: 700, color: STUDIO_COLORS.text, fontFamily: "inherit",
              marginBottom: 6, boxSizing: "border-box",
            }}
          />
          <textarea
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onBlur={saveMeta}
            placeholder="Add course description..."
            rows={2}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none", background: "transparent",
              fontSize: 13, color: STUDIO_COLORS.textMuted, fontFamily: "inherit",
              lineHeight: 1.6, boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { label: "Chapters",  value: modules.length },
          { label: "Lessons",   value: lessons.length },
          { label: "Published", value: lessons.filter(l => l.is_published).length },
        ].map(s => (
          <div key={s.label} style={{
            flex: "1 1 100px", padding: "12px 16px",
            background: STUDIO_COLORS.surface, border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 8,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: STUDIO_COLORS.text }}>{s.value}</div>
            <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Modules / Chapters */}
      {modules.map(m => <ModuleSection key={m.id} mod={m} />)}

      {/* Unassigned lessons */}
      {lessons.length > 0 && (
        <div
          style={{ border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 12, overflow: "hidden" }}
          onDragOver={e => e.preventDefault()}
          onDrop={() => { if (dragLesson) assignLessonToModule(dragLesson, null); }}
        >
          <div style={{ padding: "14px 18px", background: STUDIO_COLORS.surface, borderBottom: `1px solid ${STUDIO_COLORS.border}` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: STUDIO_COLORS.text }}>
              {modules.length > 0 ? "Unassigned Lessons" : "Lessons"}
            </span>
            <span style={{ marginLeft: 8, fontSize: 11, color: STUDIO_COLORS.textMuted }}>{unassigned.length} lesson{unassigned.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {unassigned.length === 0 && modules.length > 0 ? (
              <p style={{ fontSize: 13, color: STUDIO_COLORS.textMuted, textAlign: "center", padding: "12px 0" }}>
                All lessons are assigned to chapters.
              </p>
            ) : unassigned.length === 0 ? (
              <EmptyState
                icon="▶"
                title="No lessons yet"
                description="Add the first lesson. Use chapters to organize content into sections."
                action={
                  <StudioButton onClick={() => setAddContentFor("root")}>+ Add Content</StudioButton>
                }
              />
            ) : (
              unassigned.map(l => <LessonRow key={l.id} lesson={l} moduleId={null} />)
            )}
            {unassigned.length > 0 && (
              <div style={{ paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setAddContentFor("root")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 8,
                    border: `1.5px solid ${STUDIO_COLORS.border}`,
                    background: STUDIO_COLORS.white,
                    cursor: "pointer", fontSize: 12, fontWeight: 700,
                    color: STUDIO_COLORS.orange,
                  }}
                >
                  + Add Content
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {lessons.length === 0 && modules.length === 0 && (
        <EmptyState
          icon="▶"
          title="No content yet"
          description="Add your first lesson or chapter to start building this course."
          action={<StudioButton onClick={() => setAddContentFor("root")}>+ Add Content</StudioButton>}
        />
      )}

      {/* Bottom toolbar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
        <StudioButton onClick={() => setAddContentFor("root")} variant="secondary">
          + Add Content
        </StudioButton>

        {!addingModule ? (
          <StudioButton variant="secondary" onClick={() => setAddingModule(true)}>
            + Add Chapter
          </StudioButton>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StudioInput
              value={newModuleTitle}
              onChange={e => setNewModuleTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createModule(); if (e.key === "Escape") { setAddingModule(false); setNewModuleTitle(""); } }}
              placeholder="Chapter title"
              autoFocus
              style={{ width: 240 }}
            />
            <StudioButton onClick={createModule} disabled={!newModuleTitle.trim()}>Create</StudioButton>
            <StudioButton variant="secondary" onClick={() => { setAddingModule(false); setNewModuleTitle(""); }}>Cancel</StudioButton>
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      {addContentFor !== null && (
        <AddContentModal
          onSelect={handleAddContent}
          onClose={() => setAddContentFor(null)}
        />
      )}
    </div>
  );
}

// ── Assessments Tab ───────────────────────────────────────────────────────────

function AssessmentsTab({
  course,
  assessments,
  onAssessmentsChange,
}: {
  course: UniCourse;
  assessments: UniAssessment[];
  onAssessmentsChange: (as: UniAssessment[]) => void;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "", assessment_type: "final_assessment",
    passing_pct: 70, max_attempts: 2, time_limit_mins: 0, is_required: true,
  });
  const [error, setError] = useState("");

  async function createAssessment() {
    if (!newForm.title.trim()) return;
    try {
      const res = await fetch("/api/university/admin/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id:        course.id,
          title:            newForm.title.trim(),
          assessment_type:  newForm.assessment_type,
          passing_pct:      newForm.passing_pct,
          max_attempts:     newForm.max_attempts > 0 ? newForm.max_attempts : null,
          time_limit_mins:  newForm.time_limit_mins > 0 ? newForm.time_limit_mins : null,
          is_required:      newForm.is_required,
        }),
      });
      if (!res.ok) { setError("Failed to create assessment"); return; }
      const a = await res.json();
      onAssessmentsChange([...assessments, a]);
      setCreating(false);
      // Navigate to assessment builder
      router.push(`/university/admin/studio/${course.id}/assessment/${a.id}`);
    } catch { setError("Network error"); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {assessments.length === 0 && !creating && (
        <EmptyState
          icon="✏"
          title="No assessments yet"
          description="Create a final assessment or knowledge check to verify learner understanding."
          action={<StudioButton onClick={() => setCreating(true)}>+ Create Assessment</StudioButton>}
        />
      )}

      {assessments.map(a => (
        <div key={a.id} style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 18px", borderRadius: 10,
          border: `1px solid ${STUDIO_COLORS.border}`,
          background: STUDIO_COLORS.white,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <AssessmentTypeBadge assessmentType={a.assessment_type} />
              <span style={{ fontSize: 15, fontWeight: 700, color: STUDIO_COLORS.text }}>{a.title}</span>
              {!a.is_active && <span style={{ fontSize: 10, color: STUDIO_COLORS.textMuted, fontWeight: 700, textTransform: "uppercase" }}>Inactive</span>}
            </div>
            <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span>Passing: {a.passing_pct}%</span>
              {a.max_attempts && <span>Max attempts: {a.max_attempts}</span>}
              {a.time_limit_mins && <span>Time: {a.time_limit_mins} min</span>}
              {a.is_required && <span style={{ color: STUDIO_COLORS.orange, fontWeight: 700 }}>Required</span>}
            </div>
          </div>
          <StudioButton
            size="sm" variant="secondary"
            onClick={() => router.push(`/university/admin/studio/${course.id}/assessment/${a.id}`)}
          >
            Edit
          </StudioButton>
        </div>
      ))}

      {creating && (
        <div style={{ padding: "20px", border: `1.5px solid ${STUDIO_COLORS.orange}20`, borderRadius: 12, background: `${STUDIO_COLORS.orange}05` }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: STUDIO_COLORS.text }}>New Assessment</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <FieldLabel required>Assessment title</FieldLabel>
              <StudioInput value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. FHA Fundamentals Final Assessment" autoFocus />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <FieldLabel>Assessment type</FieldLabel>
                <StudioSelect value={newForm.assessment_type} onChange={e => setNewForm(f => ({ ...f, assessment_type: e.target.value }))}>
                  <option value="knowledge_check">Knowledge Check</option>
                  <option value="quiz">Practice Quiz</option>
                  <option value="final_assessment">Final Assessment</option>
                  <option value="certification_exam">Certification Exam</option>
                </StudioSelect>
              </div>
              <div>
                <FieldLabel>Passing score (%)</FieldLabel>
                <StudioInput type="number" min={1} max={100} value={newForm.passing_pct} onChange={e => setNewForm(f => ({ ...f, passing_pct: +e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Max attempts (0 = unlimited)</FieldLabel>
                <StudioInput type="number" min={0} value={newForm.max_attempts} onChange={e => setNewForm(f => ({ ...f, max_attempts: +e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Time limit in minutes (0 = none)</FieldLabel>
                <StudioInput type="number" min={0} value={newForm.time_limit_mins} onChange={e => setNewForm(f => ({ ...f, time_limit_mins: +e.target.value }))} />
              </div>
            </div>
            <StudioToggle checked={newForm.is_required} onChange={v => setNewForm(f => ({ ...f, is_required: v }))} label="Required for course completion" />
            <div style={{ display: "flex", gap: 8 }}>
              <StudioButton onClick={createAssessment} disabled={!newForm.title.trim()}>Create & Build Questions</StudioButton>
              <StudioButton variant="secondary" onClick={() => setCreating(false)}>Cancel</StudioButton>
            </div>
          </div>
        </div>
      )}

      {assessments.length > 0 && !creating && (
        <StudioButton variant="secondary" onClick={() => setCreating(true)}>+ Add Another Assessment</StudioButton>
      )}
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({
  course,
  certConfig,
  assessments,
  onSaved,
  isAdmin,
}: {
  course: UniCourse;
  certConfig: UniCertificateConfig | null;
  assessments: UniAssessment[];
  onSaved: (c: UniCourse, cc: UniCertificateConfig | null) => void;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [rules, setRules] = useState({
    require_all_lessons: course.completion_rules?.require_all_lessons ?? true,
    require_assessment:  course.completion_rules?.require_assessment ?? false,
    passing_score:       course.completion_rules?.passing_score ?? 70,
  });
  const [cert, setCert] = useState({
    issue_certificate:    certConfig?.issue_certificate ?? true,
    validity_days:        certConfig?.validity_days ?? null as number | null,
    renewal_mode:         certConfig?.renewal_mode ?? "manual",
    include_verification: certConfig?.include_verification ?? true,
    trigger_assessment_id: certConfig?.trigger_assessment_id ?? null as string | null,
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  async function save() {
    setSaveState("saving"); setError("");
    try {
      // Save completion rules on course
      const courseRes = await fetch(`/api/university/admin/course/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completion_rules: rules }),
      });
      if (!courseRes.ok) { setError("Failed to save settings"); setSaveState("error"); return; }
      const updatedCourse = await courseRes.json();

      // Save cert config
      const certRes = await fetch(`/api/university/admin/course/${course.id}/certificate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cert),
      });
      if (!certRes.ok) { setError("Failed to save certificate config"); setSaveState("error"); return; }
      const updatedCert = await certRes.json();

      setSaveState("saved");
      onSaved(updatedCourse, updatedCert);
      setTimeout(() => setSaveState("idle"), 3000);
    } catch { setError("Network error"); setSaveState("error"); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SaveIndicator state={saveState} />
        {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
        <StudioButton onClick={save} disabled={saveState === "saving"} style={{ marginLeft: "auto" }}>
          {saveState === "saving" ? "Saving…" : "Save Settings"}
        </StudioButton>
      </div>

      {/* Completion Rules */}
      <SectionCard title="Completion Rules" description="Define what a learner must complete to finish this course">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <StudioToggle
            checked={rules.require_all_lessons}
            onChange={v => setRules(r => ({ ...r, require_all_lessons: v }))}
            label="Require all published lessons"
            description="Learner must complete every published lesson in the course"
          />
          <StudioToggle
            checked={rules.require_assessment}
            onChange={v => setRules(r => ({ ...r, require_assessment: v }))}
            label="Require passing the final assessment"
            description="Learner must pass at least one required assessment"
          />
          {rules.require_assessment && (
            <div style={{ paddingLeft: 52 }}>
              <FieldLabel>Passing score (%)</FieldLabel>
              <StudioInput
                type="number" min={1} max={100} value={rules.passing_score}
                onChange={e => setRules(r => ({ ...r, passing_score: +e.target.value }))}
                style={{ maxWidth: 120 }}
              />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Certificate */}
      <SectionCard title="Certificate Settings" description="Configure completion certificates for this course">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <StudioToggle
            checked={cert.issue_certificate}
            onChange={v => setCert(c => ({ ...c, issue_certificate: v }))}
            label="Issue certificate on completion"
            description="Learners receive a certificate when they complete all requirements"
          />

          {cert.issue_certificate && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FieldLabel>Certificate validity (days, blank = no expiry)</FieldLabel>
                  <StudioInput
                    type="number" min={0}
                    value={cert.validity_days ?? ""}
                    onChange={e => setCert(c => ({ ...c, validity_days: e.target.value ? +e.target.value : null }))}
                    placeholder="e.g. 365"
                  />
                </div>
                <div>
                  <FieldLabel>Renewal mode</FieldLabel>
                  <StudioSelect value={cert.renewal_mode} onChange={e => setCert(c => ({ ...c, renewal_mode: e.target.value as import("@/lib/database.types").RenewalMode }))}>
                    <option value="manual">Manual</option>
                    <option value="auto_reassign">Auto-reassign on expiry</option>
                  </StudioSelect>
                </div>
              </div>

              {assessments.length > 0 && (
                <div>
                  <FieldLabel>Certificate triggered by assessment (optional)</FieldLabel>
                  <StudioSelect
                    value={cert.trigger_assessment_id ?? ""}
                    onChange={e => setCert(c => ({ ...c, trigger_assessment_id: e.target.value || null }))}
                  >
                    <option value="">Auto — when all completion rules met</option>
                    {assessments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </StudioSelect>
                </div>
              )}

              <StudioToggle
                checked={cert.include_verification}
                onChange={v => setCert(c => ({ ...c, include_verification: v }))}
                label="Include verification ID"
                description="Generates a unique verification code for the certificate PDF"
              />
            </>
          )}
        </div>
      </SectionCard>

      {/* Danger zone — admin only */}
      {isAdmin && (
        <div style={{ padding: "20px", borderRadius: 12, border: `1.5px solid ${STUDIO_COLORS.red}`, background: "rgba(248,113,113,0.04)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: STUDIO_COLORS.redDark, marginBottom: 8 }}>Danger Zone</h3>
          <p style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, marginBottom: 16 }}>
            Archiving removes this course from the learner catalog while preserving all progress and completion records.
          </p>
          {course.content_status !== "archived" ? (
            <StudioButton
              variant="danger"
              onClick={async () => {
                if (!confirm("Archive this course? It will be hidden from all learners.")) return;
                await fetch(`/api/university/admin/course/${course.id}/status`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "archive" }),
                });
                router.push("/university/admin/courses");
              }}
            >
              Archive Course
            </StudioButton>
          ) : (
            <p style={{ fontSize: 13, color: STUDIO_COLORS.textMuted }}>This course is archived.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Readiness Panel ───────────────────────────────────────────────────────────

function ReadinessPanel({
  courseId,
  contentStatus,
  isAdmin,
  onStatusChange,
}: {
  courseId: string;
  contentStatus: string;
  isAdmin: boolean;
  onStatusChange: (newStatus: string) => void;
}) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/university/admin/course/${courseId}/status`);
      if (res.ok) setValidation(await res.json());
    } finally { setLoading(false); }
  };

  const doAction = async (action: string) => {
    setActing(true); setError("");
    try {
      const res = await fetch(`/api/university/admin/course/${courseId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors ? data.errors.map((e: { message: string }) => e.message).join(" · ") : (data.error ?? "Action failed"));
      } else {
        onStatusChange(data.content_status);
        setShowPanel(false);
      }
    } catch { setError("Network error"); }
    finally { setActing(false); }
  };

  const cfg = STATUS_CONFIG[contentStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;

  const ACTIONS: Record<string, { label: string; action: string; next: string; adminOnly?: boolean }[]> = {
    draft:     [{ label: "Submit for Review", action: "submit_review", next: "in_review" }],
    in_review: [
      { label: "Approve",       action: "approve",      next: "approved", adminOnly: true },
      { label: "Revert to Draft", action: "revert_draft", next: "draft",  adminOnly: true },
    ],
    approved:  [{ label: "Publish",  action: "publish",  next: "published", adminOnly: true }],
    published: [{ label: "Unpublish", action: "unpublish", next: "approved", adminOnly: true }],
    archived:  [],
  };

  const availableActions = (ACTIONS[contentStatus] ?? []).filter(a => !a.adminOnly || isAdmin);

  return (
    <div>
      <button
        type="button"
        onClick={() => { setShowPanel(s => !s); if (!showPanel) load(); }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 8,
          border: `1px solid ${cfg.border}`, background: cfg.bg,
          cursor: "pointer", fontSize: 12, fontWeight: 700, color: cfg.color,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
        {cfg.label}
        <span style={{ fontSize: 10, opacity: 0.7 }}>{showPanel ? "▲" : "▼"}</span>
      </button>

      {showPanel && (
        <div style={{
          position: "absolute", top: "100%", right: 0, zIndex: 50,
          marginTop: 6, width: 340,
          background: STUDIO_COLORS.white, border: `1px solid ${STUDIO_COLORS.border}`,
          borderRadius: 12, boxShadow: "0 8px 32px rgba(7,26,46,0.14)",
          overflow: "hidden",
        }}>
          {/* Status description */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${STUDIO_COLORS.border}`, background: cfg.bg }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{cfg.label}</div>
            <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, marginTop: 4 }}>{cfg.description}</div>
          </div>

          {/* Validation */}
          {loading && <div style={{ padding: 16, fontSize: 13, color: STUDIO_COLORS.textMuted }}>Checking readiness…</div>}
          {validation && (
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${STUDIO_COLORS.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: STUDIO_COLORS.textMuted, marginBottom: 8 }}>
                Course Readiness
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {validation.checks.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ fontSize: 12, color: c.ok ? STUDIO_COLORS.greenDark : STUDIO_COLORS.amber }}>
                      {c.ok ? "✓" : "○"}
                    </span>
                    <span style={{ color: c.ok ? STUDIO_COLORS.text : STUDIO_COLORS.textMuted }}>{c.label}</span>
                  </div>
                ))}
              </div>
              {validation.errors.length > 0 && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(185,28,28,0.06)", borderRadius: 7, fontSize: 12, color: STUDIO_COLORS.redDark }}>
                  {validation.errors.map(e => <div key={e.field}>⚠ {e.message}</div>)}
                </div>
              )}
              {validation.warnings.length > 0 && (
                <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(251,191,36,0.08)", borderRadius: 7, fontSize: 12, color: "#92400e" }}>
                  {validation.warnings.map(w => <div key={w.field}>ℹ {w.message}</div>)}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {availableActions.length > 0 && (
            <div style={{ padding: "14px 16px" }}>
              {error && <div style={{ fontSize: 12, color: STUDIO_COLORS.redDark, marginBottom: 10 }}>⚠ {error}</div>}
              {(contentStatus === "in_review" && isAdmin) && (
                <div style={{ marginBottom: 10 }}>
                  <FieldLabel>Review notes (optional)</FieldLabel>
                  <StudioTextarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Feedback for the author…" rows={2} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {availableActions.map(a => (
                  <StudioButton
                    key={a.action}
                    fullWidth
                    variant={a.action === "publish" ? "primary" : a.action === "approve" ? "success" : "secondary"}
                    onClick={() => doAction(a.action)}
                    disabled={acting}
                  >
                    {acting ? "Processing…" : a.label}
                  </StudioButton>
                ))}
              </div>
            </div>
          )}

          {availableActions.length === 0 && !loading && (
            <div style={{ padding: 16, fontSize: 13, color: STUDIO_COLORS.textMuted }}>
              {contentStatus === "archived" ? "This course is archived." : "No actions available."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main CourseStudio ─────────────────────────────────────────────────────────

export interface CourseStudioProps {
  course: UniCourse;
  lessons: UniLesson[];
  modules: UniModule[];
  assessments: UniAssessment[];
  objectives: UniCourseObjective[];
  certConfig: UniCertificateConfig | null;
  isAdmin: boolean;
  initialTab?: StudioTab;
}

export function CourseStudio({
  course: initialCourse,
  lessons: initialLessons,
  modules: initialModules,
  assessments: initialAssessments,
  objectives: initialObjectives,
  certConfig: initialCertConfig,
  isAdmin,
  initialTab = "overview",
}: CourseStudioProps) {
  const [course, setCourse]             = useState(initialCourse);
  const [lessons, setLessons]           = useState(initialLessons);
  const [modules, setModules]           = useState(initialModules);
  const [assessments, setAssessments]   = useState(initialAssessments);
  const [objectives, setObjectives]     = useState(initialObjectives);
  const [certConfig, setCertConfig]     = useState(initialCertConfig);
  const [tab, setTab]                   = useState<StudioTab>(initialTab);
  const statusRef                       = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "overview" as StudioTab,    label: "Overview" },
    { id: "curriculum" as StudioTab,  label: "Curriculum",  badge: lessons.length },
    { id: "assessments" as StudioTab, label: "Assessments", badge: assessments.length },
    { id: "settings" as StudioTab,    label: "Settings" },
  ];

  // Wizard steps (maps tabs to step numbers for the progress indicator)
  const WIZARD_STEPS: { id: StudioTab; label: string }[] = [
    { id: "overview",    label: "Content" },
    { id: "curriculum",  label: "Curriculum" },
    { id: "assessments", label: "Assessments" },
    { id: "settings",    label: "Settings" },
  ];
  const currentStepIdx = WIZARD_STEPS.findIndex(s => s.id === tab);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: STUDIO_COLORS.white, minHeight: "100vh" }}>
      {/* ── Studio header ──────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: STUDIO_COLORS.navy,
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        padding: "0 clamp(16px,4vw,48px)",
      }}>
        {/* Top bar */}
        <div style={{
          height: 56, display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 16,
        }}>
          {/* Left: back + breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a
              href="/university/admin/courses"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 7,
                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)",
                color: STUDIO_COLORS.textLight, fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              ← Back
            </a>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: STUDIO_COLORS.orange, marginBottom: 3 }}>
                Training Studio
              </div>
              <Breadcrumb items={[
                { label: "Courses",  href: "/university/admin/courses" },
                { label: course.title },
              ]} />
            </div>
          </div>

          {/* Centre: wizard step progress */}
          <div style={{
            display: "flex", alignItems: "center", gap: 0,
            position: "absolute", left: "50%", transform: "translateX(-50%)",
          }}>
            {WIZARD_STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                {/* Step */}
                <button
                  type="button"
                  onClick={() => setTab(step.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "none", border: "none", cursor: "pointer",
                    padding: "4px 8px",
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800,
                    background: i < currentStepIdx
                      ? STUDIO_COLORS.orange
                      : i === currentStepIdx
                        ? STUDIO_COLORS.white
                        : "rgba(255,255,255,0.12)",
                    color: i === currentStepIdx
                      ? STUDIO_COLORS.navy
                      : i < currentStepIdx
                        ? "#fff"
                        : "rgba(255,255,255,0.4)",
                    border: i === currentStepIdx ? "none" : "none",
                    flexShrink: 0,
                  }}>
                    {i < currentStepIdx ? "✓" : i + 1}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: i === currentStepIdx ? 700 : 400,
                    color: i === currentStepIdx ? "#fff" : "rgba(255,255,255,0.45)",
                  }}>
                    {step.label}
                  </span>
                </button>
                {/* Connector line */}
                {i < WIZARD_STEPS.length - 1 && (
                  <div style={{
                    width: 32, height: 1,
                    background: i < currentStepIdx ? STUDIO_COLORS.orange : "rgba(255,255,255,0.15)",
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right: status + preview + next */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, position: "relative" }} ref={statusRef}>
            <ReadinessPanel
              courseId={course.id}
              contentStatus={course.content_status}
              isAdmin={isAdmin}
              onStatusChange={newStatus => setCourse(c => ({ ...c, content_status: newStatus as import("@/lib/database.types").ContentStatus, is_published: newStatus === "published" }))}
            />
            <a
              href={`/university/course/${course.slug}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                padding: "6px 14px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)",
                color: STUDIO_COLORS.textLight, fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              Preview ↗
            </a>
            {currentStepIdx < WIZARD_STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => setTab(WIZARD_STEPS[currentStepIdx + 1].id)}
                style={{
                  padding: "7px 16px", borderRadius: 8,
                  background: STUDIO_COLORS.orange, color: "#fff",
                  border: "none", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 18px",
                border: "none", background: "transparent", cursor: "pointer",
                fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? "#fff" : STUDIO_COLORS.textLight,
                borderBottom: `2px solid ${tab === t.id ? STUDIO_COLORS.orange : "transparent"}`,
                fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px",
                  background: tab === t.id ? STUDIO_COLORS.orange : "rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: 10, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 80px" }}>
        {tab === "overview" && (
          <OverviewTab
            course={course}
            objectives={objectives}
            onSaved={(c, objs) => { setCourse(c); setObjectives(objs); }}
          />
        )}
        {tab === "curriculum" && (
          <CurriculumTab
            course={course}
            lessons={lessons}
            modules={modules}
            onLessonsChange={setLessons}
            onModulesChange={setModules}
            onCourseChange={setCourse}
          />
        )}
        {tab === "assessments" && (
          <AssessmentsTab
            course={course}
            assessments={assessments}
            onAssessmentsChange={setAssessments}
          />
        )}
        {tab === "settings" && (
          <SettingsTab
            course={course}
            certConfig={certConfig}
            assessments={assessments}
            isAdmin={isAdmin}
            onSaved={(c, cc) => { setCourse(c); setCertConfig(cc); }}
          />
        )}
      </div>
    </div>
  );
}
