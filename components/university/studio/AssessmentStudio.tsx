"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { UniAssessment, UniQuizQuestion } from "@/lib/database.types";
import {
  STUDIO_COLORS, StudioInput, StudioTextarea, StudioSelect, FieldLabel,
  StudioToggle, StudioButton, SectionCard, EmptyState, ErrorBanner,
  SaveIndicator, SaveState, Breadcrumb, AssessmentTypeBadge, ASSESSMENT_TYPE_LABELS,
} from "./StudioPrimitives";

// ── Question editor (reused from LessonStudio) ────────────────────────────────
// (Inline here to avoid cross-component import complexity)

const emptyOption = () => ({ label: "", is_correct: false });

interface QuestionForm {
  id?: string;
  question_text: string;
  question_type: string;
  options: { label: string; is_correct: boolean }[];
  explanation: string;
  points: number;
}

function QuestionCard({
  question,
  index,
  onEdit,
}: {
  question: UniQuizQuestion;
  index: number;
  onEdit: () => void;
}) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10,
      border: `1px solid ${STUDIO_COLORS.border}`, background: STUDIO_COLORS.white,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: STUDIO_COLORS.navy, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700,
        }}>{index + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: STUDIO_COLORS.text, marginBottom: 6 }}>
            {question.question_text}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {(question.options_json as { label: string; is_correct: boolean }[]).map((opt, j) => (
              <div key={j} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 10px", borderRadius: 6,
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
          {question.explanation && (
            <div style={{ marginTop: 8, padding: "7px 10px", background: "rgba(96,165,250,0.08)", borderRadius: 6, fontSize: 12, color: "#1e40af" }}>
              ℹ {question.explanation}
            </div>
          )}
        </div>
        <StudioButton size="sm" variant="secondary" onClick={onEdit}>Edit</StudioButton>
      </div>
    </div>
  );
}

function InlineQuestionEditor({
  question,
  lessonId,
  assessmentId,
  onSave,
  onDelete,
  onCancel,
}: {
  question: QuestionForm;
  lessonId: string;
  assessmentId: string;
  onSave: (q: UniQuizQuestion) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(question);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (k: keyof QuestionForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const setOptionLabel = (i: number, v: string) =>
    setField("options", form.options.map((o, idx) => idx === i ? { ...o, label: v } : o));
  const toggleCorrect = (i: number) => {
    const isMulti = form.question_type === "multiple_select";
    setField("options", form.options.map((o, idx) =>
      idx === i ? { ...o, is_correct: !o.is_correct } : (isMulti ? o : { ...o, is_correct: false })
    ));
  };

  async function submit() {
    if (!form.question_text.trim()) { setError("Question text required"); return; }
    if (form.question_type !== "short_answer" && !form.options.some(o => o.is_correct)) {
      setError("Mark at least one correct answer"); return;
    }
    setSaving(true); setError("");
    try {
      const payload = {
        lesson_id:     lessonId,
        question_text: form.question_text,
        question_type: form.question_type,
        options_json:  form.options,
        explanation:   form.explanation || null,
        points:        form.points,
        sort_order:    0,
      };

      let saved: UniQuizQuestion;
      if (form.id) {
        const res = await fetch(`/api/university/admin/questions/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question_text: payload.question_text, question_type: payload.question_type, options_json: payload.options_json, explanation: payload.explanation, points: payload.points }),
        });
        if (!res.ok) { setError("Save failed"); return; }
        saved = await res.json();
      } else {
        const res = await fetch("/api/university/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { setError("Save failed"); return; }
        saved = await res.json();

        // Link to assessment
        const linkRes = await fetch(`/api/university/admin/assessment/${assessmentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // The POST handler on assessment does question linking
        });
      }
      onSave(saved!);
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  const isTF    = form.question_type === "true_false";
  const isMulti = form.question_type === "multiple_select";

  return (
    <div style={{
      padding: "20px", border: `1.5px solid ${STUDIO_COLORS.orange}30`, borderRadius: 12,
      background: `${STUDIO_COLORS.orange}04`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: STUDIO_COLORS.text, margin: 0 }}>
          {form.id ? "Edit Question" : "New Question"}
        </h4>
        <StudioSelect value={form.question_type} onChange={e => setField("question_type", e.target.value)} style={{ width: 180 }}>
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
          <StudioTextarea value={form.question_text} onChange={e => setField("question_text", e.target.value)} placeholder="Enter the question…" rows={2} autoFocus />
        </div>

        {form.question_type !== "short_answer" && (
          <div>
            <FieldLabel required>Answer options</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button type="button" onClick={() => toggleCorrect(i)}
                    style={{
                      width: 18, height: 18, flexShrink: 0,
                      borderRadius: isMulti ? 4 : "50%",
                      border: `2px solid ${opt.is_correct ? STUDIO_COLORS.orange : STUDIO_COLORS.border}`,
                      background: opt.is_correct ? STUDIO_COLORS.orange : STUDIO_COLORS.white,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {opt.is_correct && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                  </button>
                  {isTF ? (
                    <div style={{ flex: 1, padding: "9px 13px", borderRadius: 8, border: `1.5px solid ${STUDIO_COLORS.border}`, background: STUDIO_COLORS.surface, fontSize: 14 }}>{opt.label}</div>
                  ) : (
                    <StudioInput value={opt.label} onChange={e => setOptionLabel(i, e.target.value)} placeholder={`Option ${i + 1}`} style={{ flex: 1 }} />
                  )}
                  {!isTF && form.options.length > 2 && (
                    <button type="button" onClick={() => setField("options", form.options.filter((_, idx) => idx !== i))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 16, padding: "0 4px" }}>×</button>
                  )}
                </div>
              ))}
              {!isTF && form.options.length < 8 && (
                <button type="button" onClick={() => setField("options", [...form.options, emptyOption()])}
                  style={{ border: `1px dashed ${STUDIO_COLORS.border}`, background: "none", borderRadius: 8, padding: 8, fontSize: 12, color: STUDIO_COLORS.textMuted, cursor: "pointer" }}>
                  + Add option
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <FieldLabel>Explanation</FieldLabel>
          <StudioTextarea value={form.explanation} onChange={e => setField("explanation", e.target.value)} placeholder="Explain the correct answer…" rows={2} />
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

        <div style={{ display: "flex", gap: 8 }}>
          <StudioButton onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</StudioButton>
          <StudioButton variant="secondary" onClick={onCancel}>Cancel</StudioButton>
          {onDelete && <StudioButton variant="danger" onClick={onDelete} style={{ marginLeft: "auto" }}>Delete</StudioButton>}
        </div>
      </div>
    </div>
  );
}

// ── Assessment Studio main ────────────────────────────────────────────────────

export interface AssessmentStudioProps {
  courseId: string;
  courseTitle: string;
  assessment: UniAssessment;
  questions: UniQuizQuestion[];
  isAdmin: boolean;
}

// We need a lessonId to create questions — for course-level assessments we create
// a phantom lesson or use the course's first lesson. For now we store questions
// with a special "assessment" lesson reference and link via uni_assessment_questions.
// The simplest approach: use the assessment's lesson_id if set, otherwise pass courseId
// through and let the API handle it.
export function AssessmentStudio({
  courseId, courseTitle, assessment: initialAssessment, questions: initialQuestions, isAdmin,
}: AssessmentStudioProps) {
  const router = useRouter();
  const [assessment, setAssessment]   = useState(initialAssessment);
  const [questions, setQuestions]     = useState(initialQuestions);
  const [editingIdx, setEditingIdx]   = useState<number | null>(null);
  const [addingNew, setAddingNew]     = useState(false);
  const [saveState, setSaveState]     = useState<SaveState>("idle");
  const [error, setError]             = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Settings form
  const [settings, setSettings] = useState<{
    title: string; description: string; instructions: string;
    assessment_type: import("@/lib/database.types").AssessmentType;
    passing_pct: number; max_attempts: number; time_limit_mins: number;
    randomize_questions: boolean; show_answers_after: boolean; is_required: boolean;
  }>({
    title:               assessment.title,
    description:         assessment.description ?? "",
    instructions:        assessment.instructions ?? "",
    assessment_type:     assessment.assessment_type,
    passing_pct:         assessment.passing_pct,
    max_attempts:        assessment.max_attempts ?? 0,
    time_limit_mins:     assessment.time_limit_mins ?? 0,
    randomize_questions: assessment.randomize_questions,
    show_answers_after:  assessment.show_answers_after,
    is_required:         assessment.is_required,
  });

  async function saveSettings() {
    setSaveState("saving"); setError("");
    try {
      const res = await fetch(`/api/university/admin/assessment/${assessment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          max_attempts:    settings.max_attempts > 0 ? settings.max_attempts : null,
          time_limit_mins: settings.time_limit_mins > 0 ? settings.time_limit_mins : null,
        }),
      });
      if (!res.ok) { setError("Save failed"); setSaveState("error"); return; }
      const updated = await res.json();
      setAssessment(updated);
      setSaveState("saved");
      setSettingsOpen(false);
      setTimeout(() => setSaveState("idle"), 3000);
    } catch { setError("Network error"); setSaveState("error"); }
  }

  // For creating questions, we use assessment.lesson_id (the knowledge-check lesson)
  // For course-level assessments (no lesson_id), we need a placeholder approach.
  // We'll use a dedicated assessment-level question linked via uni_assessment_questions.
  // For simplicity, we create a "virtual" lesson concept and use assessment questions.
  // Actually: the simplest working approach is to create questions with a special
  // lesson reference. For course-level assessments, we just need a lesson_id.
  // We'll use assessment.lesson_id if present, otherwise we won't support question
  // creation without one — show a prompt to set up.

  // Simpler: we just create questions directly via the questions API with a
  // dummy course_id, and link them to this assessment. This works because
  // uni_quiz_questions has an optional course_id.
  const PHANTOM_LESSON = "00000000-0000-0000-0000-000000000000";
  const effectiveLessonId = assessment.lesson_id ?? PHANTOM_LESSON;

  async function saveNewQuestion(saved: UniQuizQuestion) {
    const next = [...questions, saved];
    setQuestions(next);
    setAddingNew(false);
    // Link to assessment
    const ids = next.map(q => q.id);
    await fetch(`/api/university/admin/assessment/${assessment.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_ids: ids }),
    });
  }

  async function saveEditedQuestion(saved: UniQuizQuestion) {
    const next = questions.map(q => q.id === saved.id ? saved : q);
    setQuestions(next);
    setEditingIdx(null);
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/university/admin/questions/${id}`, { method: "DELETE" });
    const next = questions.filter(q => q.id !== id);
    setQuestions(next);
    setEditingIdx(null);
    const ids = next.map(q => q.id);
    await fetch(`/api/university/admin/assessment/${assessment.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_ids: ids }),
    });
  }

  const newQ = (): QuestionForm => ({
    question_text: "", question_type: "multiple_choice",
    options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
    explanation: "", points: 1,
  });

  const cfg = ASSESSMENT_TYPE_LABELS[assessment.assessment_type] ?? ASSESSMENT_TYPE_LABELS.final_assessment;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: STUDIO_COLORS.white, minHeight: "100vh" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: STUDIO_COLORS.navy,
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        padding: "0 clamp(16px,4vw,48px)",
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: STUDIO_COLORS.orange, marginBottom: 3 }}>
            Assessment Builder
          </div>
          <Breadcrumb items={[
            { label: "Courses",    href: "/university/admin/courses" },
            { label: courseTitle,  href: `/university/admin/studio/${courseId}?tab=assessments` },
            { label: assessment.title },
          ]} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SaveIndicator state={saveState} />
          <span style={{
            padding: "4px 10px", borderRadius: 6,
            background: `${cfg.color}18`, fontSize: 11, fontWeight: 700,
            color: cfg.color, textTransform: "uppercase", letterSpacing: "0.5px",
          }}>{cfg.label}</span>
          <StudioButton size="sm" variant="secondary" onClick={() => setSettingsOpen(s => !s)}>
            Settings
          </StudioButton>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 80px" }}>
        {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

        {/* Settings panel */}
        {settingsOpen && (
          <SectionCard title="Assessment Settings" description="Configure passing score, attempts, and timing">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <FieldLabel required>Title</FieldLabel>
                <StudioInput value={settings.title} onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} />
              </div>

              <div>
                <FieldLabel>Instructions</FieldLabel>
                <StudioTextarea value={settings.instructions} onChange={e => setSettings(s => ({ ...s, instructions: e.target.value }))} placeholder="Instructions shown before learner starts…" rows={2} />
              </div>

              <div>
                <FieldLabel>Type</FieldLabel>
                <StudioSelect value={settings.assessment_type} onChange={e => setSettings(s => ({ ...s, assessment_type: e.target.value as import("@/lib/database.types").AssessmentType }))}>
                  <option value="knowledge_check">Knowledge Check</option>
                  <option value="quiz">Practice Quiz</option>
                  <option value="final_assessment">Final Assessment</option>
                  <option value="certification_exam">Certification Exam</option>
                </StudioSelect>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <FieldLabel>Passing score (%)</FieldLabel>
                  <StudioInput type="number" min={1} max={100} value={settings.passing_pct} onChange={e => setSettings(s => ({ ...s, passing_pct: +e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>Max attempts (0 = unlimited)</FieldLabel>
                  <StudioInput type="number" min={0} value={settings.max_attempts} onChange={e => setSettings(s => ({ ...s, max_attempts: +e.target.value }))} />
                </div>
                <div>
                  <FieldLabel>Time limit (min, 0 = none)</FieldLabel>
                  <StudioInput type="number" min={0} value={settings.time_limit_mins} onChange={e => setSettings(s => ({ ...s, time_limit_mins: +e.target.value }))} />
                </div>
              </div>

              <StudioToggle checked={settings.randomize_questions} onChange={v => setSettings(s => ({ ...s, randomize_questions: v }))} label="Randomize question order" />
              <StudioToggle checked={settings.show_answers_after} onChange={v => setSettings(s => ({ ...s, show_answers_after: v }))} label="Show correct answers after attempt" />
              <StudioToggle checked={settings.is_required} onChange={v => setSettings(s => ({ ...s, is_required: v }))} label="Required for course completion" />

              <div style={{ display: "flex", gap: 8 }}>
                <StudioButton onClick={saveSettings} disabled={saveState === "saving"}>Save Settings</StudioButton>
                <StudioButton variant="secondary" onClick={() => setSettingsOpen(false)}>Cancel</StudioButton>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Summary bar */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap",
          padding: "14px 18px", borderRadius: 10,
          background: STUDIO_COLORS.surface, border: `1px solid ${STUDIO_COLORS.border}`,
          marginBottom: 20,
        }}>
          {[
            { label: "Questions",    value: questions.length },
            { label: "Passing",      value: `${assessment.passing_pct}%` },
            { label: "Max attempts", value: assessment.max_attempts ?? "Unlimited" },
            { label: "Time limit",   value: assessment.time_limit_mins ? `${assessment.time_limit_mins} min` : "None" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 16, fontWeight: 800, color: STUDIO_COLORS.text }}>{s.value}</div>
              <div style={{ fontSize: 11, color: STUDIO_COLORS.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: STUDIO_COLORS.text, margin: 0 }}>Questions</h3>
            {questions.length > 0 && (
              <StudioButton size="sm" onClick={() => setAddingNew(true)}>+ Add Question</StudioButton>
            )}
          </div>

          {questions.length === 0 && !addingNew && (
            <EmptyState
              icon="✏"
              title="No questions yet"
              description="Build the question bank for this assessment. Questions support multiple choice, true/false, and more."
              action={<StudioButton onClick={() => setAddingNew(true)}>+ Add First Question</StudioButton>}
            />
          )}

          {questions.map((q, i) => (
            editingIdx === i ? (
              <InlineQuestionEditor
                key={q.id}
                question={{
                  id: q.id,
                  question_text: q.question_text,
                  question_type: q.question_type,
                  options: (q.options_json as { label: string; is_correct: boolean }[]) ?? [],
                  explanation: q.explanation ?? "",
                  points: (q as unknown as { points?: number }).points ?? 1,
                }}
                lessonId={effectiveLessonId}
                assessmentId={assessment.id}
                onSave={saveEditedQuestion}
                onDelete={() => deleteQuestion(q.id)}
                onCancel={() => setEditingIdx(null)}
              />
            ) : (
              <QuestionCard key={q.id} question={q} index={i} onEdit={() => setEditingIdx(i)} />
            )
          ))}

          {addingNew && (
            <InlineQuestionEditor
              question={newQ()}
              lessonId={effectiveLessonId}
              assessmentId={assessment.id}
              onSave={saveNewQuestion}
              onCancel={() => setAddingNew(false)}
            />
          )}

          {!addingNew && questions.length > 0 && (
            <StudioButton variant="secondary" onClick={() => setAddingNew(true)}>+ Add Question</StudioButton>
          )}
        </div>

        {/* Preview panel */}
        {questions.length > 0 && (
          <div style={{ marginTop: 32, padding: "20px", border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 12, background: STUDIO_COLORS.surface }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: STUDIO_COLORS.text, marginBottom: 4 }}>Learner Preview</h3>
            <p style={{ fontSize: 13, color: STUDIO_COLORS.textMuted, marginBottom: 16 }}>This is how the assessment will appear to learners. Correct answers are hidden.</p>
            {questions.map((q, i) => (
              <div key={q.id} style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: STUDIO_COLORS.text, marginBottom: 8 }}>
                  {i + 1}. {q.question_text}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {(q.options_json as { label: string; is_correct: boolean }[]).map((opt, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 12px", borderRadius: 7, cursor: "pointer",
                      background: STUDIO_COLORS.white, border: `1px solid ${STUDIO_COLORS.border}`,
                      fontSize: 14, color: STUDIO_COLORS.text,
                    }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${STUDIO_COLORS.border}`, flexShrink: 0 }} />
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
