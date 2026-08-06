/**
 * /api/goal-engine/coaching-notes
 *
 * GET    — Returns all coaching notes (admin view, newest first)
 * POST   — Creates a new coaching note + optional action items
 * PATCH  — Marks an action item as complete/incomplete
 * DELETE — Deletes a coaching note (and its actions via cascade)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sb = createServiceClient();

  const { data: notes, error } = await sb
    .from("coaching_notes")
    .select(`
      id, employee_id, note_type, is_private, note,
      coaching_date, follow_up_date, created_at,
      employee:profiles!coaching_notes_employee_id_fkey(full_name, avatar_url),
      actions:coaching_actions(id, action_text, due_date, completed, completed_at)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notes: notes ?? [] });
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    employee_id,
    note_type     = "general",
    note,
    follow_up_date,
    is_private    = false,
    actions       = [] as string[],
  } = body;

  if (!employee_id || !note?.trim()) {
    return NextResponse.json({ error: "employee_id and note are required." }, { status: 400 });
  }

  const sb = createServiceClient();

  // Create the note
  const { data: newNote, error: noteErr } = await sb
    .from("coaching_notes")
    .insert({
      employee_id,
      manager_id:     profile.id,
      note_type,
      note:           note.trim(),
      follow_up_date: follow_up_date || null,
      is_private,
      coaching_date:  new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (noteErr || !newNote) {
    return NextResponse.json({ error: noteErr?.message ?? "Failed to create note." }, { status: 500 });
  }

  // Create action items if provided
  const validActions = (actions as string[]).filter(a => typeof a === "string" && a.trim());
  if (validActions.length > 0) {
    await sb.from("coaching_actions").insert(
      validActions.map(a => ({
        coaching_note_id: newNote.id,
        employee_id,
        manager_id:       profile.id,
        action_text:      a.trim(),
      }))
    );
  }

  return NextResponse.json({ note_id: newNote.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { action_id, completed } = await req.json().catch(() => ({}));
  if (!action_id) return NextResponse.json({ error: "action_id required." }, { status: 400 });

  const sb = createServiceClient();
  const { error } = await sb
    .from("coaching_actions")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", action_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { note_id } = await req.json().catch(() => ({}));
  if (!note_id) return NextResponse.json({ error: "note_id required." }, { status: 400 });

  const sb = createServiceClient();
  // coaching_actions cascade deletes when coaching_note is deleted (FK set in migration)
  const { error } = await sb.from("coaching_notes").delete().eq("id", note_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
