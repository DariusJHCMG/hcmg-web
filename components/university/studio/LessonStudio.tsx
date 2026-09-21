"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UniLesson, UniModule, UniQuizQuestion, LessonType, CompletionMode, UniMediaAsset } from "@/lib/database.types";
import {
  STUDIO_COLORS, StudioInput, StudioTextarea, StudioSelect, FieldLabel,
  StudioToggle, StudioButton, SectionCard, EmptyState, ErrorBanner,
  SaveIndicator, SaveState, StudioTabs, Breadcrumb, LessonTypeBadge, LESSON_TYPE_LABELS,
} from "./StudioPrimitives";
import { MediaPicker } from "./MediaLibrary";

// ── Question editor ───────────────────────────────────────────────────────────

interface QuestionForm {
  id?: string;
  question_text: string;
  question_type: string;
  options: { label: string; is_correct: boolean }[];
  explanation: string;
  points: number;
}

const emptyOption = () => ({ label: "", is_correct: false });

function QuestionEditor({
  question,
  index,
  onSave,
  onDelete,
  onCancel,
}: {
  question: QuestionForm;
  index: number;
  onSave: (q: QuestionForm) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<QuestionForm>(question);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (k: keyof QuestionForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const setOptionLabel = (i: number, v: string) =>
    setField("options", form.options.map((o, idx) => idx === i ? { ...o, label: v } : o));

  const toggleCorrect = (i: number) => {
    const isMultiSelect = form.question_type === "multiple_select";
    setField("options", form.options.map((o, idx) =>
      idx === i ? { ...o, is_correct: !o.is_correct } : (isMultiSelect ? o : { ...o, is_correct: false })
    ));
  };

  const addOption = () => {
    if (form.options.length >= 8) return;
    setField("options", [...form.options, emptyOption()]);
  };

  const removeOption = (i: number) => {
    if (form.options.length <= 2) return;
    setField("options", form.options.filter((_, idx) => idx !== i));
  };

  function validate() {
    if (!form.question_text.trim()) return "Question text is required";
    if (form.question_type !== "short_answer" && form.options.some(o => !o.label.trim())) return "All answer options must have text";
    if (form.question_type !== "short_answer" && !form.options.some(o => o.is_correct)) return "At least one correct answer is required";
    return null;
  }

  function submit() {
    const err = validate();
    if (err) { setError(err); return; }
    onSave(form);
  }

  const isMulti = form.question_type === "multiple_select";
  const isTF    = form.question_type === "true_false";

  // Auto-populate true/false options
  useEffect(() => {
    if (isTF && form.options.length !== 2) {
      setField("options", [{ label: "True", is_correct: false }, { label: "False", is_correct: false }]);
    }
  }, [isTF]); // eslint-disable-line

  return (
    <div style={{
      padding: "20px", border: `1.5px solid ${STUDIO_COLORS.orange}30`, borderRadius: 12,
      background: `${STUDIO_COLORS.orange}04`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: STUDIO_COLORS.text, margin: 0 }}>
          {form.id ? `Question ${index + 1}` : "New Question"}
        </h4>
        <StudioSelect
          value={form.question_type}
          onChange={e => setField("question_type", e.target.value)}
          style={{ width: 180 }}
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="multiple_select">Multiple Select</option>
          <option value="true_false">True / False</option>
          <option value="short_answer">Short Answer</option>
          <option value="scenario">Scenario</option>
        </StudioSelect>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FieldLabel required>Question</FieldLabel>
          <StudioTextarea
            value={form.question_text}
            onChange={e => setField("question_text", e.target.value)}
            placeholder="e.g. What is the minimum down payment for an FHA loan?"
            rows={2}
            autoFocus
          />
        </div>

        {form.question_type !== "short_answer" && (
          <div>
            <FieldLabel required>
              {isMulti ? "Answer options (select all correct)" : isTF ? "Answer options (select correct)" : "Answer options (select correct)"}
            </FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleCorrect(i)}
                    style={{
                      width: isMulti ? 18 : 18, height: 18, flexShrink: 0,
                      borderRadius: isMulti ? 4 : "50%",
                      border: `2px solid ${opt.is_correct ? STUDIO_COLORS.orange : STUDIO_COLORS.border}`,
                      background: opt.is_correct ? STUDIO_COLORS.orange : STUDIO_COLORS.white,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    aria-label={`Mark option ${i + 1} as correct`}
                  >
                    {opt.is_correct && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                  </button>
                  {isTF ? (
                    <div style={{ flex: 1, padding: "9px 13px", borderRadius: 8, border: `1.5px solid ${STUDIO_COLORS.border}`, background: STUDIO_COLORS.surface, fontSize: 14, fontWeight: 600, color: STUDIO_COLORS.text }}>
                      {opt.label}
                    </div>
                  ) : (
                    <StudioInput
                      value={opt.label}
                      onChange={e => setOptionLabel(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      style={{ flex: 1 }}
                    />
                  )}
                  {!isTF && form.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 16, padding: "0 4px" }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              {!isTF && form.options.length < 8 && (
                <button type="button" onClick={addOption}
                  style={{ background: "none", border: `1px dashed ${STUDIO_COLORS.border}`, cursor: "pointer", borderRadius: 8, padding: "8px", fontSize: 12, color: STUDIO_COLORS.textMuted, width: "100%" }}>
                  + Add option
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: STUDIO_COLORS.textMuted, marginTop: 4 }}>
              {isMulti ? "Click to select all correct answers" : "Click to select the correct answer"}
            </p>
          </div>
        )}

        <div>
          <FieldLabel>Explanation (shown after attempt)</FieldLabel>
          <StudioTextarea
            value={form.explanation}
            onChange={e => setField("explanation", e.target.value)}
            placeholder="Explain why the correct answer is right. This helps learners understand."
            rows={2}
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 100 }}>
            <FieldLabel>Points</FieldLabel>
            <StudioInput type="number" min={1} max={10} value={form.points} onChange={e => setField("points", +e.target.value)} />
          </div>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

        <div style={{ display: "flex", gap: 8 }}>
          <StudioButton onClick={submit}>Save Question</StudioButton>
          <StudioButton variant="secondary" onClick={onCancel}>Cancel</StudioButton>
          {onDelete && form.id && (
            <StudioButton variant="danger" onClick={onDelete} style={{ marginLeft: "auto" }}>Delete</StudioButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Knowledge Check builder ───────────────────────────────────────────────────

function KnowledgeCheckTab({
  lessonId,
  questions: initialQuestions,
  onQuestionsChange,
}: {
  lessonId: string;
  questions: UniQuizQuestion[];
  onQuestionsChange: (qs: UniQuizQuestion[]) => void;
}) {
  const [questions, setQuestions] = useState<UniQuizQuestion[]>(initialQuestions);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState("");

  const newQuestion = (): QuestionForm => ({
    question_text: "", question_type: "multiple_choice",
    options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
    explanation: "", points: 1,
  });

  async function saveQuestion(form: QuestionForm, existingId?: string) {
    try {
      const payload = {
        lesson_id:     lessonId,
        question_text: form.question_text,
        question_type: form.question_type,
        options_json:  form.options,
        explanation:   form.explanation || null,
        points:        form.points,
        sort_order:    existingId ? (questions.findIndex(q => q.id === existingId)) : questions.length,
      };

      if (existingId) {
        const res = await fetch(`/api/university/admin/questions/${existingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question_text: payload.question_text, question_type: payload.question_type, options_json: payload.options_json, explanation: payload.explanation, points: payload.points }),
        });
        if (!res.ok) { setError("Save failed"); return; }
        const updated = await res.json();
        const next = questions.map(q => q.id === existingId ? updated : q);
        setQuestions(next);
        onQuestionsChange(next);
      } else {
        const res = await fetch("/api/university/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { setError("Save failed"); return; }
        const created = await res.json();
        const next = [...questions, created];
        setQuestions(next);
        onQuestionsChange(next);
      }
      setEditingIdx(null);
      setAddingNew(false);
    } catch { setError("Network error"); }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/university/admin/questions/${id}`, { method: "DELETE" });
    const next = questions.filter(q => q.id !== id);
    setQuestions(next);
    onQuestionsChange(next);
    setEditingIdx(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: STUDIO_COLORS.text, margin: 0 }}>Knowledge Check</h3>
          <p style={{ fontSize: 13, color: STUDIO_COLORS.textMuted, marginTop: 3 }}>
            {questions.length} question{questions.length !== 1 ? "s" : ""} — completed after the lesson
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {questions.length === 0 && !addingNew && (
        <EmptyState
          icon="✏"
          title="No questions yet"
          description="Add knowledge check questions to test learner understanding after this lesson."
          action={<StudioButton onClick={() => setAddingNew(true)}>+ Add First Question</StudioButton>}
        />
      )}

      {questions.map((q, i) => (
        editingIdx === i ? (
          <QuestionEditor
            key={q.id}
            question={{
              id: q.id,
              question_text: q.question_text,
              question_type: q.question_type,
              options: (q.options_json as { label: string; is_correct: boolean }[]) ?? [],
              explanation: q.explanation ?? "",
              points: (q as unknown as { points?: number }).points ?? 1,
            }}
            index={i}
            onSave={form => saveQuestion(form, q.id)}
            onDelete={() => deleteQuestion(q.id)}
            onCancel={() => setEditingIdx(null)}
          />
        ) : (
          <div key={q.id} style={{
            padding: "14px 16px", borderRadius: 10,
            border: `1px solid ${STUDIO_COLORS.border}`, background: STUDIO_COLORS.white,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: STUDIO_COLORS.navy, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: STUDIO_COLORS.text, marginBottom: 6 }}>{q.question_text}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {(q.options_json as { label: string; is_correct: boolean }[]).map((opt, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 10px", borderRadius: 6,
                      background: opt.is_correct ? "rgba(52,211,153,0.08)" : STUDIO_COLORS.surface,
                      border: `1px solid ${opt.is_correct ? "rgba(52,211,153,0.25)" : STUDIO_COLORS.border}`,
                      fontSize: 13,
                    }}>
                      <span style={{ color: opt.is_correct ? STUDIO_COLORS.greenDark : STUDIO_COLORS.textMuted, fontWeight: opt.is_correct ? 700 : 400 }}>
                        {opt.is_correct ? "✓" : "○"}
                      </span>
                      <span style={{ color: opt.is_correct ? STUDIO_COLORS.text : STUDIO_COLORS.textMuted }}>{opt.label}</span>
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(96,165,250,0.08)", borderRadius: 6, fontSize: 12, color: "#1e40af" }}>
                    ℹ <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
              <StudioButton size="sm" variant="secondary" onClick={() => setEditingIdx(i)}>Edit</StudioButton>
            </div>
          </div>
        )
      ))}

      {addingNew && (
        <QuestionEditor
          question={newQuestion()}
          index={questions.length}
          onSave={form => saveQuestion(form)}
          onCancel={() => setAddingNew(false)}
        />
      )}

      {!addingNew && questions.length > 0 && (
        <StudioButton variant="secondary" onClick={() => setAddingNew(true)}>+ Add Question</StudioButton>
      )}
    </div>
  );
}

// ── Transcript editor ─────────────────────────────────────────────────────────

function TranscriptEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(!value);

  const lines = value.split("\n").filter(Boolean);

  const highlighted = search.trim()
    ? lines.map(line => line.toLowerCase().includes(search.toLowerCase())
        ? `<mark style="background:rgba(245,130,32,0.25);border-radius:2px">${line}</mark>`
        : line)
    : lines;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StudioInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search transcript…"
          style={{ flex: 1 }}
        />
        <StudioButton
          size="sm"
          variant={editMode ? "primary" : "secondary"}
          onClick={() => setEditMode(e => !e)}
        >
          {editMode ? "Preview" : "Edit"}
        </StudioButton>
      </div>

      {editMode ? (
        <div>
          <StudioTextarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={"00:00\nWelcome to HCMG University...\n\n00:14\nToday we're going to cover..."}
            style={{ minHeight: 320, fontFamily: "monospace", fontSize: 13, lineHeight: 1.7 }}
          />
          <p style={{ fontSize: 11, color: STUDIO_COLORS.textMuted, marginTop: 4 }}>
            Optional: prefix lines with timestamps in HH:MM or MM:SS format for time-coded display
          </p>
        </div>
      ) : value ? (
        <div style={{
          border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 10,
          padding: "16px", maxHeight: 400, overflowY: "auto",
          background: STUDIO_COLORS.surface,
        }}>
          {highlighted.map((line, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <p
                style={{ fontSize: 14, lineHeight: 1.7, color: STUDIO_COLORS.text, margin: 0 }}
                dangerouslySetInnerHTML={{ __html: line }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          border: `2px dashed ${STUDIO_COLORS.border}`, borderRadius: 10, padding: "24px",
          textAlign: "center", color: STUDIO_COLORS.textMuted, fontSize: 13,
        }}>
          No transcript. Click Edit to add one.
        </div>
      )}
    </div>
  );
}

// ── Lesson Studio main ────────────────────────────────────────────────────────

type LessonTab = "details" | "media" | "transcript" | "resources" | "knowledge_check" | "completion";

interface ResourceItem { label: string; storage_path: string }

export interface LessonStudioProps {
  courseId: string;
  courseTitle: string;
  lesson: UniLesson;
  module?: UniModule | null;
  questions: UniQuizQuestion[];
  isAdmin: boolean;
}

export function LessonStudio({
  courseId, courseTitle, lesson: initialLesson, module, questions: initialQuestions, isAdmin,
}: LessonStudioProps) {
  const router = useRouter();
  const [lesson, setLesson]         = useState(initialLesson);
  const [questions, setQuestions]   = useState(initialQuestions);
  const [tab, setTab]               = useState<LessonTab>("details");
  const [saveState, setSaveState]   = useState<SaveState>("idle");
  const [error, setError]           = useState("");

  // Media picker: which field is being picked
  const [pickerFor, setPickerFor] = useState<"video" | "thumbnail" | "caption" | null>(null);

  // Form state
  const [details, setDetails] = useState<{ title: string; lesson_type: LessonType; description: string; duration_label: string; duration_secs: number }>({
    title:          lesson.title,
    lesson_type:    (lesson.lesson_type ?? "video") as LessonType,
    description:    lesson.description ?? "",
    duration_label: lesson.duration_label ?? "",
    duration_secs:  lesson.duration_secs ?? 0,
  });
  const [media, setMedia] = useState({
    video_token:   lesson.video_token ?? "",
    thumbnail_url: lesson.thumbnail_url ?? "",
    caption_url:   lesson.caption_url ?? "",
  });
  const [transcript, setTranscript] = useState(lesson.transcript ?? "");
  const [resources, setResources]   = useState<ResourceItem[]>(
    (lesson.resources_json as ResourceItem[]) ?? []
  );
  const [completion, setCompletion] = useState<{ completion_mode: CompletionMode; completion_threshold_pct: number; is_published: boolean }>({
    completion_mode:          (lesson.completion_mode ?? "watch_pct") as CompletionMode,
    completion_threshold_pct: lesson.completion_threshold_pct ?? 80,
    is_published:             lesson.is_published,
  });

  async function save(field?: string) {
    setSaveState("saving"); setError("");
    try {
      const body: Record<string, unknown> = {};
      if (!field || field === "details")    { Object.assign(body, details); }
      if (!field || field === "media")      { Object.assign(body, media); }
      if (!field || field === "transcript") { body.transcript = transcript; }
      if (!field || field === "resources")  { body.resources_json = resources; }
      if (!field || field === "completion") { Object.assign(body, completion); }

      const res = await fetch(`/api/university/admin/lesson/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Save failed"); setSaveState("error"); return; }
      const updated = await res.json();
      setLesson(updated);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch { setError("Network error"); setSaveState("error"); }
  }

  function addResource() {
    setResources(r => [...r, { label: "", storage_path: "" }]);
  }
  function updateResource(i: number, k: keyof ResourceItem, v: string) {
    setResources(r => r.map((res, idx) => idx === i ? { ...res, [k]: v } : res));
  }
  function removeResource(i: number) {
    setResources(r => r.filter((_, idx) => idx !== i));
  }

  const tabs = [
    { id: "details" as LessonTab,         label: "Details" },
    { id: "media" as LessonTab,           label: "Media" },
    { id: "transcript" as LessonTab,      label: "Transcript" },
    { id: "resources" as LessonTab,       label: "Resources",      badge: resources.length || undefined },
    { id: "knowledge_check" as LessonTab, label: "Knowledge Check", badge: questions.length || undefined },
    { id: "completion" as LessonTab,      label: "Completion" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: STUDIO_COLORS.white, minHeight: "100vh" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: STUDIO_COLORS.navy,
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        padding: "0 clamp(16px,4vw,48px)",
      }}>
        {/* Top bar */}
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: STUDIO_COLORS.orange, marginBottom: 3 }}>
              Lesson Editor
            </div>
            <Breadcrumb items={[
              { label: "Courses",   href: "/university/admin/courses" },
              { label: courseTitle, href: `/university/admin/studio/${courseId}?tab=curriculum` },
              { label: lesson.title },
            ]} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SaveIndicator state={saveState} />
            {/* Publish toggle (admin only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={async () => {
                  const next = !completion.is_published;
                  setCompletion(c => ({ ...c, is_published: next }));
                  await fetch(`/api/university/admin/lesson/${lesson.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ is_published: next }),
                  });
                  setLesson(l => ({ ...l, is_published: next }));
                }}
                style={{
                  padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                  border: lesson.is_published ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.15)",
                  background: lesson.is_published ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
                  color: lesson.is_published ? STUDIO_COLORS.green : STUDIO_COLORS.textLight,
                  cursor: "pointer", letterSpacing: "0.5px", textTransform: "uppercase",
                }}
              >
                {lesson.is_published ? "● Published" : "○ Draft"}
              </button>
            )}
            <StudioButton size="sm" onClick={() => save()} disabled={saveState === "saving"}>
              {saveState === "saving" ? "Saving…" : "Save"}
            </StudioButton>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              style={{
                padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer",
                fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? "#fff" : STUDIO_COLORS.textLight,
                borderBottom: `2px solid ${tab === t.id ? STUDIO_COLORS.orange : "transparent"}`,
                fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
              }}
            >
              {t.label}
              {t.badge != null && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px",
                  background: tab === t.id ? STUDIO_COLORS.orange : "rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 80px" }}>
        {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

        {/* ── Details ── */}
        {tab === "details" && (
          <SectionCard title="Lesson Details">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <FieldLabel required>Lesson title</FieldLabel>
                <StudioInput
                  value={details.title}
                  onChange={e => setDetails(d => ({ ...d, title: e.target.value }))}
                  placeholder="e.g. FHA Borrower Eligibility"
                />
              </div>

              <div>
                <FieldLabel>Lesson type</FieldLabel>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(LESSON_TYPE_LABELS).map(([key, cfg]) => (
                    <button key={key} type="button"
                      onClick={() => setDetails(d => ({ ...d, lesson_type: key as LessonType }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                        border: details.lesson_type === key ? `2px solid ${cfg.color}` : `1.5px solid ${STUDIO_COLORS.border}`,
                        background: details.lesson_type === key ? `${cfg.color}12` : STUDIO_COLORS.white,
                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                        color: details.lesson_type === key ? cfg.color : STUDIO_COLORS.textMuted,
                      }}
                    >
                      <span>{cfg.icon}</span> {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>Description</FieldLabel>
                <StudioTextarea
                  value={details.description}
                  onChange={e => setDetails(d => ({ ...d, description: e.target.value }))}
                  placeholder="Brief summary shown on the course outline"
                  rows={2}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FieldLabel>Duration label</FieldLabel>
                  <StudioInput
                    value={details.duration_label}
                    onChange={e => setDetails(d => ({ ...d, duration_label: e.target.value }))}
                    placeholder="e.g. 12:18"
                  />
                </div>
                <div>
                  <FieldLabel>Duration in seconds</FieldLabel>
                  <StudioInput
                    type="number" min={0}
                    value={details.duration_secs || ""}
                    onChange={e => setDetails(d => ({ ...d, duration_secs: +e.target.value }))}
                    placeholder="e.g. 738"
                  />
                </div>
              </div>

              <div style={{ paddingTop: 4 }}>
                <StudioButton onClick={() => save("details")} disabled={saveState === "saving"}>
                  Save Details
                </StudioButton>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Media ── */}
        {tab === "media" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {(details.lesson_type === "video" || !details.lesson_type) && (
              <SectionCard title="Video">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Video preview */}
                  {media.video_token && (
                    <div style={{
                      borderRadius: 10, overflow: "hidden",
                      background: STUDIO_COLORS.navy, aspectRatio: "16/9",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid rgba(255,255,255,0.1)`,
                    }}>
                      {media.video_token.startsWith("http") ? (
                        <video
                          src={media.video_token}
                          controls
                          poster={media.thumbnail_url || undefined}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <div style={{ textAlign: "center", color: STUDIO_COLORS.textMuted, padding: 20 }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>▶</div>
                          <div style={{ fontSize: 12 }}>Video token set — preview available after publishing</div>
                          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>{media.video_token.substring(0, 40)}…</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <FieldLabel>Video source URL or token</FieldLabel>
                    <div style={{ display: "flex", gap: 8 }}>
                      <StudioInput
                        value={media.video_token}
                        onChange={e => setMedia(m => ({ ...m, video_token: e.target.value }))}
                        placeholder="https://share.heygen.com/… or storage path"
                        hint="Stored securely — the actual URL is resolved server-side and never exposed to learners directly."
                      />
                      <StudioButton size="sm" variant="secondary" onClick={() => setPickerFor("video")}>
                        📂 Library
                      </StudioButton>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Thumbnail / poster image URL</FieldLabel>
                    <div style={{ display: "flex", gap: 8 }}>
                      <StudioInput
                        value={media.thumbnail_url}
                        onChange={e => setMedia(m => ({ ...m, thumbnail_url: e.target.value }))}
                        placeholder="https://…"
                      />
                      <StudioButton size="sm" variant="secondary" onClick={() => setPickerFor("thumbnail")}>
                        📂 Library
                      </StudioButton>
                    </div>
                    {media.thumbnail_url && (
                      <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", height: 90, background: STUDIO_COLORS.surface, border: `1px solid ${STUDIO_COLORS.border}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={media.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Captions (VTT) URL</FieldLabel>
                    <div style={{ display: "flex", gap: 8 }}>
                      <StudioInput
                        value={media.caption_url}
                        onChange={e => setMedia(m => ({ ...m, caption_url: e.target.value }))}
                        placeholder="https://… or /captions/lesson-id.vtt"
                      />
                      <StudioButton size="sm" variant="secondary" onClick={() => setPickerFor("caption")}>
                        📂 Library
                      </StudioButton>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {details.lesson_type === "text" && (
              <SectionCard title="Article Content">
                <div style={{ padding: "24px", background: STUDIO_COLORS.surface, borderRadius: 8, textAlign: "center", color: STUDIO_COLORS.textMuted, fontSize: 13 }}>
                  Rich text article editing coming soon. Use the Transcript tab to write text content for now.
                </div>
              </SectionCard>
            )}

            <div style={{ paddingTop: 4 }}>
              <StudioButton onClick={() => save("media")} disabled={saveState === "saving"}>Save Media</StudioButton>
            </div>
          </div>
        )}

        {/* ── Transcript ── */}
        {tab === "transcript" && (
          <SectionCard title="Transcript" description="Full lesson text for accessibility and learner reference">
            <TranscriptEditor value={transcript} onChange={setTranscript} />
            <div style={{ marginTop: 16 }}>
              <StudioButton onClick={() => save("transcript")} disabled={saveState === "saving"}>Save Transcript</StudioButton>
            </div>
          </SectionCard>
        )}

        {/* ── Resources ── */}
        {tab === "resources" && (
          <SectionCard
            title="Resources"
            description="Downloadable files and links available to learners"
            actions={<StudioButton size="sm" onClick={addResource}>+ Add Resource</StudioButton>}
          >
            {resources.length === 0 ? (
              <EmptyState
                icon="📎"
                title="No resources yet"
                description="Add PDFs, guides, forms, or external links to support this lesson."
                action={<StudioButton onClick={addResource}>+ Add Resource</StudioButton>}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {resources.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <StudioInput
                      value={r.label}
                      onChange={e => updateResource(i, "label", e.target.value)}
                      placeholder="Label (e.g. FHA Guidelines PDF)"
                      style={{ flex: "0 0 220px" }}
                    />
                    <StudioInput
                      value={r.storage_path}
                      onChange={e => updateResource(i, "storage_path", e.target.value)}
                      placeholder="URL or storage path"
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={() => removeResource(i)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 18, padding: "10px 4px" }}>
                      ×
                    </button>
                  </div>
                ))}
                <div style={{ paddingTop: 8 }}>
                  <StudioButton onClick={() => save("resources")} disabled={saveState === "saving"}>Save Resources</StudioButton>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Knowledge Check ── */}
        {tab === "knowledge_check" && (
          <KnowledgeCheckTab
            lessonId={lesson.id}
            questions={questions}
            onQuestionsChange={setQuestions}
          />
        )}

        {/* ── Completion ── */}
        {tab === "completion" && (
          <SectionCard title="Completion Settings" description="Define what the learner must do to complete this lesson">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <FieldLabel>Completion mode</FieldLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { value: "watch_pct",  label: "Watch percentage",      desc: "Lesson marked complete when learner watches the required percentage" },
                    { value: "quiz_pass",  label: "Pass knowledge check",  desc: "Lesson marked complete when learner passes the attached quiz" },
                    { value: "manual",     label: "Manual completion",     desc: "Learner manually marks the lesson as complete" },
                    { value: "any",        label: "Any activity",          desc: "Lesson marked complete when learner opens it" },
                  ].map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setCompletion(c => ({ ...c, completion_mode: opt.value as CompletionMode }))}
                      style={{
                        display: "flex", gap: 12, padding: "12px 14px", borderRadius: 9, textAlign: "left",
                        border: completion.completion_mode === opt.value ? `2px solid ${STUDIO_COLORS.orange}` : `1.5px solid ${STUDIO_COLORS.border}`,
                        background: completion.completion_mode === opt.value ? `${STUDIO_COLORS.orange}06` : STUDIO_COLORS.white,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                        border: `2px solid ${completion.completion_mode === opt.value ? STUDIO_COLORS.orange : STUDIO_COLORS.border}`,
                        background: completion.completion_mode === opt.value ? STUDIO_COLORS.orange : STUDIO_COLORS.white,
                      }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: STUDIO_COLORS.text }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {completion.completion_mode === "watch_pct" && (
                <div>
                  <FieldLabel>Required watch percentage</FieldLabel>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StudioInput
                      type="range" min={50} max={100} step={5}
                      value={completion.completion_threshold_pct}
                      onChange={e => setCompletion(c => ({ ...c, completion_threshold_pct: +e.target.value }))}
                      style={{ width: 200, padding: "4px 0" }}
                    />
                    <span style={{ fontSize: 16, fontWeight: 800, color: STUDIO_COLORS.orange, minWidth: 40 }}>
                      {completion.completion_threshold_pct}%
                    </span>
                  </div>
                </div>
              )}

              <StudioButton onClick={() => save("completion")} disabled={saveState === "saving"}>Save Completion Settings</StudioButton>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Media picker modals */}
      {pickerFor === "video" && (
        <MediaPicker
          mediaType="video"
          onPick={(asset: UniMediaAsset) => {
            setMedia(m => ({ ...m, video_token: asset.storage_path }));
            setPickerFor(null);
          }}
          onClose={() => setPickerFor(null)}
        />
      )}
      {pickerFor === "thumbnail" && (
        <MediaPicker
          mediaType="image"
          onPick={(asset: UniMediaAsset) => {
            setMedia(m => ({ ...m, thumbnail_url: asset.storage_path }));
            setPickerFor(null);
          }}
          onClose={() => setPickerFor(null)}
        />
      )}
      {pickerFor === "caption" && (
        <MediaPicker
          mediaType="caption"
          onPick={(asset: UniMediaAsset) => {
            setMedia(m => ({ ...m, caption_url: asset.storage_path }));
            setPickerFor(null);
          }}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}
