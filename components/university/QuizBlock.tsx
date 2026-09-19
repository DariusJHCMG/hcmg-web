"use client";

import { useState } from "react";

interface Option {
  label: string;
}

interface Question {
  id: string;
  question_text: string;
  options: Option[];
  explanation?: string | null;
  question_type?: string; // 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer'
}

interface Props {
  lessonId: string;
  questions: Question[];
  onPassed?: (score: number) => void;
}

type Phase = "quiz" | "submitted";

interface Result {
  question_id: string;
  is_correct: boolean | null;
  explanation: string | null;
}

// answers: for multiple_choice/true_false → number; for multiple_select → number[]
type AnswerValue = number | number[];

export function QuizBlock({ lessonId, questions, onPassed }: Props) {
  const [answers, setAnswers]   = useState<Record<string, AnswerValue>>({});
  const [phase, setPhase]       = useState<Phase>("quiz");
  const [results, setResults]   = useState<Result[]>([]);
  const [score, setScore]       = useState(0);
  const [passed, setPassed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // A question is "answered" if it has a meaningful answer value
  function isAnswered(q: Question): boolean {
    const qType = q.question_type ?? "multiple_choice";
    const val   = answers[q.id];
    if (qType === "short_answer") return true; // short answer always counts as answered
    if (qType === "multiple_select") return Array.isArray(val) && val.length > 0;
    return typeof val === "number";
  }

  const allAnswered = questions.length > 0 && questions.every(isAnswered);

  function toggleMultiSelect(questionId: string, optionIdx: number) {
    setAnswers(prev => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as number[]) : [];
      const next = current.includes(optionIdx)
        ? current.filter(i => i !== optionIdx)
        : [...current, optionIdx];
      return { ...prev, [questionId]: next };
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/university/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, answers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed"); setLoading(false); return; }
      setResults(data.results);
      setScore(data.score_pct);
      setPassed(data.passed);
      setPhase("submitted");
      if (data.passed) onPassed?.(data.score_pct);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  // ── Results view ─────────────────────────────────────────────────────────
  if (phase === "submitted") {
    return (
      <div style={{ background: "#0d2a48", borderRadius: 12, padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{
          textAlign: "center", marginBottom: 20,
          padding: "16px 0",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: passed ? "#34d399" : "#f87171" }}>
            {score}%
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: passed ? "#34d399" : "#f87171", marginTop: 4 }}>
            {passed ? "Knowledge check passed ✓" : "Keep studying and try again"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {questions.map((q, i) => {
            const r       = results.find(r => r.question_id === q.id);
            const qType   = q.question_type ?? "multiple_choice";
            const chosenVal = answers[q.id];
            const chosenSet = qType === "multiple_select"
              ? new Set(Array.isArray(chosenVal) ? (chosenVal as number[]) : [])
              : null;

            return (
              <div key={q.id} style={{ fontSize: 13 }}>
                <p style={{ color: "#fff", fontWeight: 600, marginBottom: 6 }}>
                  {i + 1}. {q.question_text}
                  {qType === "multiple_select" && (
                    <span style={{ fontSize: 11, color: "#687383", fontWeight: 400, marginLeft: 8 }}>
                      (select all that apply)
                    </span>
                  )}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {q.options.map((opt, oi) => {
                    let isChosen = false;
                    if (qType === "multiple_select") {
                      isChosen = chosenSet?.has(oi) ?? false;
                    } else {
                      isChosen = chosenVal === oi;
                    }
                    // For short_answer, r.is_correct is null — show neutral
                    const questionResult = r?.is_correct ?? null;
                    const isChosenAndCorrect = isChosen && questionResult === true;
                    const isChosenAndWrong   = isChosen && questionResult === false;
                    const bg     = isChosenAndCorrect ? "rgba(52,211,153,0.12)" : isChosenAndWrong ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.03)";
                    const border = isChosenAndCorrect ? "1px solid #34d399"     : isChosenAndWrong ? "1px solid #f87171"     : "1px solid rgba(255,255,255,0.06)";
                    const color  = isChosenAndCorrect ? "#34d399"               : isChosenAndWrong ? "#f87171"               : "#b9c5d0";
                    return (
                      <div key={oi} style={{ background: bg, border, borderRadius: 8, padding: "8px 12px", color }}>
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
                {r?.is_correct === null && (
                  <p style={{ marginTop: 6, fontSize: 12, color: "#687383", fontStyle: "italic", padding: "0 4px" }}>
                    Short answer — reviewed by instructor.
                  </p>
                )}
                {r?.explanation && r.is_correct !== null && (
                  <p style={{ marginTop: 6, fontSize: 12, color: "#687383", fontStyle: "italic", padding: "0 4px" }}>
                    {r.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!passed && (
          <button
            onClick={() => { setPhase("quiz"); setAnswers({}); setResults([]); }}
            style={{
              marginTop: 20, width: "100%", padding: "13px 24px", borderRadius: 10,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
            }}
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // ── Quiz input view ──────────────────────────────────────────────────────
  return (
    <div style={{ background: "#0d2a48", borderRadius: 12, padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 18 }}>
        Knowledge Check
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {questions.map((q, i) => {
          const qType = q.question_type ?? "multiple_choice";

          return (
            <div key={q.id}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                {i + 1}. {q.question_text}
              </p>
              {qType === "multiple_select" && (
                <p style={{ fontSize: 11, color: "#687383", marginBottom: 8, margin: "2px 0 8px" }}>
                  Select all that apply
                </p>
              )}

              {/* short_answer: no options to render */}
              {qType === "short_answer" && (
                <p style={{ fontSize: 12, color: "#687383", fontStyle: "italic", padding: "8px 0" }}>
                  Written response — reviewed by your instructor.
                </p>
              )}

              {/* multiple_choice / true_false: single-select buttons */}
              {(qType === "multiple_choice" || qType === "true_false") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt, oi) => {
                    const chosen = answers[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 9,
                          border: chosen ? "1.5px solid #f58220" : "1.5px solid rgba(255,255,255,0.1)",
                          background: chosen ? "rgba(245,130,32,0.12)" : "rgba(255,255,255,0.03)",
                          color: chosen ? "#f58220" : "#b9c5d0",
                          fontSize: 13, textAlign: "left", cursor: "pointer",
                          fontWeight: chosen ? 600 : 400,
                          transition: "all 0.15s",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* multiple_select: checkbox-style multi-toggle buttons */}
              {qType === "multiple_select" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt, oi) => {
                    const chosenArr = Array.isArray(answers[q.id]) ? (answers[q.id] as number[]) : [];
                    const chosen    = chosenArr.includes(oi);
                    return (
                      <button
                        key={oi}
                        onClick={() => toggleMultiSelect(q.id, oi)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 9,
                          border: chosen ? "1.5px solid #f58220" : "1.5px solid rgba(255,255,255,0.1)",
                          background: chosen ? "rgba(245,130,32,0.12)" : "rgba(255,255,255,0.03)",
                          color: chosen ? "#f58220" : "#b9c5d0",
                          fontSize: 13, textAlign: "left", cursor: "pointer",
                          fontWeight: chosen ? 600 : 400,
                          transition: "all 0.15s",
                          display: "flex", alignItems: "center", gap: 10,
                        }}
                      >
                        {/* Checkbox indicator */}
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 16, height: 16,
                          borderRadius: 4,
                          border: chosen ? "2px solid #f58220" : "2px solid rgba(255,255,255,0.2)",
                          background: chosen ? "#f58220" : "transparent",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}>
                          {chosen && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(178,59,59,0.15)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || loading}
        style={{
          marginTop: 20, width: "100%", padding: "13px 24px", borderRadius: 10,
          background: allAnswered ? "linear-gradient(135deg,#FF9847,#F37021)" : "#1a3a5c",
          color: allAnswered ? "#fff" : "#687383",
          fontWeight: 700, fontSize: 14, border: "none",
          cursor: allAnswered && !loading ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}
      >
        {loading ? "Checking…" : "Submit answers"}
      </button>
    </div>
  );
}
