"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { UniCourse, UniLesson } from "@/lib/database.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CATEGORIES = [
  { value: "general",    label: "General" },
  { value: "start",      label: "New LO Fast Start" },
  { value: "sales",      label: "Sales & Conversion" },
  { value: "product",    label: "Products & Guidelines" },
  { value: "operations", label: "Systems & Operations" },
  { value: "compliance", label: "Compliance" },
];

const PATH_TAGS = [
  { value: "",               label: "None" },
  { value: "harrys_playbook",label: "Harry's Playbook" },
  { value: "fast_start",     label: "Fast Start" },
  { value: "sales",          label: "Sales" },
  { value: "product",        label: "Product" },
  { value: "operations",     label: "Operations" },
  { value: "compliance",     label: "Compliance" },
];

const PILL_COLORS = [
  { value: "orange", label: "Orange (Fast Start)",    dot: "#f58220" },
  { value: "blue",   label: "Blue (Operations)",      dot: "#60a5fa" },
  { value: "gold",   label: "Gold (Products)",        dot: "#d4a017" },
  { value: "green",  label: "Green (Sales)",          dot: "#34d399" },
  { value: "red",    label: "Red (Compliance)",       dot: "#f87171" },
  { value: "gray",   label: "Gray (General)",         dot: "#b9c5d0" },
];

