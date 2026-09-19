"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Course { id: string; title: string; slug: string }
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  university_access: boolean;
}

interface Props {
  courses: Course[];
  profiles: UserProfile[];
  adminId: string;
}

type AssignmentType = "companywide" | "self" | "role" | "department";

export function AssignmentFormClient({ courses, profiles, adminId }: Props) {
  const router = useRouter();
  const [courseId, setCourseId]         = useState("");
  const [assignmentType, setAssignmentType] = useState<AssignmentType>("companywide");
  const [profileId, setProfileId]       = useState("");
  const [dueDate, setDueDate]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) { setError("Please select a course."); return; }
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // JSON fetch is CSRF-safe — browsers will not silently send cross-origin
      // JSON POST requests without a CORS preflight.
      const res = await fetch("/api/university/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_by:     adminId,
          course_id:       courseId,
          assignment_type: assignmentType,
          profile_id:      assignmentType === "self" && profileId ? profileId : undefined,
          due_date:        dueDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Assignment failed. Please try again.");
      } else {
        setSuccess(true);
        // Reset form
        setCourseId("");
        setAssignmentType("companywide");
        setProfileId("");
        setDueDate("");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1.5px solid #dfe4e8", background: "#fff",
    fontSize: 14, color: "#071a2e", outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Course */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 7 }}>
          Course <span style={{ color: "#f58220" }}>*</span>
        </label>
        <select
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Select a course…</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Assignment type */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 7 }}>
          Assign to <span style={{ color: "#f58220" }}>*</span>
        </label>
        <select
          value={assignmentType}
          onChange={e => setAssignmentType(e.target.value as AssignmentType)}
          required
          style={inputStyle}
        >
          <option value="companywide">All active HCMG U members</option>
          <option value="self">Individual user</option>
          <option value="role">By role</option>
          <option value="department">By department</option>
        </select>
      </div>

      {/* Individual user — shown only when assignment_type = self */}
      {assignmentType === "self" && (
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 7 }}>
            User <span style={{ color: "#f58220" }}>*</span>
          </label>
          <select
            value={profileId}
            onChange={e => setProfileId(e.target.value)}
            required={assignmentType === "self"}
            style={inputStyle}
          >
            <option value="">Select a team member…</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.full_name} — {p.email}</option>
            ))}
          </select>
        </div>
      )}

      {/* Due date */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 7 }}>
          Due date (optional)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(178,59,59,0.12)", border: "1px solid #f87171", borderRadius: 8, fontSize: 13, color: "#b23b3b" }}>
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div style={{ padding: "10px 14px", background: "rgba(52,211,153,0.1)", border: "1px solid #34d399", borderRadius: 8, fontSize: 13, color: "#118568", fontWeight: 600 }}>
          ✓ Course assigned successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !courseId}
        style={{
          padding: "13px 24px", borderRadius: 10,
          background: courseId && !loading
            ? "linear-gradient(135deg,#FF9847,#F37021)"
            : "#e5e7eb",
          color: courseId && !loading ? "#fff" : "#9ca3af",
          fontWeight: 700, fontSize: 14,
          border: "none",
          cursor: courseId && !loading ? "pointer" : "not-allowed",
          transition: "all 0.15s",
        }}
      >
        {loading ? "Assigning…" : "Assign course →"}
      </button>
    </form>
  );
}
