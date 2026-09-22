"use client";

import { useState } from "react";
import { LessonPlayer } from "@/components/university/LessonPlayer";
import { TextLessonEngine } from "@/components/university/TextLessonEngine";
import { QuizBlock } from "@/components/university/QuizBlock";
import { renderMarkdown } from "@/components/university/studio/LessonStudio";
import Link from "next/link";

// CSS injected once for all md-preview content (headings, tables, callouts, code)
const MD_STYLES = `
.md-article h1{font-size:26px;font-weight:800;color:#071a2e;margin:28px 0 10px;letter-spacing:-0.6px;font-family:Manrope,system-ui,sans-serif;line-height:1.25}
.md-article h2{font-size:20px;font-weight:700;color:#071a2e;margin:24px 0 8px;letter-spacing:-0.3px;padding-bottom:6px;border-bottom:2px solid #f0f2f5}
.md-article h3{font-size:16px;font-weight:700;color:#142234;margin:18px 0 6px}
.md-article h4{font-size:14px;font-weight:700;color:#3b4a5a;margin:14px 0 4px}
.md-article p{margin:0 0 12px;color:#3b4a5a;font-size:15px;line-height:1.75}
.md-article ul,.md-article ol{padding-left:22px;margin:0 0 12px;color:#3b4a5a}
.md-article li{margin-bottom:5px;font-size:15px;line-height:1.7}
.md-article strong{font-weight:700;color:#071a2e}
.md-article em{font-style:italic;color:#3b4a5a}
.md-article a{color:#f58220;text-decoration:none}
.md-article a:hover{text-decoration:underline}
.md-article blockquote{border-left:4px solid #f58220;margin:16px 0;padding:10px 16px;background:rgba(245,130,32,0.05);border-radius:0 8px 8px 0;font-style:italic;color:#3b4a5a}
.md-article hr{border:none;border-top:2px solid #f0f2f5;margin:24px 0}
.md-article code{background:#f0f2f5;padding:2px 6px;border-radius:5px;font-size:13px;font-family:'DM Mono','Fira Code',monospace;color:#c7254e}
.md-article pre{background:#1e2433;border-radius:10px;padding:18px 20px;margin:16px 0;overflow-x:auto}
.md-article pre code{background:none;color:#e2e8f0;font-size:13px;padding:0;border-radius:0}
.md-article img{max-width:100%;border-radius:10px;margin:16px 0;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.08)}
.md-article table{width:100%;border-collapse:collapse;margin:16px 0;font-size:14px}
.md-article th{background:#f7f8fa;text-align:left;padding:9px 12px;font-weight:700;color:#071a2e;border-bottom:2px solid #e5e7eb}
.md-article td{padding:9px 12px;border-bottom:1px solid #f0f2f5;color:#3b4a5a;vertical-align:top}
.md-article tr:last-child td{border-bottom:none}
.md-callout{padding:12px 16px;border-radius:10px;margin:14px 0;font-size:14px;line-height:1.6}
.md-callout-tip{background:rgba(59,130,212,0.07);border-left:3px solid #3b82d4;color:#1e3a5f}
.md-callout-warn{background:rgba(245,130,32,0.07);border-left:3px solid #f58220;color:#6b3000}
.md-callout-info{background:rgba(34,197,94,0.07);border-left:3px solid #22c55e;color:#14532d}
`;

interface Resource { label: string; storage_path: string }
interface QuizQuestion { id: string; question_text: string; options: { label: string }[]; explanation?: string | null; question_type?: string }

interface Props {
  lessonId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string;
  lessonDescription: string | null;
  lessonType?: string;
  transcript: string | null;
  resources: Resource[];
  quizQuestions: QuizQuestion[];
  /** ID of the assessment linked to this lesson (for knowledge_check completion_mode) */
  linkedAssessmentId: string | null;
  prevLessonId: string | null;
  nextLessonId: string | null;
  initialWatchPct: number;
  /** True if the user has already passed the quiz for this lesson in a previous visit */
  initialQuizPassed?: boolean;
  completionMode?: string;
  completionThresholdPct?: number;
}

