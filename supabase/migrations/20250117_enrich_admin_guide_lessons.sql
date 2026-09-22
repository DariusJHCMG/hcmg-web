-- Rewrite all 8 Admin Guide lessons with rich Markdown using the new editor's full syntax:
-- Callouts (:::tip / :::warn / :::info), tables, images, code blocks, strong hierarchy

DO $$
BEGIN

-- ── Lesson 1: System Overview ────────────────────────────────────────────────
UPDATE uni_lessons SET transcript = $L1$
# Welcome to HCMG U

HCMG U is the internal training platform for every authorized HCMG team member — from new Loan Officers to senior leadership. Everything you need to learn the business, stay compliant, and grow professionally lives here.

---

## How the System Works

The platform flows in one simple direction:

| Step | What Happens |
|---|---|
| **1. Course Studio** | Admins & Trainers build courses, add videos, write lessons, set completion rules |
| **2. Media Library** | All videos, images, and PDFs uploaded once — reused across any lesson |
| **3. Assignments** | Published courses assigned to individuals, roles, org units, or the whole team |
| **4. Learner Dashboard** | Enrolled members watch lessons, take quizzes, and track progress |
| **5. Certificate Issued** | On 100% completion, a verified digital certificate is automatically awarded |

---

## Your Role in the System

| Role | Build Courses | Publish | Assign | Reports |
|---|---|---|---|---|
| **Admin** | ✓ | ✓ | ✓ | ✓ |
| **Trainer** | ✓ | ✓ | ✓ | ✓ |
| **Learner** | — | — | — | Own progress only |

:::info Not sure what role you are? Check your profile in the top-right corner of HCMG U. If you need a role change, contact your admin.

---

## Training Integrity — How Completions Are Verified

HCMG U uses **server-side verification**. The system tracks real engagement — not just whether you opened a lesson.

:::warn The browser never tells the server "I'm done." Only the server grants completion — and it requires proof.

Here's what counts:

- **Video lessons** — The server tracks exact segments you watched. Rewinding or skipping the same section does not add to your verified total.
- **Text lessons** — The server measures active reading time (tab must be visible and focused) *plus* scroll depth. You must scroll through the full lesson.
- **Quizzes** — You must score at or above the passing threshold (default **80%**) before the lesson counts as complete.

:::tip This system protects the integrity of your certificates. Every completion on your record is real.
$L1$ WHERE id = '5415db43-e7b4-4070-8f61-a0a55f311712';


-- ── Lesson 2: Creating a New Course ─────────────────────────────────────────
UPDATE uni_lessons SET transcript = $L2$
# Creating a New Course

Building a course in HCMG U takes three minutes to set up and as long as you need to build it right. This lesson walks you through every step from start to a published course shell.

---

## Step 1 — Navigate to Course Studio

Go to **HCMG U → Admin → Training Studio → Courses**.

You'll see a list of all existing courses with their status, category, and lesson count. Use the search bar to find a specific course, or filter by status.

:::tip Courses start as **Draft** and are completely invisible to learners until you choose to publish. Build freely without worrying about the team seeing unfinished work.

---

## Step 2 — Click "+ New Course"

Click the orange **+ New Course** button in the top-right corner. Fill in:

| Field | What to enter | Tips |
|---|---|---|
| **Course Title** | Public-facing name learners see | Keep under 60 characters |
| **Slug** | URL identifier, auto-generated | Only edit if you need a custom URL |
| **Description** | 1–3 sentence overview | Shows on the course card |
| **Category** | Pick from 6 options | Controls which section it appears under |

**Available categories:**
- General
- New LO Fast Start
- Sales & Conversion
- Products & Guidelines
- Systems & Operations
- Compliance

---

## Step 3 — You're in the Course Studio

Click **Create Course** and you land directly in the Course Studio — the command center for building your course.

### The Four Tabs

| Tab | What you do here |
|---|---|
| **Overview** | Title, thumbnail, description, category, difficulty, objectives |
| **Curriculum** | Build chapters and add lessons |
| **Assessments** | Create standalone course-level assessments |
| **Settings** | Certificate config, path tag, sort order |

---