// ── Input / Field helpers ─────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "#071a2e", display: "block", marginBottom: 6,
    }}>
      {children}
      {required && <span style={{ color: "#f58220", marginLeft: 3 }}>*</span>}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1.5px solid #dfe4e8", background: "#fff",
  fontSize: 14, color: "#071a2e", outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const inputFocusStyle: React.CSSProperties = {
  borderColor: "#f58220",
  boxShadow: "0 0 0 3px rgba(245,130,32,.1)",
};

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { hint?: string }) {
  const [focused, setFocused] = useState(false);
  const { hint, ...rest } = props;
  return (
    <div>
      <input
        {...rest}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), ...props.style }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      />
      {hint && <p style={{ fontSize: 11, color: "#687383", marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle, resize: "vertical", minHeight: 90,
        ...(focused ? inputFocusStyle : {}),
        ...props.style,
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle, cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23687383' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: 36,
        ...(focused ? inputFocusStyle : {}),
        ...props.style,
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "none", border: "none", cursor: "pointer", padding: 0,
      }}
    >
      <div style={{
        width: 40, height: 22, borderRadius: 11,
        background: checked ? "#f58220" : "#dfe4e8",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#142234" }}>{label}</span>
    </button>
  );
}

// ── Lesson Editor (inline, per-lesson modal/panel) ────────────────────────────

interface LessonFormState {
  id?: string;
  title: string;
  description: string;
  video_token: string;
  transcript: string;
  duration_label: string;
  is_published: boolean;
  sort_order: number;
  resources_json: { label: string; storage_path: string }[];
}

const emptyLesson = (sort_order: number): LessonFormState => ({
  title: "", description: "", video_token: "", transcript: "",
  duration_label: "", is_published: false, sort_order,
  resources_json: [],
});

function LessonPanel({
  lesson,
  courseId,
  onSaved,
  onDeleted,
  onClose,
}: {
  lesson: LessonFormState;
  courseId: string;
  onSaved: (l: UniLesson) => void;
  onDeleted?: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<LessonFormState>(lesson);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k: keyof LessonFormState, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      const isNew = !form.id;
      const url   = isNew
        ? "/api/university/admin/lesson"
        : `/api/university/admin/lesson/${form.id}`;
      const method = isNew ? "POST" : "PATCH";
      const body   = isNew
        ? { ...form, course_id: courseId }
        : { ...form };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed"); return; }
      onSaved(data);
      onClose();
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  }

  async function doDelete() {
    if (!form.id) return;
    setDeleting(true); setError("");
    try {
      const res = await fetch(`/api/university/admin/lesson/${form.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Delete failed"); return; }
      onDeleted?.();
      onClose();
    } catch { setError("Network error."); }
    finally { setDeleting(false); }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(7,26,46,0.6)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 580,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 32px 80px rgba(7,26,46,.25)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #dfe4e8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#071a2e", margin: 0 }}>
            {form.id ? "Edit Lesson" : "New Lesson"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#687383", lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel required>Lesson title</FieldLabel>
            <Input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. Structuring the first call"
              autoFocus
            />
          </div>

          <div>
            <FieldLabel>Short description</FieldLabel>
            <Textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Brief summary shown on the course page"
              rows={2}
            />
          </div>

          <div>
            <FieldLabel>Video URL / HeyGen token</FieldLabel>
            <Input
              value={form.video_token}
              onChange={e => set("video_token", e.target.value)}
              placeholder="https://share.heygen.com/... or storage path"
              hint="This is stored securely — never exposed to learners directly."
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <FieldLabel>Duration label</FieldLabel>
              <Input
                value={form.duration_label}
                onChange={e => set("duration_label", e.target.value)}
                placeholder="e.g. 12:18"
              />
            </div>
            <div>
              <FieldLabel>Sort order</FieldLabel>
              <Input
                type="number"
                value={form.sort_order}
                onChange={e => set("sort_order", parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Transcript</FieldLabel>
            <Textarea
              value={form.transcript}
              onChange={e => set("transcript", e.target.value)}
              placeholder="Paste full lesson transcript here (optional)"
              rows={4}
            />
          </div>

          <Toggle
            checked={form.is_published}
            onChange={v => set("is_published", v)}
            label={form.is_published ? "Published — visible to learners" : "Draft — hidden from learners"}
          />

          {error && (
            <div style={{ padding: "10px 14px", background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 9, fontSize: 13, color: "#b91c1c" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px 20px",
          borderTop: "1px solid #dfe4e8",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          {form.id ? (
            confirmDelete ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#687383" }}>Delete this lesson?</span>
                <button
                  onClick={doDelete}
                  disabled={deleting}
                  style={{ padding: "7px 14px", borderRadius: 8, background: "#b91c1c", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ padding: "7px 14px", borderRadius: 8, background: "#f7f8fa", color: "#687383", border: "1px solid #dfe4e8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ padding: "9px 16px", borderRadius: 9, background: "none", border: "1.5px solid #fecaca", color: "#b91c1c", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Delete lesson
              </button>
            )
          ) : <div />}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{ padding: "10px 18px", borderRadius: 9, background: "#f7f8fa", border: "1px solid #dfe4e8", color: "#687383", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "10px 22px", borderRadius: 9,
                background: saving ? "#dfe4e8" : "linear-gradient(135deg,#FF9847,#F37021)",
                color: saving ? "#687383" : "#fff",
                border: "none", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : form.id ? "Save changes" : "Add lesson"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lesson list with reorder ───────────────────────────────────────────────

function LessonList({
  lessons,
  courseId,
  onUpdate,
}: {
  lessons: UniLesson[];
  courseId: string;
  onUpdate: (lessons: UniLesson[]) => void;
}) {
  const [editingLesson, setEditingLesson] = useState<LessonFormState | null>(null);
  const [dragIdx, setDragIdx]             = useState<number | null>(null);

  function openNew() {
    setEditingLesson(emptyLesson(lessons.length));
  }

  function openEdit(l: UniLesson) {
    setEditingLesson({
      id:             l.id,
      title:          l.title,
      description:    l.description ?? "",
      video_token:    l.video_token ?? "",
      transcript:     l.transcript ?? "",
      duration_label: l.duration_label ?? "",
      is_published:   l.is_published,
      sort_order:     l.sort_order,
      resources_json: (l.resources_json as { label: string; storage_path: string }[]) ?? [],
    });
  }

  function handleSaved(saved: UniLesson) {
    const idx = lessons.findIndex(l => l.id === saved.id);
    if (idx >= 0) {
      const next = [...lessons];
      next[idx] = saved;
      onUpdate(next);
    } else {
      onUpdate([...lessons, saved]);
    }
  }

  function handleDeleted(id: string) {
    onUpdate(lessons.filter(l => l.id !== id));
  }

  // Drag reorder
  function onDragStart(idx: number) { setDragIdx(idx); }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx == null || dragIdx === idx) return;
    const next = [...lessons];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    // Persist new sort orders
    next.forEach((l, i) => { l.sort_order = i; });
    setDragIdx(idx);
    onUpdate(next);
    // Fire-and-forget sort order saves
    next.forEach((l, i) => {
      fetch(`/api/university/admin/lesson/${l.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: i }),
      });
    });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#071a2e", margin: 0 }}>Lessons</h2>
          <p style={{ fontSize: 12, color: "#687383", marginTop: 3 }}>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} · Drag to reorder
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 18px", borderRadius: 10,
            background: "#071a2e", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          + Add lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div style={{
          border: "2px dashed #dfe4e8", borderRadius: 12, padding: "40px 24px",
          textAlign: "center", color: "#687383",
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>▶</div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No lessons yet</p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>Add your first lesson to get started.</p>
          <button
            onClick={openNew}
            style={{
              padding: "10px 20px", borderRadius: 10,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            + Add first lesson
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {lessons.map((l, i) => (
            <div
              key={l.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDragEnd={() => setDragIdx(null)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 14px", borderRadius: 10,
                border: "1.5px solid #dfe4e8", background: dragIdx === i ? "#f0f9ff" : "#fafafa",
                cursor: "grab", userSelect: "none",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
            >
              {/* Drag handle */}
              <div style={{ color: "#b9c5d0", fontSize: 14, cursor: "grab", flexShrink: 0 }}>⠿</div>

              {/* Number */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: l.is_published ? "#071a2e" : "#e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
                color: l.is_published ? "#fff" : "#687383",
              }}>
                {i + 1}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#071a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.title}
                </div>
                <div style={{ fontSize: 11, color: "#687383", marginTop: 2, display: "flex", gap: 10 }}>
                  {l.duration_label && <span>⏱ {l.duration_label}</span>}
                  {l.video_token && <span style={{ color: "#34d399" }}>● Video set</span>}
                  <span style={{
                    padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    background: l.is_published ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
                    color: l.is_published ? "#118568" : "#687383",
                    border: `1px solid ${l.is_published ? "rgba(52,211,153,0.2)" : "#dfe4e8"}`,
                  }}>
                    {l.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openEdit(l)}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  border: "1.5px solid #dfe4e8", background: "#fff",
                  fontSize: 12, fontWeight: 600, color: "#071a2e", cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {editingLesson && (
        <LessonPanel
          lesson={editingLesson}
          courseId={courseId}
          onSaved={handleSaved}
          onDeleted={editingLesson.id ? () => handleDeleted(editingLesson.id!) : undefined}
          onClose={() => setEditingLesson(null)}
        />
      )}
    </div>
  );
}

// ── Main CourseEditorForm ─────────────────────────────────────────────────────

type Tab = "details" | "lessons" | "settings";

interface CourseFormState {
  title:          string;
  slug:           string;
  description:    string;
  thumbnail_url:  string;
  category:       string;
  path_tag:       string;
  pill_color:     string;
  duration_label: string;
  is_published:   boolean;
  is_required:    boolean;
}

interface Props {
  mode: "new" | "edit";
  course?: UniCourse;
  initialLessons?: UniLesson[];
}

export function CourseEditorForm({ mode, course, initialLessons = [] }: Props) {
  const router = useRouter();
  const [tab, setTab]       = useState<Tab>("details");
  const [lessons, setLessons] = useState<UniLesson[]>(initialLessons);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  const [form, setForm] = useState<CourseFormState>({
    title:          course?.title          ?? "",
    slug:           course?.slug           ?? "",
    description:    course?.description    ?? "",
    thumbnail_url:  course?.thumbnail_url  ?? "",
    category:       course?.category       ?? "general",
    path_tag:       course?.path_tag       ?? "",
    pill_color:     course?.pill_color     ?? "gray",
    duration_label: course?.duration_label ?? "",
    is_published:   course?.is_published   ?? false,
    is_required:    course?.is_required    ?? false,
  });

  const set = (k: keyof CourseFormState, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const handleTitleChange = useCallback((v: string) => {
    set("title", v);
    if (!slugEdited) set("slug", slugify(v));
  }, [slugEdited]); // eslint-disable-line

  async function saveDetails() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.slug.trim())  { setError("Slug is required");  return; }
    setSaving(true); setError("");
    try {
      const url    = mode === "new" ? "/api/university/admin/course" : `/api/university/admin/course/${course!.id}`;
      const method = mode === "new" ? "POST" : "PATCH";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed"); return; }
      setSaved(true);
      if (mode === "new") {
        router.push(`/university/admin/studio/${data.id}`);
      }
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  }

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    padding: "9px 18px", borderRadius: 8,
    border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 700,
    background: active ? "#071a2e" : "transparent",
    color: active ? "#fff" : "#687383",
    transition: "all 0.15s",
  });

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky", top: 56, zIndex: 20,
        background: "#fff",
        borderBottom: "1px solid #dfe4e8",
        padding: "0 clamp(16px,4vw,48px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 52,
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["details","lessons","settings"] as Tab[]).map(t => (
            <button
              key={t}
              style={TAB_STYLE(tab === t)}
              onClick={() => setTab(t)}
            >
              {t === "details" ? "📋 Details" : t === "lessons" ? `▶ Lessons (${lessons.length})` : "⚙ Settings"}
            </button>
          ))}
        </div>

        {/* Save button + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saved && (
            <span style={{ fontSize: 12, color: "#118568", fontWeight: 600 }}>✓ Saved</span>
          )}
          {error && (
            <span style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{error}</span>
          )}
          {tab === "details" || tab === "settings" ? (
            <button
              onClick={saveDetails}
              disabled={saving}
              style={{
                padding: "9px 20px", borderRadius: 9,
                background: saving ? "#dfe4e8" : "linear-gradient(135deg,#FF9847,#F37021)",
                color: saving ? "#687383" : "#fff",
                border: "none", fontSize: 13, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : mode === "new" ? "Create course →" : "Save changes"}
            </button>
          ) : (
            // Live preview link when on lessons tab
            course && (
              <a
                href={`/university/course/${course.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "9px 16px", borderRadius: 9,
                  border: "1.5px solid #dfe4e8", background: "#fff",
                  color: "#071a2e", fontSize: 12, fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Preview ↗
              </a>
            )
          )}
        </div>
      </div>

      {/* ── Tab: Details ── */}
      {tab === "details" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Status pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: 10,
            background: form.is_published ? "rgba(52,211,153,0.08)" : "#f7f8fa",
            border: `1px solid ${form.is_published ? "rgba(52,211,153,0.25)" : "#dfe4e8"}`,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: form.is_published ? "#34d399" : "#687383",
            }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: form.is_published ? "#118568" : "#687383" }}>
              {form.is_published ? "Published — visible to learners" : "Draft — hidden from learners"}
            </span>
            <button
              type="button"
              onClick={() => set("is_published", !form.is_published)}
              style={{
                marginLeft: "auto", padding: "5px 12px", borderRadius: 7,
                border: "1.5px solid #dfe4e8", background: "#fff",
                fontSize: 12, fontWeight: 600, color: "#071a2e", cursor: "pointer",
              }}
            >
              {form.is_published ? "Unpublish" : "Publish"}
            </button>
          </div>

          <div>
            <FieldLabel required>Course title</FieldLabel>
            <Input
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. Harry's Playbook: The HCMG Standard"
              autoFocus={mode === "new"}
            />
          </div>

          <div>
            <FieldLabel required>URL slug</FieldLabel>
            <Input
              value={form.slug}
              onChange={e => { setSlugEdited(true); set("slug", slugify(e.target.value)); }}
              placeholder="e.g. harrys-playbook"
              hint={`Course will be at: /university/course/${form.slug || "your-slug"}`}
            />
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="What will learners gain from this course?"
              rows={3}
            />
          </div>

          <div>
            <FieldLabel>Thumbnail URL</FieldLabel>
            <Input
              value={form.thumbnail_url}
              onChange={e => set("thumbnail_url", e.target.value)}
              placeholder="https://..."
            />
            {form.thumbnail_url && (
              <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", height: 120, background: "#f7f8fa", border: "1px solid #dfe4e8" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.thumbnail_url}
                  alt="Thumbnail preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          <div>
            <FieldLabel>Duration label</FieldLabel>
            <Input
              value={form.duration_label}
              onChange={e => set("duration_label", e.target.value)}
              placeholder="e.g. 7 modules · 1.4 hours"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <FieldLabel>Category</FieldLabel>
              <Select value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
            <div>
              <FieldLabel>Learning path</FieldLabel>
              <Select value={form.path_tag} onChange={e => set("path_tag", e.target.value)}>
                {PATH_TAGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <FieldLabel>Category badge color</FieldLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {PILL_COLORS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set("pill_color", p.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "7px 12px", borderRadius: 8,
                    border: form.pill_color === p.value ? `2px solid ${p.dot}` : "1.5px solid #dfe4e8",
                    background: form.pill_color === p.value ? `${p.dot}18` : "#fff",
                    cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#071a2e",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
                  {p.label.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            padding: "16px", borderRadius: 10,
            background: "#f7f8fa", border: "1px solid #dfe4e8",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <Toggle
              checked={form.is_required}
              onChange={v => set("is_required", v)}
              label="Required training — learners are assigned automatically"
            />
          </div>
        </div>
      )}

      {/* ── Tab: Lessons ── */}
      {tab === "lessons" && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>
          {mode === "new" ? (
            <div style={{
              textAlign: "center", padding: "60px 0", background: "#f7f8fa",
              borderRadius: 12, border: "1px solid #dfe4e8",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💾</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 8 }}>Save the course first</h3>
              <p style={{ fontSize: 13, color: "#687383", marginBottom: 20 }}>Create the course in the Details tab before adding lessons.</p>
              <button
                onClick={() => setTab("details")}
                style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: "#071a2e", color: "#fff",
                  border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                ← Go to Details
              </button>
            </div>
          ) : (
            <LessonList
              lessons={lessons}
              courseId={course!.id}
              onUpdate={setLessons}
            />
          )}
        </div>
      )}

      {/* ── Tab: Settings ── */}
      {tab === "settings" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{
            padding: "20px", borderRadius: 12,
            background: "#f7f8fa", border: "1px solid #dfe4e8",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <Toggle
              checked={form.is_published}
              onChange={v => set("is_published", v)}
              label={form.is_published ? "Published — visible to learners" : "Draft — hidden from learners"}
            />
            <Toggle
              checked={form.is_required}
              onChange={v => set("is_required", v)}
              label="Required training"
            />
          </div>

          {/* Danger zone */}
          {mode === "edit" && course && (
            <div style={{
              padding: "20px", borderRadius: 12,
              border: "1.5px solid #fecaca", background: "#fff5f5",
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#b91c1c", marginBottom: 8 }}>Danger zone</h3>
              <p style={{ fontSize: 12, color: "#687383", marginBottom: 14 }}>
                Archiving removes this course from all learner views but preserves progress records.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Archive this course? It will be hidden from all learners.")) return;
                  await fetch(`/api/university/admin/course/${course.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ is_published: false }),
                  });
                  router.push("/university/admin/courses");
                }}
                style={{
                  padding: "9px 18px", borderRadius: 9,
                  border: "1.5px solid #fecaca", background: "#fff",
                  color: "#b91c1c", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Archive course
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
