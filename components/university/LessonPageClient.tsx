"use client";

import { useState } from "react";
import { LessonPlayer } from "@/components/university/LessonPlayer";
import { QuizBlock } from "@/components/university/QuizBlock";
import Link from "next/link";

interface Resource { label: string; storage_path: string }
interface QuizQuestion { id: string; question_text: string; options: { label: string }[]; explanation?: string | null; question_type?: string }

interface Props {
  lessonId: string;
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string;
  lessonDescription: string | null;
  transcript: string | null;
  resources: Resource[];
  quizQuestions: QuizQuestion[];
  prevLessonId: string | null;
  nextLessonId: string | null;
  initialWatchPct: number;
}

export function LessonPageClient({
  lessonId, courseSlug, courseTitle, lessonTitle, lessonDescription,
  transcript, resources, quizQuestions, prevLessonId, nextLessonId, initialWatchPct,
}: Props) {
  const [watchPct, setWatchPct]         = useState(initialWatchPct);
  const [completed, setCompleted]       = useState(initialWatchPct >= 90);
  const [transcriptOpen, setTransOpen]  = useState(false);
  const [resourceLoading, setResLoading] = useState<string | null>(null);

  async function saveProgress(pct: number, done?: boolean) {
    await fetch("/api/university/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lesson_id: lessonId,
        course_id: "", // filled by API via lesson lookup — pass empty, API uses lesson's course_id
        watch_pct: pct,
        completed: done,
      }),
    });
  }

  async function downloadResource(path: string, label: string) {
    setResLoading(path);
    try {
      const res = await fetch(`/api/university/resource-url?lesson_id=${lessonId}&path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = label;
        a.click();
      }
    } finally {
      setResLoading(null);
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{
        background: "#071a2e", padding: "14px clamp(16px,4vw,48px)",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <Link href="/university" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>HCMG U</Link>
        <span style={{ color: "#405166", fontSize: 12 }}>/</span>
        <Link href={`/university/course/${courseSlug}`} style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>{courseTitle}</Link>
        <span style={{ color: "#405166", fontSize: 12 }}>/</span>
        <span style={{ fontSize: 12, color: "#b9c5d0" }}>{lessonTitle}</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>
        {/* Pill + title */}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", background: "rgba(245,130,32,0.12)", color: "#f58220", padding: "3px 9px", borderRadius: 5 }}>
          HCMG U LESSON
        </span>
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, color: "#071a2e", letterSpacing: "-1px", margin: "12px 0 6px", fontFamily: "Manrope, system-ui" }}>
          {lessonTitle}
        </h1>
        {lessonDescription && (
          <p style={{ fontSize: 14, color: "#687383", lineHeight: 1.65, marginBottom: 24 }}>{lessonDescription}</p>
        )}

        {/* Video player */}
        <LessonPlayer
          lessonId={lessonId}
          onProgress={pct => { setWatchPct(pct); saveProgress(pct); }}
          onComplete={() => { setCompleted(true); saveProgress(100, true); }}
        />

        {/* Completion badge */}
        {completed && (
          <div style={{
            marginTop: 16, padding: "12px 18px", borderRadius: 10,
            background: "rgba(17,133,104,0.1)", border: "1px solid rgba(17,133,104,0.3)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ color: "#34d399", fontSize: 18 }}>✓</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#34d399" }}>Lesson completed</span>
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#071a2e", marginBottom: 10 }}>Downloads</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {resources.map(r => (
                <button
                  key={r.storage_path}
                  onClick={() => downloadResource(r.storage_path, r.label)}
                  disabled={resourceLoading === r.storage_path}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 16px", borderRadius: 9,
                    border: "1.5px solid #dfe4e8", background: "#fff",
                    fontSize: 13, fontWeight: 600, color: "#142234",
                    cursor: "pointer", textAlign: "left",
                    opacity: resourceLoading === r.storage_path ? 0.6 : 1,
                  }}
                >
                  <span style={{ fontSize: 16 }}>↓</span>
                  {resourceLoading === r.storage_path ? "Generating link…" : r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div style={{ marginTop: 24 }}>
            <button
              onClick={() => setTransOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700, color: "#071a2e", padding: 0,
              }}
            >
              <span style={{ transform: transcriptOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>▶</span>
              Transcript
            </button>
            {transcriptOpen && (
              <div style={{
                marginTop: 10, padding: "16px 18px", borderRadius: 10,
                background: "#f7f8fa", border: "1px solid #dfe4e8",
                fontSize: 13, color: "#687383", lineHeight: 1.8,
                whiteSpace: "pre-wrap",
              }}>
                {transcript}
              </div>
            )}
          </div>
        )}

        {/* Quiz */}
        {quizQuestions.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <QuizBlock
              lessonId={lessonId}
              questions={quizQuestions}
              onPassed={() => setCompleted(true)}
            />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 36, gap: 12 }}>
          {prevLessonId ? (
            <Link href={`/university/lesson/${prevLessonId}`} style={{
              padding: "12px 20px", borderRadius: 10, border: "1.5px solid #dfe4e8",
              background: "#fff", color: "#142234", fontWeight: 600, fontSize: 13, textDecoration: "none",
            }}>
              ← Previous lesson
            </Link>
          ) : <div />}

          {nextLessonId ? (
            <Link href={`/university/lesson/${nextLessonId}`} style={{
              padding: "12px 20px", borderRadius: 10,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
            }}>
              Next lesson →
            </Link>
          ) : (
            <Link href={`/university/course/${courseSlug}`} style={{
              padding: "12px 20px", borderRadius: 10,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
            }}>
              Back to course ✓
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