## Overview Tab — Key Fields

- **Thumbnail** — Pick from Media Library or upload new. Recommended: 16:9, min 800×450px.
- **Difficulty** — Beginner / Intermediate / Advanced. Helps learners self-select.
- **Estimated Duration** — Total watch/read time in minutes. Displayed on the course card.
- **Pill Color** — Color accent on the card. Orange is the default HCMG brand color.
- **Learning Objectives** — Click **+ Add Objective** for each outcome. These appear on the course detail page.
- **Required Training** — Toggle on for mandatory courses. Required courses appear first on the learner dashboard and trigger compliance tracking.

:::warn Always fill in the **Description** and at least one **Learning Objective** before publishing. Learners use these to decide if a course is relevant to them.
$L2$ WHERE id = '183d7555-7749-4bee-ae4e-80fe97285591';


-- ── Lesson 3: Building Chapters & Lessons ───────────────────────────────────
UPDATE uni_lessons SET transcript = $L3$
# Building Chapters & Lessons

The Curriculum tab is where your course takes shape. Chapters organize your content into logical sections, and Lessons are the individual pieces learners consume.

---

## The Curriculum Structure

Think of it like a book:

```
Course
  └── Chapter 1 (e.g. "Getting Started")
        ├── Lesson 1 — System Overview (Text)
        └── Lesson 2 — Creating a Course (Text)
  └── Chapter 2 (e.g. "Adding Content")
        ├── Lesson 3 — Video Upload (Video)
        └── Lesson 4 — Knowledge Checks (Quiz)
```

There is no limit on chapters or lessons per chapter.

---

## Adding a Chapter

1. Click the **Curriculum** tab in the Course Studio.
2. Click **+ Add Chapter** in the left sidebar.
3. A new chapter called "Untitled" appears — click to rename it inline.
4. Add an optional **Chapter Description** — visible to learners as a section intro.

:::tip Name chapters as outcomes, not topics. "After this chapter you can..." is more motivating than "Chapter 1: Introduction."

---

## Adding a Lesson

1. With a chapter selected, click **+ Add Content** inside that chapter.
2. The **Add Content modal** appears — pick a lesson type.
3. You're taken directly to the **Lesson Editor** for that lesson.
4. Return to Curriculum tab to see it listed under your chapter.

---

## The Five Lesson Types

| Type | Icon | Best for |
|---|---|---|
| **Video** | ▶ | Demonstrations, CEO messages, walkthroughs, HeyGen AI videos |
| **Text** | ☰ | Policy docs, SOPs, written guides, reference material |
| **Audio** | 🔊 | Podcast-style content, mobile learners |
| **Quiz** | 📝 | Knowledge checks, compliance verification |
| **Assignment** | 📋 | Field tasks, offline activities learners confirm completing |

---

## Reordering Content

- Drag **chapters** up/down in the left sidebar to reorder them.
- Drag **lessons** within a chapter to change their order.
- Changes save immediately — no extra save button needed.

:::info The order chapters and lessons appear in the studio is exactly the order learners see them. Plan your flow before you start building.
$L3$ WHERE id = '52901eef-4252-4f38-a067-bb67313b62b2';


-- ── Lesson 4: Uploading Video Content ────────────────────────────────────────
UPDATE uni_lessons SET transcript = $L4$
# Uploading Video Content

Video is the most powerful lesson format in HCMG U. This lesson covers all three ways to add video — direct upload, the Media Library, and HeyGen AI video links.

---

## Creating a Video Lesson

1. In the **Curriculum tab**, click **+ Add Content** under your chapter.
2. Select **Video** from the Add Content modal.
3. You're taken to the **Lesson Editor** → go to the **Media tab**.

---

## Three Ways to Add Video

### ⬆ Option A — Upload Directly

Click **Select Video** in the Upload / Library tab and choose a file from your computer.

**Supported formats:**

| Format | Extension |
|---|---|
| MP4 (recommended) | `.mp4` |
| QuickTime | `.mov` |
| AVI | `.avi` |
| Matroska | `.mkv` |
| Flash Video | `.flv` |
| Windows Media | `.wmv` |
| WebM | `.webm` |

