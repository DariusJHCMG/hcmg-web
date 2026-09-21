"use client";

import React from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
export const STUDIO_COLORS = {
  navy:        "#06182a",
  navyMid:     "#0c2b4b",
  navyLight:   "#142234",
  orange:      "#f58220",
  orangeLight: "#FF9847",
  text:        "#071a2e",
  textMuted:   "#687383",
  textLight:   "#b9c5d0",
  border:      "#dfe4e8",
  surface:     "#f7f8fa",
  white:       "#ffffff",
  green:       "#34d399",
  greenDark:   "#118568",
  red:         "#f87171",
  redDark:     "#b91c1c",
  amber:       "#fbbf24",
} as const;

// ── Status config ─────────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  draft:       { label: "Draft",       color: STUDIO_COLORS.textMuted, bg: "rgba(104,115,131,0.12)", border: "rgba(104,115,131,0.25)", description: "Hidden from learners. Content can be edited freely." },
  in_review:   { label: "In Review",   color: STUDIO_COLORS.amber,     bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",   description: "Submitted for review. Awaiting admin approval." },
  approved:    { label: "Approved",    color: "#60a5fa",               bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)",   description: "Approved for publication. Ready to publish." },
  published:   { label: "Published",   color: STUDIO_COLORS.green,     bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", description: "Live and visible to authorized learners." },
  archived:    { label: "Archived",    color: STUDIO_COLORS.red,       bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", description: "Removed from catalog. Historical records preserved." },
} as const;

// ── Shared input primitives ───────────────────────────────────────────────────

const baseInput: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  borderRadius: 8, border: `1.5px solid ${STUDIO_COLORS.border}`,
  background: STUDIO_COLORS.white, fontSize: 14, color: STUDIO_COLORS.text,
  outline: "none", fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};

const focusStyle: React.CSSProperties = {
  borderColor: STUDIO_COLORS.orange,
  boxShadow: `0 0 0 3px rgba(245,130,32,0.1)`,
};

export function StudioInput(props: React.InputHTMLAttributes<HTMLInputElement> & { hint?: string; error?: string }) {
  const [focused, setFocused] = React.useState(false);
  const { hint, error, ...rest } = props;
  return (
    <div>
      <input
        {...rest}
        style={{ ...baseInput, ...(focused ? focusStyle : {}), ...(error ? { borderColor: STUDIO_COLORS.redDark } : {}), ...props.style }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      />
      {error && <p style={{ fontSize: 12, color: STUDIO_COLORS.redDark, marginTop: 4 }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export function StudioTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hint?: string }) {
  const [focused, setFocused] = React.useState(false);
  const { hint, ...rest } = props;
  return (
    <div>
      <textarea
        {...rest}
        style={{ ...baseInput, resize: "vertical", minHeight: 90, ...(focused ? focusStyle : {}), ...props.style }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      />
      {hint && <p style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export function StudioSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <select
      {...props}
      style={{
        ...baseInput, cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23687383' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", paddingRight: 36,
        ...(focused ? focusStyle : {}), ...props.style,
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

export function FieldLabel({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.1em", color: STUDIO_COLORS.text, display: "block",
      }}>
        {children}
        {required && <span style={{ color: STUDIO_COLORS.orange, marginLeft: 3 }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 11, color: STUDIO_COLORS.textMuted, marginTop: 2 }}>{hint}</p>}
    </div>
  );
}

export function StudioToggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
    >
      <div style={{
        width: 40, height: 22, borderRadius: 11,
        background: checked ? STUDIO_COLORS.orange : STUDIO_COLORS.border,
        position: "relative", transition: "background 0.2s", flexShrink: 0, marginTop: 2,
      }}>
        <div style={{
          position: "absolute", top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: STUDIO_COLORS.text }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, marginTop: 2 }}>{description}</div>}
      </div>
    </button>
  );
}

export function StudioButton({
  children, onClick, variant = "primary", size = "md",
  disabled, type = "button", fullWidth, style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
  style?: React.CSSProperties;
}) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary:   { background: disabled ? STUDIO_COLORS.border : `linear-gradient(135deg, ${STUDIO_COLORS.orangeLight}, ${STUDIO_COLORS.orange})`, color: disabled ? STUDIO_COLORS.textMuted : "#fff", border: "none" },
    secondary: { background: STUDIO_COLORS.white, color: STUDIO_COLORS.text, border: `1.5px solid ${STUDIO_COLORS.border}` },
    ghost:     { background: "transparent", color: STUDIO_COLORS.textMuted, border: "none" },
    danger:    { background: STUDIO_COLORS.white, color: STUDIO_COLORS.redDark, border: `1.5px solid ${STUDIO_COLORS.red}` },
    success:   { background: "rgba(52,211,153,0.12)", color: STUDIO_COLORS.greenDark, border: `1.5px solid rgba(52,211,153,0.3)` },
  };
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 12px", fontSize: 12, borderRadius: 7 },
    md: { padding: "9px 18px", fontSize: 13, borderRadius: 9 },
    lg: { padding: "12px 24px", fontSize: 14, borderRadius: 10 },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit", whiteSpace: "nowrap",
        ...(fullWidth ? { width: "100%" } : {}),
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
        transition: "opacity 0.15s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 6,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 700, color: cfg.color,
      letterSpacing: "0.6px", textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

// ── SaveIndicator ─────────────────────────────────────────────────────────────
export type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const map = {
    saving: { label: "Saving…",        color: STUDIO_COLORS.textMuted },
    saved:  { label: "✓ Saved",         color: STUDIO_COLORS.greenDark },
    error:  { label: "⚠ Save failed",   color: STUDIO_COLORS.redDark },
  };
  const cfg = map[state as keyof typeof map];
  if (!cfg) return null;
  return <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>;
}

// ── Section card ──────────────────────────────────────────────────────────────
export function SectionCard({ title, description, children, actions }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{
      background: STUDIO_COLORS.white,
      border: `1px solid ${STUDIO_COLORS.border}`,
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${STUDIO_COLORS.border}`,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
      }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: STUDIO_COLORS.text, margin: 0 }}>{title}</h3>
          {description && <p style={{ fontSize: 12, color: STUDIO_COLORS.textMuted, marginTop: 3 }}>{description}</p>}
        </div>
        {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", padding: "48px 24px",
      border: `2px dashed ${STUDIO_COLORS.border}`, borderRadius: 12,
      color: STUDIO_COLORS.textMuted,
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: STUDIO_COLORS.text, marginBottom: 6 }}>{title}</h4>
      <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 360, marginBottom: action ? 20 : 0 }}>{description}</p>
      {action}
    </div>
  );
}

// ── Inline error banner ───────────────────────────────────────────────────────
export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
      padding: "12px 16px",
      background: "rgba(185,28,28,0.06)", border: `1.5px solid rgba(185,28,28,0.2)`, borderRadius: 9,
      fontSize: 13, color: STUDIO_COLORS.redDark,
    }}>
      <span>⚠ {message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: STUDIO_COLORS.textMuted, fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
      )}
    </div>
  );
}

// ── Lesson type badge ─────────────────────────────────────────────────────────
export const LESSON_TYPE_LABELS: Record<string, { label: string; icon: string; color: string; description?: string }> = {
  video:           { label: "Video",           icon: "▶",  color: "#3b82f6", description: "Deliver video content in a variety of formats" },
  text:            { label: "Text / Article",  icon: "📄", color: "#8b5cf6", description: "Create text-based content with links and images" },
  audio:           { label: "Audio",           icon: "🔊", color: "#06b6d4", description: "Deliver audio content in a variety of formats" },
  presentation:    { label: "Presentation",    icon: "📊", color: "#f59e0b", description: "Slide-based presentation content" },
  resource:        { label: "Resource",        icon: "📎", color: "#10b981", description: "Downloadable files and reference materials" },
  knowledge_check: { label: "Knowledge Check", icon: "✏", color: "#ef4444", description: "Evaluate members with a variety of question types" },
  assignment:      { label: "Assignment",      icon: "📋", color: "#7c3aed", description: "Prompt members to complete a project or assignment" },
};

export function LessonTypeBadge({ lessonType }: { lessonType: string }) {
  const cfg = LESSON_TYPE_LABELS[lessonType] ?? LESSON_TYPE_LABELS.video;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 5,
      background: `${cfg.color}18`,
      fontSize: 10, fontWeight: 700,
      color: cfg.color, textTransform: "uppercase", letterSpacing: "0.5px",
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Assessment type badge ─────────────────────────────────────────────────────
export const ASSESSMENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  knowledge_check:   { label: "Knowledge Check",   color: "#ef4444" },
  quiz:              { label: "Practice Quiz",      color: "#f59e0b" },
  final_assessment:  { label: "Final Assessment",   color: "#3b82f6" },
  certification_exam:{ label: "Certification Exam", color: "#8b5cf6" },
};

export function AssessmentTypeBadge({ assessmentType }: { assessmentType: string }) {
  const cfg = ASSESSMENT_TYPE_LABELS[assessmentType] ?? ASSESSMENT_TYPE_LABELS.final_assessment;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 5,
      background: `${cfg.color}18`,
      fontSize: 10, fontWeight: 700, color: cfg.color,
      textTransform: "uppercase", letterSpacing: "0.5px",
    }}>
      {cfg.label}
    </span>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: STUDIO_COLORS.textLight, fontSize: 12 }}>/</span>}
          {item.href ? (
            <a
              href={item.href}
              style={{ fontSize: 12, color: i === items.length - 1 ? STUDIO_COLORS.textLight : STUDIO_COLORS.textMuted, textDecoration: "none", fontWeight: 600 }}
            >
              {item.label}
            </a>
          ) : (
            <span style={{ fontSize: 12, color: STUDIO_COLORS.textLight }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function StudioTabs<T extends string>({
  tabs, active, onChange,
}: {
  tabs: { id: T; label: string; badge?: number | string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${STUDIO_COLORS.border}`, paddingBottom: 0 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          style={{
            padding: "10px 16px",
            border: "none", background: "transparent", cursor: "pointer",
            fontSize: 13, fontWeight: active === t.id ? 700 : 500,
            color: active === t.id ? STUDIO_COLORS.orange : STUDIO_COLORS.textMuted,
            borderBottom: `2px solid ${active === t.id ? STUDIO_COLORS.orange : "transparent"}`,
            marginBottom: -1, transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
          }}
        >
          {t.label}
          {t.badge != null && (
            <span style={{
              minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px",
              background: active === t.id ? STUDIO_COLORS.orange : STUDIO_COLORS.border,
              color: active === t.id ? "#fff" : STUDIO_COLORS.textMuted,
              fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
export function SkeletonBlock({ height = 16, width = "100%", radius = 6 }: {
  height?: number;
  width?: number | string;
  radius?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        height, width, borderRadius: radius,
        background: "linear-gradient(90deg, #eef0f3 25%, #e5e7ea 50%, #eef0f3 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

// Inject shimmer keyframes once (CSR only)
if (typeof document !== "undefined") {
  const existing = document.getElementById("studio-shimmer");
  if (!existing) {
    const style = document.createElement("style");
    style.id = "studio-shimmer";
    style.textContent = `@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
    document.head.appendChild(style);
  }
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{
      border: `1px solid ${STUDIO_COLORS.border}`, borderRadius: 12,
      overflow: "hidden", background: STUDIO_COLORS.white,
    }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${STUDIO_COLORS.border}` }}>
        <SkeletonBlock height={14} width="40%" />
      </div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[...Array(lines)].map((_, i) => (
          <SkeletonBlock key={i} height={12} width={i % 2 === 0 ? "100%" : "70%"} />
        ))}
      </div>
    </div>
  );
}

// ── Confirmation dialog ───────────────────────────────────────────────────────
export function ConfirmDialog({
  title, body, confirmLabel = "Confirm", cancelLabel = "Cancel",
  onConfirm, onCancel, destructive = false,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(6,24,42,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onKeyDown={e => e.key === "Escape" && onCancel()}
    >
      <div style={{
        background: STUDIO_COLORS.white, borderRadius: 12, padding: "28px 32px",
        width: "min(480px, 100%)", boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
      }}>
        <h3 id="confirm-dialog-title" style={{ fontSize: 16, fontWeight: 800, color: STUDIO_COLORS.text, margin: "0 0 10px" }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: STUDIO_COLORS.textMuted, margin: "0 0 24px", lineHeight: 1.6 }}>{body}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${STUDIO_COLORS.border}`,
              background: "transparent", fontSize: 13, fontWeight: 600,
              color: STUDIO_COLORS.textMuted, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: destructive ? STUDIO_COLORS.redDark : STUDIO_COLORS.navy,
              fontSize: 13, fontWeight: 700, color: STUDIO_COLORS.white,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