export function LessonPageClient({
  lessonId, courseId, courseSlug, courseTitle, lessonTitle, lessonDescription,
  lessonType, transcript, resources, quizQuestions, linkedAssessmentId,
  prevLessonId, nextLessonId, initialWatchPct, initialQuizPassed = false,
  completionMode = "watch_pct", completionThresholdPct = 80,
}: Props) {
  const hasQuiz = quizQuestions.length > 0;
  const isVideoOrPres = !lessonType || lessonType === "video" || lessonType === "presentation";

  const [watchPct, setWatchPct]          = useState(initialWatchPct);
  // videoReady: video/text/audio portion is done
  const [videoReady, setVideoReady]      = useState(initialWatchPct >= completionThresholdPct);
  // quizPassed: quiz portion is done (only relevant when hasQuiz)
  const [quizPassed, setQuizPassed]      = useState(initialQuizPassed);
  // completed: the real gate — true only when ALL required portions are done
  const completed = hasQuiz && isVideoOrPres
    ? videoReady && quizPassed   // video lesson WITH quiz: need both
    : hasQuiz
      ? quizPassed               // text/etc with quiz: quiz is the gate
      : videoReady;              // no quiz: video/text completion is the gate

  const [transcriptOpen, setTransOpen]   = useState(false);
  const [resourceLoading, setResLoading] = useState<string | null>(null);
  const [resourceError, setResError]     = useState<string | null>(null);

  async function saveProgress(pct: number, done?: boolean) {
    await fetch("/api/university/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lesson_id: lessonId,
        course_id: courseId,
        watch_pct: pct,
        completed: done,
      }),
    });
  }

  async function downloadResource(path: string, label: string) {
    setResLoading(path);
    setResError(null);
    try {
      const res = await fetch(`/api/university/resource-url?lesson_id=${lessonId}&path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = label;
        a.click();
      } else {
        setResError(`Could not generate download link for "${label}". Please try again.`);
      }
    } catch {
      setResError(`Download failed for "${label}". Please check your connection and try again.`);
    } finally {
      setResLoading(null);
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      <style>{MD_STYLES}</style>
      {/* Breadcrumb */}
      <div style={{
        background: "#f7f8fa", borderBottom: "1px solid #dfe4e8",
        padding: "11px clamp(16px,4vw,48px)",
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      }}>
        <Link href="/university" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>HCMG U</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <Link href={`/university/course/${courseSlug}`} style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>{courseTitle}</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <span style={{ fontSize: 12, color: "#142234", fontWeight: 600 }}>{lessonTitle}</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>
        {/* Pill + title */}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", background: "rgba(245,130,32,0.12)", color: "#f58220", padding: "3px 9px", borderRadius: 5 }}>
          {lessonType === "audio" ? "Audio Lesson"
            : lessonType === "text" ? "Reading"
            : lessonType === "assignment" ? "Assignment"
            : lessonType === "presentation" ? "Presentation"
            : "Video Lesson"}
        </span>
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, color: "#071a2e", letterSpacing: "-1px", margin: "12px 0 6px", fontFamily: "Manrope, system-ui" }}>
          {lessonTitle}
        </h1>
        {lessonDescription && (
          <p style={{ fontSize: 14, color: "#687383", lineHeight: 1.65, marginBottom: 24 }}>{lessonDescription}</p>
        )}

        {/* Video / presentation player */}
        {(!lessonType || lessonType === "video" || lessonType === "presentation") && (
          <LessonPlayer
            lessonId={lessonId}
            courseId={courseId}
            onVerifiedProgress={pct => {
              // Server-verified percentage — update UI only, no client completion
              setWatchPct(pct);
            }}
            onServerComplete={() => {
              // Server has validated and recorded completion
              setVideoReady(true);
            }}
          />
        )}

        {/* Audio — wrapped in TextLessonEngine for dwell-time integrity */}
        {lessonType === "audio" && (
          <TextLessonEngine
            lessonId={lessonId}
            courseId={courseId}
            onServerComplete={() => setVideoReady(true)}
            onVerifiedProgress={pct => setWatchPct(pct)}
          >
            <div style={{
              marginBottom: 20, padding: "20px 24px", borderRadius: 12,
              background: "#f7f8fa", border: "1.5px solid #dfe4e8",
            }}>
              <audio
                controls
                style={{ width: "100%", display: "block" }}
              >
                <source src={`/api/university/video-url?lesson_id=${lessonId}`} />
                Your browser does not support the audio element.
              </audio>
            </div>
          </TextLessonEngine>
        )}

        {/* Text / reading content — wrapped in TextLessonEngine for integrity */}
        {lessonType === "text" && (
          <TextLessonEngine
            lessonId={lessonId}
            courseId={courseId}
            onServerComplete={() => setVideoReady(true)}
            onVerifiedProgress={pct => setWatchPct(pct)}
          >
            {transcript ? (
              <div className="md-article" style={{ marginBottom: 20 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(transcript) }}
              />
            ) : (
              <div style={{
                marginBottom: 20, padding: "24px", borderRadius: 12,
                background: "#f7f8fa", border: "1px solid #dfe4e8",
                textAlign: "center", color: "#687383", fontSize: 14,
              }}>
                No reading content available for this lesson yet.
              </div>
            )}
          </TextLessonEngine>
        )}

        {/* Assignment — wrapped in TextLessonEngine for integrity */}
        {lessonType === "assignment" && (
          <TextLessonEngine
            lessonId={lessonId}
            courseId={courseId}
            onServerComplete={() => setVideoReady(true)}
            onVerifiedProgress={pct => setWatchPct(pct)}
          >
            <div style={{
              marginBottom: 20, padding: "20px 24px", borderRadius: 12,
              background: "rgba(245,130,32,0.04)", border: "1.5px solid rgba(245,130,32,0.2)",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#071a2e", marginBottom: 8 }}>
                Field Assignment
              </div>
              {transcript ? (
                <div className="md-article"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(transcript) }}
                />
              ) : (
                <p style={{ fontSize: 14, color: "#687383", margin: 0 }}>
                  Complete the assignment as described by your instructor, then mark this lesson as complete below.
                </p>
              )}
            </div>
          </TextLessonEngine>
        )}

        {/* Manual completion button */}
        {completionMode === "manual" && !completed && (lessonType === "video" || lessonType === "presentation" || !lessonType) && (
          <button
            onClick={() => { setVideoReady(true); saveProgress(watchPct, true); }}
            style={{
              marginTop: 16, width: "100%", padding: "13px", borderRadius: 10,
              background: "rgba(245,130,32,0.08)", border: "1.5px solid rgba(245,130,32,0.3)",
              fontSize: 14, fontWeight: 700, color: "#f58220", cursor: "pointer",
            }}
          >
            ✓ Mark as complete
          </button>
        )}

        {/* Knowledge check CTA — for quiz_pass completion mode */}
        {completionMode === "quiz_pass" && linkedAssessmentId && !completed && (
          <div style={{
            marginTop: 16, padding: "16px 18px", borderRadius: 10,
            background: "rgba(245,130,32,0.06)", border: "1.5px solid rgba(245,130,32,0.25)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#071a2e", marginBottom: 6 }}>
              Complete the knowledge check to finish this lesson
            </div>
            <p style={{ fontSize: 13, color: "#687383", margin: "0 0 12px" }}>
              Pass the knowledge check below to mark this lesson as complete.
            </p>
          </div>
        )}

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
            {resourceError && (
              <div style={{
                marginBottom: 10, padding: "10px 14px", borderRadius: 8,
                background: "rgba(185,28,28,0.06)", border: "1.5px solid rgba(185,28,28,0.2)",
                fontSize: 12, color: "#b91c1c", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              }}>
                <span>⚠ {resourceError}</span>
                <button onClick={() => setResError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#687383", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              </div>
            )}
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

        {/* Transcript — only show toggle for video/audio/presentation; text lessons render it inline above */}
        {transcript && lessonType !== "text" && lessonType !== "assignment" && (
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
                onPassed={() => setQuizPassed(true)}
                nextLessonId={null}
                courseSlug={undefined}
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
            completed ? (
              <Link href={`/university/lesson/${nextLessonId}`} style={{
                padding: "12px 20px", borderRadius: 10,
                background: "linear-gradient(135deg,#FF9847,#F37021)",
                color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
              }}>
                Next lesson →
              </Link>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <button disabled style={{
                  padding: "12px 20px", borderRadius: 10,
                  background: "#e2e8f0", color: "#9ca3af",
                  fontWeight: 700, fontSize: 13, border: "none", cursor: "not-allowed",
                }}>
                  🔒 Next lesson
                </button>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  {quizQuestions.length > 0
                    ? "Pass the knowledge check to continue"
                    : lessonType === "text" || lessonType === "assignment" || lessonType === "audio"
                      ? "Complete the reading to continue"
                      : "Finish watching to continue"}
                </span>
              </div>
            )
          ) : (
            completed ? (
              <Link href={`/university/course/${courseSlug}`} style={{
                padding: "12px 20px", borderRadius: 10,
                background: "linear-gradient(135deg,#FF9847,#F37021)",
                color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
              }}>
                Back to course ✓
              </Link>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <button disabled style={{
                  padding: "12px 20px", borderRadius: 10,
                  background: "#e2e8f0", color: "#9ca3af",
                  fontWeight: 700, fontSize: 13, border: "none", cursor: "not-allowed",
                }}>
                  🔒 Back to course
                </button>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  {quizQuestions.length > 0
                    ? "Pass the knowledge check to continue"
                    : lessonType === "text" || lessonType === "assignment" || lessonType === "audio"
                      ? "Complete the reading to continue"
                      : "Finish watching to continue"}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