:::warn Files over 50MB must be uploaded through the **Supabase Dashboard** directly to the `uni-media` storage bucket. The in-app uploader has a 50MB limit.

---

### 📂 Option B — Pick from Media Library

Click **Select from Media Library** to reuse a video already uploaded.

:::tip This is the recommended approach when using the same video in multiple lessons. Upload once, use everywhere — no duplicates in storage.

---

### ✦ Option C — HeyGen AI Video

Click the **HeyGen tab** in the Media panel and paste your HeyGen video URL:

```
https://app.heygen.com/videos/the-hcmg-success-formula-10a0d31a...
```

The system automatically extracts the embed ID and converts it to:

```
https://app.heygen.com/embeds/10a0d31a...
```

The video plays inline in the lesson — no redirect to HeyGen required.

:::info Both the full share URL and direct embed URL are accepted. The studio will auto-convert either format.

---

## Adding Transcripts

After uploading video, go to the **Transcript tab** and paste the full text transcript.

- Appears as a collapsible section below the video for learners.
- Helps with accessibility (hearing-impaired learners).
- Makes the lesson searchable by keyword.

---

## Attaching Download Resources

Go to **Settings panel → Download Resources → Add files** to attach PDFs, worksheets, or cheat sheets. Learners can download them directly from the lesson page.

**Supported audio formats** (for Audio lessons): `.mp3` `.wav` `.aac` `.flac` `.ogg` `.m4a`
$L4$ WHERE id = '481301a7-2460-41f1-84ae-86fa5862c829';


-- ── Lesson 5: Lesson Settings & Completion Rules ─────────────────────────────
UPDATE uni_lessons SET transcript = $L5$
# Lesson Settings & Completion Rules

Every lesson has a **Settings panel** — this is where you control who sees it, how it's completed, and what happens when a learner finishes. Getting this right is the most important part of building a quality course.

---

## Opening the Settings Panel

In any Lesson Editor: look for the **⚙ Settings** header on the right column. It's always visible alongside your lesson content.

---

## Visibility: Draft vs Published

:::warn Publishing the **course** does NOT automatically publish its lessons. Every lesson must be individually published.

| State | What it means |
|---|---|
| **Draft** | Hidden from all learners. Only admins/trainers can preview. |
| **Published** | Visible to all enrolled learners in this course. |

Change visibility using the **Draft / Publish** toggle at the top of the Settings panel.

---

## Completion Mode — The Most Important Setting

This determines **when the server grants a completion** for this lesson. The browser never self-reports — only the server decides.

| Mode | How completion is granted | Best for |
|---|---|---|
| `watch_pct` | Server verifies ≥ threshold% of video actually watched | Video lessons |
| `quiz_pass` | Learner must pass the attached knowledge check | Compliance, policy lessons |
| `manual` | Learner clicks "Mark as Complete" after viewing | Short informational content |
| `dwell_time` | Server verifies minimum active read time + 80% scroll depth | Text and assignment lessons |

:::tip For compliance-critical lessons, always use `quiz_pass`. This ensures the learner didn't just scroll through — they had to demonstrate understanding.

---

## Completion Threshold

Default: **80%** for video lessons.

**Example:** A 10-minute video requires at least 8 minutes of *unique* segments watched. The server tracks which exact portions were watched — rewind-and-rewatch the same segment and it doesn't add to your total.

---

## Other Settings

| Setting | What it does |
|---|---|
| **Allow Lesson Preview** | Non-enrolled visitors can see this lesson. Use for "free preview" lessons. |
| **Prerequisites** | Requires a previous lesson to be completed before this one unlocks. |
| **Duration (secs)** | Expected read/watch time. For text lessons, sets the minimum dwell time (50% of this value, clamped 60–600 seconds). |
| **Download Resources** | Attach PDFs and files learners can download from the lesson page. |

---

## How the Heartbeat System Works

Every 5 seconds while a learner is active, the browser sends a heartbeat to the server:

```
→ Browser: "Still here. Tab visible. Scrolled to 65%. Watching position 4:32."
← Server: "Verified. Watch progress: 72%."
```

