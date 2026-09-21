"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { UniCourse, UniLesson, UniModule, UniAssessment, UniCourseObjective, UniCertificateConfig } from "@/lib/database.types";
import {
  STUDIO_COLORS, STATUS_CONFIG,
  StudioInput, StudioTextarea, StudioSelect, FieldLabel, StudioToggle, StudioButton,
  StatusBadge, SaveIndicator, SaveState, SectionCard, EmptyState, ErrorBanner,
  LessonTypeBadge, LESSON_TYPE_LABELS, AssessmentTypeBadge, StudioTabs, Breadcrumb,
} from "./StudioPrimitives";

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
          <FieldLabel>Thumbnail URL</FieldLabel>
          <StudioInput value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} placeholder="https://..." hint="Recommended: 1280×720px (16:9)" />
          {form.thumbnail_url && (
            <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", maxHeight: 160, background: STUDIO_COLORS.surface, border: `1px solid ${STUDIO_COLORS.border}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.thumbnail_url} alt="Thumbnail preview" style={{ width: "100%", height: 160, objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>
      </SectionCard>

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
}: {
  course: UniCourse;
  lessons: UniLesson[];
  modules: UniModule[];
  onLessonsChange: (ls: UniLesson[]) => void;
  onModulesChange: (ms: UniModule[]) => void;
}) {
  const router = useRouter();
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [dragLesson, setDragLesson] = useState<string | null>(null);
  const [dragModule, setDragModule] = useState<string | null>(null);

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

  async function saveModuleTitle(moduleId: string) {
    if (!editModuleTitle.trim()) return;
    try {
      const res = await fetch(`/api/university/admin/module/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editModuleTitle.trim() }),
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

  async function createLesson(moduleId: string | null) {
    try {
      const targetLessons = moduleId ? lessonsByModule(moduleId) : unassigned;
      const res = await fetch("/api/university/admin/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: course.id,
          module_id: moduleId,
          title: "New Lesson",
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
        style={{ border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 10, overflow: "hidden" }}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={() => {
          if (dragLesson) assignLessonToModule(dragLesson, mod.id);
        }}
      >
        {/* Module header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: STUDIO_COLORS.navy, color: STUDIO_COLORS.white,
        }}>
          <button type="button" onClick={() => toggleCollapse(mod.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textLight, fontSize: 12, padding: 0 }}>
            {collapsed ? "▶" : "▼"}
          </button>

          {isEditing ? (
            <div style={{ flex: 1, display: "flex", gap: 8 }}>
              <input
                value={editModuleTitle}
                onChange={e => setEditModuleTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveModuleTitle(mod.id); if (e.key === "Escape") setEditingModuleId(null); }}
                autoFocus
                style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: "none", fontSize: 14, fontWeight: 700, background: "rgba(255,255,255,0.15)", color: "#fff" }}
              />
              <StudioButton size="sm" onClick={() => saveModuleTitle(mod.id)}>Save</StudioButton>
              <StudioButton size="sm" variant="ghost" onClick={() => setEditingModuleId(null)} style={{ color: STUDIO_COLORS.textLight }}>Cancel</StudioButton>
            </div>
          ) : (
            <>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: STUDIO_COLORS.white }}>{mod.title}</div>
                <div style={{ fontSize: 11, color: STUDIO_COLORS.textLight, marginTop: 1 }}>
                  {modLessons.length} lesson{modLessons.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button type="button" onClick={() => { setEditingModuleId(mod.id); setEditModuleTitle(mod.title); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textLight, fontSize: 12, padding: "2px 6px" }}>
                Rename
              </button>
              <button type="button" onClick={() => deleteModule(mod.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(248,113,113,0.7)", fontSize: 12, padding: "2px 6px" }}>
                Delete
              </button>
            </>
          )}
        </div>

        {/* Lessons */}
        {!collapsed && (
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            {modLessons.length === 0 ? (
              <div style={{ fontSize: 13, color: STUDIO_COLORS.textMuted, textAlign: "center", padding: "16px 0" }}>
                Drag lessons here or <button type="button" onClick={() => createLesson(mod.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.orange, fontWeight: 700, fontSize: 13, padding: 0 }}>
                  + add a lesson
                </button>
              </div>
            ) : (
              modLessons.map(l => <LessonRow key={l.id} lesson={l} moduleId={mod.id} />)
            )}
            <div style={{ paddingTop: 4 }}>
              <StudioButton size="sm" variant="ghost" onClick={() => createLesson(mod.id)}
                style={{ color: STUDIO_COLORS.orange, fontWeight: 700 }}>
                + Add lesson to this module
              </StudioButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { label: "Modules",  value: modules.length },
          { label: "Lessons",  value: lessons.length },
          { label: "Published",value: lessons.filter(l => l.is_published).length },
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

      {/* Modules */}
      {modules.map(m => <ModuleSection key={m.id} mod={m} />)}

      {/* Unassigned lessons */}
      {lessons.length > 0 && (
        <div
          style={{ border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 10, overflow: "hidden" }}
          onDragOver={e => e.preventDefault()}
          onDrop={() => { if (dragLesson) assignLessonToModule(dragLesson, null); }}
        >
          <div style={{ padding: "12px 16px", background: STUDIO_COLORS.surface, borderBottom: `1px solid ${STUDIO_COLORS.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: STUDIO_COLORS.text }}>
              {modules.length > 0 ? "Unassigned Lessons" : "Lessons"}
            </span>
            <span style={{ marginLeft: 8, fontSize: 11, color: STUDIO_COLORS.textMuted }}>{unassigned.length} lesson{unassigned.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            {unassigned.length === 0 && modules.length > 0 ? (
              <p style={{ fontSize: 13, color: STUDIO_COLORS.textMuted, textAlign: "center", padding: "12px 0" }}>
                All lessons are assigned to modules.
              </p>
            ) : unassigned.length === 0 ? (
              <EmptyState
                icon="▶"
                title="No lessons yet"
                description="Build the first lesson in this course. Lessons can be organized into modules."
                action={<StudioButton onClick={() => createLesson(null)}>+ Create First Lesson</StudioButton>}
              />
            ) : (
              unassigned.map(l => <LessonRow key={l.id} lesson={l} moduleId={null} />)
            )}
          </div>
        </div>
      )}

      {lessons.length === 0 && (
        <EmptyState
          icon="▶"
          title="No lessons yet"
          description="Build the first lesson in this course. Lessons can be organized into modules."
          action={<StudioButton onClick={() => createLesson(null)}>+ Create First Lesson</StudioButton>}
        />
      )}

      {/* Add actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StudioButton onClick={() => createLesson(null)} variant="secondary">
          + Add Lesson
        </StudioButton>

        {!addingModule ? (
          <StudioButton variant="secondary" onClick={() => setAddingModule(true)}>
            + Add Module
          </StudioButton>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StudioInput
              value={newModuleTitle}
              onChange={e => setNewModuleTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createModule(); if (e.key === "Escape") { setAddingModule(false); setNewModuleTitle(""); } }}
              placeholder="Module title"
              autoFocus
              style={{ width: 240 }}
            />
            <StudioButton onClick={createModule} disabled={!newModuleTitle.trim()}>Create</StudioButton>
            <StudioButton variant="secondary" onClick={() => { setAddingModule(false); setNewModuleTitle(""); }}>Cancel</StudioButton>
          </div>
        )}
      </div>
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
          {/* Left: brand + breadcrumb */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: STUDIO_COLORS.orange, marginBottom: 3 }}>
              HCMG U · Training Studio
            </div>
            <Breadcrumb items={[
              { label: "Courses",  href: "/university/admin/courses" },
              { label: course.title },
            ]} />
          </div>

          {/* Right: status + actions */}
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
