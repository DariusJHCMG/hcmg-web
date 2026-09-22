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


// ── Text Article Editor ───────────────────────────────────────────────────────
// A clean inline content editor for Text-type lessons, matching CreatorLMS style.

function TextArticleEditor({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function insertBlock(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const before = value.slice(0, start);
    const after  = value.slice(el.selectionEnd);
    // Add newline before prefix if needed
    const sep = before.length > 0 && !before.endsWith("\n\n") ? "\n\n" : "";
    const inserted = `${sep}${prefix}`;
    const next = before + inserted + after;
    onChange(next);
    setShowAddMenu(false);
    // Move cursor to end of inserted text
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = (before + inserted).length;
    }, 0);
  }

  const ADD_BLOCKS = [
    { label: "Paragraph",  action: () => insertBlock("") },
    { label: "Heading 1",  action: () => insertBlock("# ") },
    { label: "Heading 2",  action: () => insertBlock("## ") },
    { label: "Heading 3",  action: () => insertBlock("### ") },
    { label: "Bullet list",action: () => insertBlock("- ") },
    { label: "Numbered list", action: () => insertBlock("1. ") },
    { label: "Quote block",action: () => insertBlock("> ") },
    { label: "Code block", action: () => insertBlock("```\n\n```") },
    { label: "Divider",    action: () => insertBlock("---") },
  ];

  return (
    <div style={{
      background: STUDIO_COLORS.white, borderRadius: 12,
      border: `1px solid ${STUDIO_COLORS.border}`,
      overflow: "visible", position: "relative",
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between",
        padding: "10px 16px", borderBottom: `1px solid ${STUDIO_COLORS.border}`,
        background: STUDIO_COLORS.surface,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: STUDIO_COLORS.text }}>Article Content</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowAddMenu(m => !m)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${STUDIO_COLORS.border}`,
                background: STUDIO_COLORS.white, cursor: "pointer",
                fontSize: 12, fontWeight: 600, color: STUDIO_COLORS.textMuted,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Insert block
            </button>
            {showAddMenu && (
              <div style={{
                position: "absolute", top: "100%", right: 0, zIndex: 50,
                marginTop: 4, background: STUDIO_COLORS.white,
                border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 180, overflow: "hidden",
              }}>
                {ADD_BLOCKS.map(b => (
                  <button
                    key={b.label} type="button"
                    onClick={b.action}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "9px 14px", border: "none", background: "transparent",
                      cursor: "pointer", fontSize: 13, color: STUDIO_COLORS.text,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = STUDIO_COLORS.surface)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            style={{
              padding: "5px 14px", borderRadius: 7,
              background: STUDIO_COLORS.orange, color: "#fff",
              border: "none", cursor: saving ? "not-allowed" : "pointer",
              fontSize: 12, fontWeight: 700, opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={"Start writing your lesson content here...\n\nYou can use Markdown:\n# Heading 1\n## Heading 2\n- bullet list\n1. numbered list\n> quote block\n**bold** _italic_"}
        style={{
          width: "100%", minHeight: 480, border: "none", outline: "none",
          padding: "24px 28px", resize: "vertical", boxSizing: "border-box",
          fontSize: 15, lineHeight: 1.75, color: STUDIO_COLORS.text,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          background: "transparent",
        }}
      />

      {/* Bottom hint */}
      <div style={{
        padding: "8px 16px", borderTop: `1px solid ${STUDIO_COLORS.border}`,
        background: STUDIO_COLORS.surface, fontSize: 11, color: STUDIO_COLORS.textMuted,
      }}>
        Markdown supported — use # for headings, ** for bold, _ for italic, - for bullets.
        {value.length > 0 && <span style={{ marginLeft: 12 }}>{value.length.toLocaleString()} characters</span>}
      </div>
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
  const [pickerFor, setPickerFor] = useState<"video" | "audio" | "thumbnail" | "caption" | null>(null);

  // Signed URL for studio video preview (storage paths are not directly playable)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Settings panel state (right column)
  const [allowPreview, setAllowPreview]   = useState(false);
  const [prerequisites, setPrerequisites] = useState(false);
  const [dripEnabled, setDripEnabled]     = useState(false);

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

  // Fetch a signed preview URL whenever video_token changes (storage paths need signing)
  useEffect(() => {
    const token = media.video_token;
    if (!token) { setPreviewUrl(null); return; }
    if (token.startsWith("http")) { setPreviewUrl(token); return; }
    // Storage path — call the video-url API (admin bypass is built in)
    setPreviewLoading(true);
    fetch(`/api/university/video-url?lesson_id=${lesson.id}`)
      .then(r => r.json())
      .then(d => setPreviewUrl(d.url ?? null))
      .catch(() => setPreviewUrl(null))
      .finally(() => setPreviewLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.video_token, lesson.id]);

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

  async function togglePublish() {
    const next = !completion.is_published;
    setCompletion(c => ({ ...c, is_published: next }));
    await fetch(`/api/university/admin/lesson/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: next }),
    });
    setLesson(l => ({ ...l, is_published: next }));
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

  // ── Settings panel (right column) ──────────────────────────────────────────
  function SettingsPanel() {
    return (
      <div style={{
        width: 300, flexShrink: 0,
        border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 12,
        background: STUDIO_COLORS.white, overflow: "hidden",
        alignSelf: "flex-start", position: "sticky", top: 80,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "14px 18px", borderBottom: `1px solid ${STUDIO_COLORS.border}`,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={STUDIO_COLORS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: STUDIO_COLORS.text }}>Settings</span>
        </div>

        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Visibility */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: STUDIO_COLORS.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              Visibility
              <span title="Controls whether learners can see this lesson" style={{ width: 14, height: 14, borderRadius: "50%", background: STUDIO_COLORS.border, color: STUDIO_COLORS.textMuted, fontSize: 9, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>i</span>
            </div>
            {isAdmin ? (
              <div style={{ display: "flex", borderRadius: 8, border: `1.5px solid ${STUDIO_COLORS.border}`, overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => completion.is_published && togglePublish()}
                  style={{
                    flex: 1, padding: "8px 0", border: "none",
                    background: !completion.is_published ? STUDIO_COLORS.surface : STUDIO_COLORS.white,
                    cursor: "pointer", fontSize: 12, fontWeight: !completion.is_published ? 700 : 500,
                    color: !completion.is_published ? STUDIO_COLORS.text : STUDIO_COLORS.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => !completion.is_published && togglePublish()}
                  style={{
                    flex: 1, padding: "8px 0", border: "none",
                    background: completion.is_published ? STUDIO_COLORS.orange : STUDIO_COLORS.white,
                    cursor: "pointer", fontSize: 12, fontWeight: completion.is_published ? 700 : 500,
                    color: completion.is_published ? "#fff" : STUDIO_COLORS.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    borderLeft: `1px solid ${STUDIO_COLORS.border}`,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/></svg>
                  Publish
                </button>
              </div>
            ) : (
              <div style={{
                padding: "10px 12px", borderRadius: 8,
                background: completion.is_published ? "rgba(52,211,153,0.08)" : STUDIO_COLORS.surface,
                border: `1.5px solid ${completion.is_published ? "rgba(52,211,153,0.3)" : STUDIO_COLORS.border}`,
                fontSize: 12,
              }}>
                <span style={{ fontWeight: 700, color: completion.is_published ? STUDIO_COLORS.greenDark : STUDIO_COLORS.textMuted }}>
                  {completion.is_published ? "✓ Published" : "Draft"}
                </span>
                <span style={{ color: STUDIO_COLORS.textMuted, marginLeft: 6 }}>
                  — publish requires Admin access
                </span>
              </div>
            )}
          </div>

          {/* Allow Lesson Preview */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: STUDIO_COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
                Allow Lesson Preview
                <span title="Allow non-enrolled users to preview this lesson" style={{ width: 14, height: 14, borderRadius: "50%", background: STUDIO_COLORS.border, color: STUDIO_COLORS.textMuted, fontSize: 9, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>i</span>
              </div>
              <button
                type="button"
                onClick={() => setAllowPreview(v => !v)}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: allowPreview ? STUDIO_COLORS.orange : STUDIO_COLORS.border,
                  position: "relative", border: "none", cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: allowPreview ? 21 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                }} />
              </button>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: STUDIO_COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
                Prerequisites
                <span title="Require other lessons to be completed first" style={{ width: 14, height: 14, borderRadius: "50%", background: STUDIO_COLORS.border, color: STUDIO_COLORS.textMuted, fontSize: 9, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>i</span>
              </div>
              <button
                type="button"
                onClick={() => setPrerequisites(v => !v)}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: prerequisites ? STUDIO_COLORS.orange : STUDIO_COLORS.border,
                  position: "relative", border: "none", cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: prerequisites ? 21 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                }} />
              </button>
            </div>
          </div>

          {/* Drip Settings */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: STUDIO_COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
                Drip Settings
                <span title="Schedule when this lesson becomes available" style={{ width: 14, height: 14, borderRadius: "50%", background: STUDIO_COLORS.border, color: STUDIO_COLORS.textMuted, fontSize: 9, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>i</span>
              </div>
              <button
                type="button"
                onClick={() => setDripEnabled(v => !v)}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: dripEnabled ? STUDIO_COLORS.orange : STUDIO_COLORS.border,
                  position: "relative", border: "none", cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: dripEnabled ? 21 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                }} />
              </button>
            </div>
          </div>

          {/* Download Resources */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: STUDIO_COLORS.text, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              Download Resources
              <span title="Files learners can download from this lesson" style={{ width: 14, height: 14, borderRadius: "50%", background: STUDIO_COLORS.border, color: STUDIO_COLORS.textMuted, fontSize: 9, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>i</span>
            </div>
            <div style={{
              minHeight: 48, border: `1.5px solid ${STUDIO_COLORS.border}`, borderRadius: 8,
              padding: "8px 10px",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              {resources.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11, color: STUDIO_COLORS.textMuted,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label || r.storage_path}</span>
                  <button type="button" onClick={() => removeResource(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => { setTab("resources"); addResource(); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  width: "100%", padding: "6px 0", borderRadius: 6,
                  border: `1px dashed ${STUDIO_COLORS.border}`,
                  background: "transparent", cursor: "pointer",
                  fontSize: 11, color: STUDIO_COLORS.textMuted,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                Add files
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${STUDIO_COLORS.border}` }} />

          {/* Delete Lesson */}
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Delete this lesson? This cannot be undone.")) return;
              await fetch(`/api/university/admin/lesson/${lesson.id}`, { method: "DELETE" });
              router.push(`/university/admin/studio/${courseId}?tab=curriculum`);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: STUDIO_COLORS.redDark, fontSize: 13, fontWeight: 600, padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5,6"/><path d="M10,11v6M14,11v6"/><path d="M9,6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Delete Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: STUDIO_COLORS.surface, minHeight: "100vh" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: STUDIO_COLORS.surface,
        borderBottom: `1px solid ${STUDIO_COLORS.border}`,
        padding: "0 clamp(16px,4vw,48px)",
      }}>
        {/* Top bar */}
        <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Lesson type icon + label */}
            {(() => {
              const cfg = LESSON_TYPE_LABELS[details.lesson_type];
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {cfg && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: `${cfg.color}14`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, color: cfg.color,
                    }}>
                      {cfg.icon}
                    </div>
                  )}
                  <span style={{ fontSize: 15, fontWeight: 700, color: STUDIO_COLORS.text }}>
                    {cfg?.label ?? "Lesson"}
                  </span>
                </div>
              );
            })()}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SaveIndicator state={saveState} />
            {/* Preview link — opens the live lesson page in a new tab */}
            {lesson.is_published && (
              <a
                href={`/university/lesson/${lesson.id}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 7,
                  border: `1px solid ${STUDIO_COLORS.border}`,
                  color: STUDIO_COLORS.textMuted, fontSize: 12, fontWeight: 600, textDecoration: "none",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Preview
              </a>
            )}
            <StudioButton size="sm" onClick={() => save()} disabled={saveState === "saving"}>
              {saveState === "saving" ? "Saving…" : "Save"}
            </StudioButton>
            <button
              type="button"
              onClick={() => router.push(`/university/admin/studio/${courseId}?tab=curriculum`)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: STUDIO_COLORS.textMuted, fontSize: 20, lineHeight: 1, padding: "4px 6px",
              }}
            >×</button>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1180, margin: "0 auto",
        padding: "0 clamp(16px,4vw,40px) 80px",
        display: "flex", gap: 0,
      }}>
        {/* ── Left: editor canvas ─────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, padding: "28px 28px 80px 0" }}>
          {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

          {/* Cover image area */}
          <div style={{
            background: STUDIO_COLORS.white, borderRadius: 12, marginBottom: 20,
            border: `1px solid ${STUDIO_COLORS.border}`, overflow: "hidden",
          }}>
            {/* Cover image / placeholder */}
            <div style={{
              height: media.thumbnail_url ? 200 : 120,
              background: media.thumbnail_url ? "transparent" : "#f0f2f5",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              {media.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media.thumbnail_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#b0b8c4" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.5 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
              )}
            </div>
            {/* Cover buttons */}
            <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: `1px solid ${STUDIO_COLORS.border}` }}>
              <button
                type="button"
                onClick={() => setPickerFor("thumbnail")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 7,
                  border: `1.5px solid ${STUDIO_COLORS.border}`,
                  background: STUDIO_COLORS.white,
                  cursor: "pointer", fontSize: 12, fontWeight: 600, color: STUDIO_COLORS.textMuted,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                Add Cover Image
              </button>
              {media.thumbnail_url && (
                <button
                  type="button"
                  onClick={() => setMedia(m => ({ ...m, thumbnail_url: "" }))}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 12px", borderRadius: 7,
                    border: `1.5px solid ${STUDIO_COLORS.border}`,
                    background: STUDIO_COLORS.white,
                    cursor: "pointer", fontSize: 12, color: STUDIO_COLORS.textMuted,
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Lesson title + description inline */}
          <div style={{
            background: STUDIO_COLORS.white, borderRadius: 12, marginBottom: 20,
            border: `1px solid ${STUDIO_COLORS.border}`, padding: "20px 24px",
          }}>
            <input
              value={details.title}
              onChange={e => setDetails(d => ({ ...d, title: e.target.value }))}
              placeholder="Enter lesson title"
              style={{
                width: "100%", border: "none", outline: "none",
                fontSize: 22, fontWeight: 700, color: STUDIO_COLORS.text,
                fontFamily: "inherit", marginBottom: 8, background: "transparent",
                boxSizing: "border-box",
              }}
            />
            <textarea
              value={details.description}
              onChange={e => setDetails(d => ({ ...d, description: e.target.value }))}
              placeholder="Enter lesson description..."
              rows={2}
              style={{
                width: "100%", border: "none", outline: "none", resize: "none",
                fontSize: 14, color: STUDIO_COLORS.textMuted,
                fontFamily: "inherit", background: "transparent", boxSizing: "border-box",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Tab selector for content type editing */}
          <div style={{
            display: "flex", gap: 2, marginBottom: 16,
            borderBottom: `1px solid ${STUDIO_COLORS.border}`,
          }}>
            {tabs.map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                style={{
                  padding: "9px 16px", border: "none", background: "transparent", cursor: "pointer",
                  fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                  color: tab === t.id ? STUDIO_COLORS.orange : STUDIO_COLORS.textMuted,
                  borderBottom: `2px solid ${tab === t.id ? STUDIO_COLORS.orange : "transparent"}`,
                  marginBottom: -1,
                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                }}
              >
                {t.label}
                {t.badge != null && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px",
                    background: tab === t.id ? STUDIO_COLORS.orange : STUDIO_COLORS.border,
                    color: tab === t.id ? "#fff" : STUDIO_COLORS.textMuted,
                    fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Details ── */}
          {tab === "details" && (
            <div style={{
              background: STUDIO_COLORS.white, borderRadius: 12,
              border: `1px solid ${STUDIO_COLORS.border}`, padding: "20px 24px",
              display: "flex", flexDirection: "column", gap: 16,
            }}>
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

              <div>
                <StudioButton onClick={() => save("details")} disabled={saveState === "saving"}>
                  Save Details
                </StudioButton>
              </div>
            </div>
          )}

          {/* ── Media ── */}
          {tab === "media" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(details.lesson_type === "video" || !details.lesson_type) && (
                <div style={{
                  background: STUDIO_COLORS.white, borderRadius: 12,
                  border: `1px solid ${STUDIO_COLORS.border}`, padding: "20px 24px",
                  display: "flex", flexDirection: "column", gap: 14,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: STUDIO_COLORS.text }}>Video</div>
                  {/* Video upload area */}
                  {!media.video_token && (
                    <div style={{
                      borderRadius: 10, background: "#f7f8fa",
                      padding: "40px 24px",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      border: `1.5px dashed ${STUDIO_COLORS.border}`,
                      gap: 12,
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={STUDIO_COLORS.textLight} strokeWidth="1.4">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,9 16,12 10,15" fill={STUDIO_COLORS.textLight} stroke="none"/>
                      </svg>
                      <StudioButton variant="primary" onClick={() => setPickerFor("video")}>Select video</StudioButton>
                      <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted }}>
                        Supported Files: .mp4, .mov, .avi, .mkv, .flv, .wmv, .webm
                      </div>
                    </div>
                  )}
                  {/* Video preview */}
                  {media.video_token && (
                    <div style={{
                      borderRadius: 10, overflow: "hidden",
                      background: STUDIO_COLORS.navy, aspectRatio: "16/9",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}>
                      {previewLoading && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ color: STUDIO_COLORS.textMuted, fontSize: 12 }}>Loading preview…</div>
                        </div>
                      )}
                      {previewUrl && !previewLoading && (
                        <video
                          key={previewUrl}
                          src={previewUrl}
                          controls
                          playsInline
                          preload="metadata"
                          poster={media.thumbnail_url || undefined}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          onError={(e) => {
                            const v = e.currentTarget;
                            const code = v.error?.code;
                            console.error("[Studio preview] video error code:", code, "src:", previewUrl?.slice(0, 80));
                          }}
                        />
                      )}
                      {!previewUrl && !previewLoading && media.video_token && (
                        <div style={{ textAlign: "center", color: STUDIO_COLORS.textMuted, padding: 20 }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>▶</div>
                          <div style={{ fontSize: 12 }}>Could not load preview — check the video URL</div>
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
                        hint="Stored securely — URL resolved server-side."
                      />
                      <StudioButton size="sm" variant="secondary" onClick={() => setPickerFor("video")}>
                        📂 Library
                      </StudioButton>
                    </div>
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
              )}

              {details.lesson_type === "audio" && (
                <div style={{
                  background: STUDIO_COLORS.white, borderRadius: 12,
                  border: `1px solid ${STUDIO_COLORS.border}`, padding: "20px 24px",
                  display: "flex", flexDirection: "column", gap: 14,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: STUDIO_COLORS.text }}>Audio</div>
                  <div style={{
                    borderRadius: 10, background: "#f7f8fa",
                    padding: "40px 24px",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: `1.5px dashed ${STUDIO_COLORS.border}`,
                    gap: 12,
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={STUDIO_COLORS.textLight} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                    <StudioButton variant="primary" onClick={() => setPickerFor("audio")}>Select audio</StudioButton>
                    <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted }}>
                      Supported Files: .mp3, .wav, .aac, .flac, .ogg, .m4a
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Audio source URL</FieldLabel>
                    <StudioInput
                      value={media.video_token}
                      onChange={e => setMedia(m => ({ ...m, video_token: e.target.value }))}
                      placeholder="https://… or storage path"
                    />
                  </div>
                </div>
              )}

              {details.lesson_type === "text" && (
                <TextArticleEditor
                  value={transcript}
                  onChange={setTranscript}
                  onSave={() => save("transcript")}
                  saving={saveState === "saving"}
                />
              )}

              <StudioButton onClick={() => save("media")} disabled={saveState === "saving"}>Save Media</StudioButton>
            </div>
          )}

          {/* ── Transcript ── */}
          {tab === "transcript" && (
            <div style={{
              background: STUDIO_COLORS.white, borderRadius: 12,
              border: `1px solid ${STUDIO_COLORS.border}`, padding: "20px 24px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: STUDIO_COLORS.text, marginBottom: 14 }}>
                Transcript
                <span style={{ fontSize: 12, fontWeight: 400, color: STUDIO_COLORS.textMuted, marginLeft: 8 }}>Full lesson text for accessibility and learner reference</span>
              </div>
              <TranscriptEditor value={transcript} onChange={setTranscript} />
              <div style={{ marginTop: 16 }}>
                <StudioButton onClick={() => save("transcript")} disabled={saveState === "saving"}>Save Transcript</StudioButton>
              </div>
            </div>
          )}

          {/* ── Resources ── */}
          {tab === "resources" && (
            <div style={{
              background: STUDIO_COLORS.white, borderRadius: 12,
              border: `1px solid ${STUDIO_COLORS.border}`, padding: "20px 24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: STUDIO_COLORS.text }}>Resources</div>
                <StudioButton size="sm" onClick={addResource}>+ Add Resource</StudioButton>
              </div>
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
                      <StudioInput value={r.label} onChange={e => updateResource(i, "label", e.target.value)} placeholder="Label (e.g. FHA Guidelines PDF)" style={{ flex: "0 0 200px" }} />
                      <StudioInput value={r.storage_path} onChange={e => updateResource(i, "storage_path", e.target.value)} placeholder="URL or storage path" style={{ flex: 1 }} />
                      <button type="button" onClick={() => removeResource(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 18, padding: "10px 4px" }}>×</button>
                    </div>
                  ))}
                  <div style={{ paddingTop: 8 }}>
                    <StudioButton onClick={() => save("resources")} disabled={saveState === "saving"}>Save Resources</StudioButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Knowledge Check ── */}
          {tab === "knowledge_check" && (
            <div style={{ background: STUDIO_COLORS.white, borderRadius: 12, border: `1px solid ${STUDIO_COLORS.border}`, padding: "20px 24px" }}>
              <KnowledgeCheckTab
                lessonId={lesson.id}
                questions={questions}
                onQuestionsChange={setQuestions}
              />
            </div>
          )}

          {/* ── Completion ── */}
          {tab === "completion" && (
            <div style={{
              background: STUDIO_COLORS.white, borderRadius: 12,
              border: `1px solid ${STUDIO_COLORS.border}`, padding: "20px 24px",
              display: "flex", flexDirection: "column", gap: 16,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: STUDIO_COLORS.text }}>Completion Settings</div>
              <div>
                <FieldLabel>Completion mode</FieldLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { value: "watch_pct",  label: "Watch percentage",      desc: "Lesson complete when learner watches the required percentage" },
                    { value: "quiz_pass",  label: "Pass knowledge check",  desc: "Lesson complete when learner passes the attached quiz" },
                    { value: "manual",     label: "Manual completion",     desc: "Learner manually marks the lesson as complete" },
                    { value: "any",        label: "Any activity",          desc: "Lesson complete when learner opens it" },
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
          )}
        </div>

        {/* ── Right: Settings panel ────────────────────────────────────────── */}
        <div style={{ paddingTop: 28 }}>
          <SettingsPanel />
        </div>
      </div>

      {/* Media picker modals */}
      {(pickerFor === "video" || pickerFor === "audio") && (
        <MediaPicker
          mediaType={pickerFor}
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
