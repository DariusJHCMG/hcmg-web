"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Question {
  id: string;
  question_text: string;
  options: { label: string }[];
  explanation: string | null;
  question_type: string;
}

interface Props {
  assessmentId:    string;
  courseId:        string;
  courseSlug:      string;
  courseTitle:     string;
  assessmentTitle: string;
  instructions:    string | null;
  passingPct:      number;
  timeLimitMins:   number | null;
  showAnswersAfter: boolean;
  questions:       Question[];
  attemptsUsed:    number;
  maxAttempts:     number | null;
  maxAttemptsReached: boolean;
}

type Phase = "intro" | "taking" | "submitted";
type AnswerValue = number | number[];

interface Result {
  question_id: string;
  is_correct: boolean | null;
  explanation: string | null;
}

const S = {
  navy:    "#06182a",
  navyM:   "#0c2b4b",
  navyL:   "#0d2a48",
  orange:  "#f58220",
  orangeL: "#FF9847",
  text:    "#071a2e",
  muted:   "#687383",
  light:   "#b9c5d0",
  border:  "#dfe4e8",
  surface: "#f7f8fa",
  white:   "#fff",
  green:   "#34d399",
  greenD:  "#118568",
  red:     "#f87171",
  redD:    "#b91c1c",
};

export function AssessmentPlayer({
  assessmentId, courseId, courseSlug, courseTitle, assessmentTitle,
  instructions, passingPct, timeLimitMins, showAnswersAfter,
  questions, attemptsUsed, maxAttempts, maxAttemptsReached,
}: Props) {
  const [phase, setPhase]         = useState<Phase>("intro");
  const [answers, setAnswers]     = useState<Record<string, AnswerValue>>({});
  const [results, setResults]     = useState<Result[]>([]);
  const [score, setScore]         = useState(0);
  const [passed, setPassed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [currentQ, setCurrentQ]   = useState(0);
  const [timeLeft, setTimeLeft]   = useState(timeLimitMins ? timeLimitMins * 60 : null);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (phase !== "taking" || !timeLimitMins) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t == null || t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]); // eslint-disable-line

  function formatTime(secs: number | null) {
    if (secs == null) return "";
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function isAnswered(q: Question): boolean {
    const qType = q.question_type ?? "multiple_choice";
    const val   = answers[q.id];
    if (qType === "short_answer") return true;
    if (qType === "multiple_select") return Array.isArray(val) && val.length > 0;
    return typeof val === "number";
  }

  function toggleMultiSelect(qId: string, oi: number) {
    setAnswers(prev => {
      const cur = Array.isArray(prev[qId]) ? (prev[qId] as number[]) : [];
      const next = cur.includes(oi) ? cur.filter(i => i !== oi) : [...cur, oi];
      return { ...prev, [qId]: next };
    });
  }

  async function handleSubmit(forced = false) {
    if (loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/university/assessment/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed"); return; }
      setResults(data.results ?? []);
      setScore(data.score_pct ?? 0);
      setPassed(data.passed ?? false);
      setPhase("submitted");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const q          = questions[currentQ];
  const answeredCount = questions.filter(isAnswered).length;
  const allAnswered   = answeredCount === questions.length;

  // ── Intro screen ─────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: S.white, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ background: S.navy, padding: "14px clamp(16px,4vw,48px)", display: "flex", alignItems: "center", gap: 10 }}>
          <Link href={`/university/course/${courseSlug}`} style={{ fontSize: 12, color: S.muted, textDecoration: "none" }}>
            HCMG U
          </Link>
          <span style={{ color: "#405166", fontSize: 12 }}>/</span>
          <Link href={`/university/course/${courseSlug}`} style={{ fontSize: 12, color: S.muted, textDecoration: "none" }}>
            {courseTitle}
          </Link>
          <span style={{ color: "#405166", fontSize: 12 }}>/</span>
          <span style={{ fontSize: 12, color: S.light }}>{assessmentTitle}</span>
        </div>

        <div style={{ maxWidth: 640, margin: "60px auto", padding: "0 clamp(16px,4vw,40px)" }}>
          <div style={{
            background: S.navyL, borderRadius: 14, padding: "40px",
            border: "1px solid rgba(255,255,255,0.07)", color: S.white,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: S.orange, marginBottom: 10 }}>
              Assessment
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, fontFamily: "Manrope, system-ui", letterSpacing: "-0.5px" }}>
              {assessmentTitle}
            </h1>

            {instructions && (
              <p style={{ fontSize: 14, color: S.light, lineHeight: 1.7, marginBottom: 24 }}>{instructions}</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                { label: "Questions",    value: `${questions.length}` },
                { label: "Passing score",value: `${passingPct}%` },
                { label: "Time limit",   value: timeLimitMins ? `${timeLimitMins} minutes` : "No time limit" },
                { label: "Attempts",     value: maxAttempts ? `${attemptsUsed} of ${maxAttempts} used` : "Unlimited" },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", fontSize: 13,
                }}>
                  <span style={{ color: S.light }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: S.white }}>{item.value}</span>
                </div>
              ))}
            </div>

            {maxAttemptsReached ? (
              <div style={{ padding: "16px", background: "rgba(248,113,113,0.12)", borderRadius: 10, textAlign: "center" }}>
                <p style={{ fontSize: 14, color: S.red, fontWeight: 700 }}>
                  Maximum attempts reached. Contact your administrator.
                </p>
              </div>
            ) : questions.length === 0 ? (
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.05)", borderRadius: 10, textAlign: "center" }}>
                <p style={{ fontSize: 14, color: S.muted }}>No questions available yet.</p>
              </div>
            ) : (
              <button
                onClick={() => setPhase("taking")}
                style={{
                  width: "100%", padding: "14px", borderRadius: 10,
                  background: `linear-gradient(135deg, ${S.orangeL}, ${S.orange})`,
                  color: S.white, fontWeight: 700, fontSize: 15, border: "none",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Start Assessment →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────────
  if (phase === "submitted") {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: S.white, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ background: S.navy, padding: "14px clamp(16px,4vw,48px)", display: "flex", alignItems: "center", gap: 10 }}>
          <Link href={`/university/course/${courseSlug}`} style={{ fontSize: 12, color: S.muted, textDecoration: "none" }}>← Back to course</Link>
        </div>

        <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 clamp(16px,4vw,40px) 80px" }}>
          {/* Score card */}
          <div style={{
            background: S.navyL, borderRadius: 14, padding: "32px",
            border: "1px solid rgba(255,255,255,0.07)", color: S.white, marginBottom: 24,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: passed ? S.green : S.red, lineHeight: 1 }}>
              {score}%
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: passed ? S.green : S.red, marginTop: 8 }}>
              {passed ? "Assessment Passed ✓" : "Not passed — try again"}
            </div>
            <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>
              Required: {passingPct}%
            </div>

            {passed && (
              <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(52,211,153,0.1)", borderRadius: 10, fontSize: 13, color: S.green }}>
                Your completion has been recorded. You&apos;ll receive your certificate shortly.
              </div>
            )}

            {!passed && !maxAttemptsReached && (
              <button
                onClick={() => { setPhase("taking"); setAnswers({}); setResults([]); setCurrentQ(0); setTimeLeft(timeLimitMins ? timeLimitMins * 60 : null); }}
                style={{
                  marginTop: 20, padding: "12px 28px", borderRadius: 10,
                  background: `linear-gradient(135deg, ${S.orangeL}, ${S.orange})`,
                  color: S.white, fontWeight: 700, fontSize: 14, border: "none",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Try again
              </button>
            )}
          </div>

          {/* Answer review */}
          {showAnswersAfter && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: S.text, marginBottom: 16 }}>Answer Review</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {questions.map((q, i) => {
                  const r         = results.find(r => r.question_id === q.id);
                  const chosenVal = answers[q.id];
                  const isMulti   = q.question_type === "multiple_select";
                  const chosenSet = isMulti && Array.isArray(chosenVal) ? new Set(chosenVal as number[]) : null;

                  return (
                    <div key={q.id} style={{
                      padding: "16px", borderRadius: 10,
                      border: `1.5px solid ${r?.is_correct === true ? "rgba(52,211,153,0.3)" : r?.is_correct === false ? "rgba(248,113,113,0.3)" : S.border}`,
                      background: r?.is_correct === true ? "rgba(52,211,153,0.04)" : r?.is_correct === false ? "rgba(248,113,113,0.04)" : S.surface,
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, color: r?.is_correct === true ? S.green : r?.is_correct === false ? S.red : S.muted, fontWeight: 700, flexShrink: 0 }}>
                          {r?.is_correct === true ? "✓" : r?.is_correct === false ? "✗" : "—"}
                        </span>
                        <p style={{ fontSize: 14, fontWeight: 600, color: S.text, margin: 0 }}>
                          {i + 1}. {q.question_text}
                        </p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginLeft: 24 }}>
                        {q.options.map((opt, oi) => {
                          const chosen = isMulti ? (chosenSet?.has(oi) ?? false) : chosenVal === oi;
                          return (
                            <div key={oi} style={{
                              padding: "7px 12px", borderRadius: 7, fontSize: 13,
                              background: chosen ? "rgba(245,130,32,0.08)" : S.white,
                              border: `1px solid ${chosen ? "rgba(245,130,32,0.3)" : S.border}`,
                              color: chosen ? S.text : S.muted,
                              fontWeight: chosen ? 600 : 400,
                            }}>
                              {opt.label}
                            </div>
                          );
                        })}
                      </div>

                      {r?.explanation && (
                        <div style={{ marginTop: 10, marginLeft: 24, padding: "8px 10px", background: "rgba(96,165,250,0.08)", borderRadius: 7, fontSize: 12, color: "#1e40af" }}>
                          ℹ {r.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Taking screen ─────────────────────────────────────────────────────────────
  const qType = q?.question_type ?? "multiple_choice";

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: S.white, minHeight: "100vh" }}>
      {/* Header with timer + progress */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: S.navy, padding: "12px clamp(16px,4vw,48px)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: S.white }}>{assessmentTitle}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: S.muted }}>{answeredCount}/{questions.length} answered</span>
          {timeLeft != null && (
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: timeLeft < 120 ? S.red : timeLeft < 300 ? S.orange : S.green,
            }}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: S.border }}>
        <div style={{
          height: "100%", width: `${((currentQ + 1) / questions.length) * 100}%`,
          background: S.orange, transition: "width 0.3s",
        }} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px clamp(16px,4vw,40px) 80px" }}>
        {/* Question navigator */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
          {questions.map((qq, i) => (
            <button key={qq.id} type="button"
              onClick={() => setCurrentQ(i)}
              style={{
                width: 34, height: 34, borderRadius: 7,
                background: i === currentQ ? S.orange
                  : isAnswered(qq) ? "rgba(52,211,153,0.15)"
                  : S.surface,
                color: i === currentQ ? S.white : isAnswered(qq) ? S.greenD : S.muted,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${i === currentQ ? S.orange : isAnswered(qq) ? "rgba(52,211,153,0.3)" : S.border}`,
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question */}
        {q && (
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20, lineHeight: 1.5 }}>
              {currentQ + 1}. {q.question_text}
              {qType === "multiple_select" && (
                <span style={{ fontSize: 12, color: S.muted, fontWeight: 400, marginLeft: 8 }}>
                  (select all that apply)
                </span>
              )}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, oi) => {
                const chosen = qType === "multiple_select"
                  ? (Array.isArray(answers[q.id]) && (answers[q.id] as number[]).includes(oi))
                  : answers[q.id] === oi;

                return (
                  <button key={oi} type="button"
                    onClick={() => {
                      if (qType === "multiple_select") toggleMultiSelect(q.id, oi);
                      else setAnswers(prev => ({ ...prev, [q.id]: oi }));
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", borderRadius: 10, textAlign: "left",
                      border: `2px solid ${chosen ? S.orange : S.border}`,
                      background: chosen ? `rgba(245,130,32,0.06)` : S.white,
                      cursor: "pointer", fontSize: 14, color: S.text,
                      fontWeight: chosen ? 600 : 400, fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: qType === "multiple_select" ? 5 : "50%",
                      border: `2px solid ${chosen ? S.orange : S.border}`,
                      background: chosen ? S.orange : S.white,
                    }}>
                      {chosen && <span style={{ color: S.white, fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
          <button type="button"
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            style={{
              padding: "11px 22px", borderRadius: 9, border: `1.5px solid ${S.border}`,
              background: S.white, color: currentQ === 0 ? S.muted : S.text,
              fontSize: 13, fontWeight: 600, cursor: currentQ === 0 ? "not-allowed" : "pointer",
              opacity: currentQ === 0 ? 0.5 : 1, fontFamily: "inherit",
            }}
          >
            ← Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button type="button"
              onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
              style={{
                padding: "11px 22px", borderRadius: 9, border: "none",
                background: `linear-gradient(135deg, ${S.orangeL}, ${S.orange})`,
                color: S.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Next →
            </button>
          ) : (
            <button type="button"
              onClick={() => handleSubmit()}
              disabled={!allAnswered || loading}
              style={{
                padding: "11px 22px", borderRadius: 9, border: "none",
                background: allAnswered ? `linear-gradient(135deg, ${S.orangeL}, ${S.orange})` : S.border,
                color: allAnswered ? S.white : S.muted,
                fontSize: 13, fontWeight: 700,
                cursor: allAnswered && !loading ? "pointer" : "not-allowed",
                fontFamily: "inherit",
              }}
            >
              {loading ? "Submitting…" : `Submit Assessment (${answeredCount}/${questions.length})`}
            </button>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(185,28,28,0.08)", borderRadius: 8, fontSize: 13, color: S.redD }}>
            ⚠ {error}
          </div>
        )}
      </div>
    </div>
  );
}
