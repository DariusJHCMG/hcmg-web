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
}

interface Props {
  lessonId: string;
  questions: Question[];
  onPassed?: (score: number) => void;
}

type Phase = "quiz" | "submitted";

interface Result {
  question_id: string;
  chosen_index: number;
  correct_index: number;
  is_correct: boolean;
  explanation: string | null;
}

export function QuizBlock({ lessonId, questions, onPassed }: Props) {
  const [answers, setAnswers]   = useState<Record<string, number>>({});
  const [phase, setPhase]       = useState<Phase>("quiz");
  const [results, setResults]   = useState<Result[]>([]);
  const [score, setScore]       = useState(0);
  const [passed, setPassed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] != null);

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

  if (phase === "submitted") {
    return (
      <div style={{ background: "#0d2a48", borderRadius: 12, padding: "24px 24px", border: "1px solid rgba(255,255,255,0.07)" }}>
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
            const r = results.find(r => r.question_id === q.id);
            return (
              <div key={q.id} style={{ fontSize: 13 }}>
                <p style={{ color: "#fff", fontWeight: 600, marginBottom: 6 }}>
                  {i + 1}. {q.question_text}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {q.options.map((opt, oi) => {
                    const isChosen  = r?.chosen_index === oi;
                    const isCorrect = r?.correct_index === oi;
                    const bg = isCorrect ? "rgba(52,211,153,0.12)" : (isChosen && !isCorrect) ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.03)";
                    const border = isCorrect ? "1px solid #34d399" : (isChosen && !isCorrect) ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.06)";
                    const color  = isCorrect ? "#34d399" : (isChosen && !isCorrect) ? "#f87171" : "#b9c5d0";
                    return (
                      <div key={oi} style={{ background: bg, border, borderRadius: 8, padding: "8px 12px", color }}>
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
                {r?.explanation && (
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

  return (
    <div style={{ background: "#0d2a48", borderRadius: 12, padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 18 }}>
        Knowledge Check
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {questions.map((q, i) => (
          <div key={q.id}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
              {i + 1}. {q.question_text}
            </p>
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
          </div>
        ))}
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