- Tab hidden or window unfocused? **No credit accumulates.**
- Video paused? **No credit accumulates.**
- Fast-forward through unseen segments? **Skipped segments don't count.**

:::info This is why learners sometimes see their progress bar update in small increments rather than jumping — it's the server calculating verified engagement in real time.
$L5$ WHERE id = '9f02e0b0-6f10-4ec4-931a-34e8cae06783';


-- ── Lesson 6: Building Knowledge Checks ─────────────────────────────────────
UPDATE uni_lessons SET transcript = $L6$
# Building Knowledge Checks (Quizzes)

Knowledge checks are the most powerful tool for verifying real learning — not just passive watching. This lesson covers how to build effective quizzes and set them up to gate lesson completion.

---

## What Are Knowledge Checks?

Quizzes in HCMG U can be attached to **any lesson type** — not just Quiz-type lessons. You can add questions to:

- A **Video lesson** (quiz appears after the video)
- A **Text lesson** (quiz appears after the content)
- A standalone **Quiz lesson**

:::info Attaching a quiz to a lesson and setting Completion Mode to `quiz_pass` means the learner must pass the quiz before the lesson counts as complete.

---

## Adding Questions

1. Open the lesson in the **Lesson Editor**.
2. Click the **Knowledge Check** tab.
3. Click **+ Add Question**.
4. Select the question type.
5. Type your question text in the large field.
6. Add answer options — click the **circle** next to each correct answer to mark it green.
7. Add an optional **Explanation** — shown after the learner submits their answer.
8. Click **Save Question**.

---

## Question Types

| Type | How it works | Best for |
|---|---|---|
| **Multiple Choice** | One correct answer from 2–8 options | Most lessons — fast and clear |
| **Multiple Select** | Multiple correct answers, "select all that apply" | Complex policy, multi-part rules |
| **True / False** | Two options, auto-populated | Quick comprehension checks |
| **Short Answer** | Free-text response, not auto-graded | Reflection, self-assessment |

---

## Setting the Pass Threshold

1. Go to the lesson's **Settings panel** (right side).
2. Set **Completion Mode** → `quiz_pass`.
3. Set **Completion Threshold** to your target score (e.g. `80`).

The lesson will not count as complete until the learner achieves that score. They can retry as many times as needed.

---

## Tips for Effective Quiz Questions

:::tip The explanation field is the most valuable part of a quiz. Use it to teach — not just to say "correct" or "wrong."

- **Keep questions focused** — one concept per question.
- **Use 4 answer options** for multiple choice — reduces guessing from 50% to 25%.
- **Make wrong answers plausible** — avoid obviously silly distractors.
- **Write explanations for every question** — this is the moment real learning happens.
- **For compliance courses**, always use `quiz_pass` mode. Scrolling through is not the same as understanding.
- **Avoid trick questions** — the goal is to verify learning, not to trap people.

---

## Example: Good vs. Weak Question

**Weak:**
> What color is the HCMG logo?

**Strong:**
> A borrower asks why their rate is higher than what they saw advertised online. What is the most important first step?
> - A) Tell them the advertised rate was wrong
> - B) Review their credit profile and loan scenario ✓
> - C) Transfer them to the rate lock desk
> - D) Apologize and offer a float down

*Explanation: Advertised rates are typically for ideal borrowers. Always review the actual scenario before making any rate comparisons.*
$L6$ WHERE id = 'ee9eb3c0-36eb-4487-a226-704f19eeee3e';


-- ── Lesson 7: Course Settings & Publishing ───────────────────────────────────
UPDATE uni_lessons SET transcript = $L7$
# Course Settings & Publishing

You've built the course. Now it's time to configure the final settings and get it live for your team.

---

## The Settings Tab

Click the **Settings tab** in the Course Studio for course-level configuration.

| Setting | What it does |
|---|---|
| **Path Tag** | Internal identifier linking this course to a Learning Path (e.g. `harrys_playbook`). Leave blank unless intentional. |
| **Certificate on Completion** | Toggle on to automatically issue a digital certificate when all lessons are complete. |
| **Certificate Title** | Name printed on the certificate (e.g. "New LO Fast Start — Completion Certificate"). |
| **Expiry** | Optional: certificate expires after X days. Used for annual re-certification compliance. |
| **CEUs / Credit Hours** | Continuing education credits. Appears on the certificate if set. |
| **Sort Order** | Position in the course library. Lower number = appears first. |

