import { NextResponse } from "next/server";
import { exportNotes, replaceAllNotes } from "../../../../lib/note-repository";
import type { Note } from "../../../../lib/types";

interface ImportPayload {
  notes: Note[];
}

export async function GET() {
  const notes = await exportNotes();
  return NextResponse.json({ notes, exportedAt: new Date().toISOString() });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ImportPayload;

  if (!Array.isArray(payload.notes)) {
    return NextResponse.json({ error: "notes array is required" }, { status: 400 });
  }

  const count = await replaceAllNotes(payload.notes);
  return NextResponse.json({ ok: true, count });
}