:::tip Certificates that expire automatically trigger a re-enrollment workflow — great for compliance courses that must be completed annually.

---

## Pre-Publish Checklist

Before clicking Publish, go through this checklist:

- [ ] Course title and description are filled in
- [ ] Thumbnail uploaded (16:9, min 800×450px)
- [ ] At least one chapter with at least one lesson
- [ ] **Each lesson is individually Published** (not just the course)
- [ ] Video uploaded or HeyGen URL set on all video lessons
- [ ] Completion mode configured on every lesson
- [ ] Learning objectives added (at least 3)

:::warn The most common mistake: publishing the course but forgetting to publish individual lessons. Learners will see the course card but find no lessons inside.

---

## Publishing the Course

1. Return to the Course Studio (any tab).
2. Click the **Publish** button in the top-right corner.
3. Status badge changes: **Draft → Published**.
4. The course is now visible to enrolled learners on their dashboard.

To unpublish at any time, click the status badge and select **Draft**. Learners lose access immediately — their progress is preserved.

---

## About Certificates

When a learner completes all lessons in a course with certificates enabled:

1. The system generates a unique verification URL.
2. An email is sent to the learner with a download link.
3. The certificate is logged in their profile under **My Certificates**.

:::info Anyone can verify a certificate at `hcmgloans.com/university/verify/[id]` — no login required. This lets learners share their certificates externally.
$L7$ WHERE id = 'b3acdd60-1a61-4ade-bd4c-5dfdaf57b391';


-- ── Lesson 8: Assigning Training to the Team ─────────────────────────────────
UPDATE uni_lessons SET transcript = $L8$
# Assigning Training to the Team

Publishing a course makes it visible in the catalog. **Assigning** it is what puts it on a specific learner's dashboard with a progress tracker and optional due date.

---

## Publishing vs. Assigning — What's the Difference?

| Action | What it does |
|---|---|
| **Publish** | Course appears in the public catalog. Anyone with HCMG U access can browse it. |
| **Assign** | Course appears on a specific learner's dashboard with a progress bar and due date. |

:::info Think of publishing as putting a book on the shelf. Assigning is handing it directly to someone and saying "read this by Friday."

---

## How to Assign a Course

1. Go to **Admin → Assignments**.
2. Click **+ New Assignment**.
3. Select the course from the dropdown.
4. Choose who to assign it to:

| Target | Who gets enrolled |
|---|---|
| **Individual** | One specific person, selected by name |
| **Role** | All Loan Officers, all Processors, etc. |
| **Org Unit** | A specific branch, department, or team |
| **Everyone** | All active HCMG U members |

5. Set an optional **Due Date**.
6. Click **Assign** — enrolled learners see the course on their dashboard immediately.

:::tip Set due dates for any required training. Overdue assignments appear in **red** on the HR Overview and trigger automated reminder notifications.

---

## Monitoring Progress

Once a course is assigned, track completion across three views:

| Where | What you see |
|---|---|
| **Reports** `/university/admin/reports` | Completion rates, overdue tracking, quiz performance scores |
| **HR Overview** `/university/hr` | Every employee's training status, flagged non-compliance, new hire progress |
| **Manager View** `/university/manager` | Your direct reports' progress on assigned courses |

---

## Quick Navigation Reference

| Destination | URL |
|---|---|
| All courses | `/university/admin/courses` |
| New course | `/university/admin/courses/new` |
| Course Studio | `/university/admin/studio/[courseId]` |
| Media Library | `/university/admin/media` |
| Assignments | `/university/admin/assignments` |
| Reports | `/university/admin/reports` |
| HR Overview | `/university/hr` |
| Audit Log | `/university/admin/audit-log` |

---

:::tip You're done! Your course is live and assigned. Head to **Reports** in 24 hours to see your first completions come in.
$L8$ WHERE id = 'f0577b0e-3535-4b34-a4a7-7b72f283b463';

END $$;
