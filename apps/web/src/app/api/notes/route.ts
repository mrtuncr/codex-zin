import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  buildSpecialistData,
  classifyIntent,
  generateTags,
  getUiFormat,
  shouldShortCircuit,
  summarize
} from "../../../lib/orchestrator";
import { createNote, listNotes } from "../../../lib/note-repository";
import type { Note, NoteModality, NoteType } from "../../../lib/types";

interface CreateNotePayload {
  content: string;
  modality?: NoteModality;
import { classifyIntent, generateTags, shouldShortCircuit, summarize } from "../../../lib/orchestrator";
import { notesStore } from "../../../lib/store";
import type { Note, NoteType } from "../../../lib/types";

interface CreateNotePayload {
  content: string;
  modality?: "text" | "audio" | "image";
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as NoteType | null;
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const notes = await listNotes({
    type: type ?? undefined,
    tag: tag ?? undefined,
    q: q ?? undefined,
    from: from ?? undefined,
    to: to ?? undefined
  });

  return NextResponse.json({ notes });
    q: q ?? undefined
  });

  return NextResponse.json({ notes });
  const filtered = notesStore.filter((note) => {
    if (type && note.type !== type) return false;
    if (tag && !note.aiTags.includes(normalize(tag))) return false;

    if (q) {
      const query = normalize(q);
      const haystack = `${note.content} ${note.summary ?? ""} ${note.aiTags.join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  return NextResponse.json({ notes: filtered });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CreateNotePayload;

  if (!payload.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const modality = payload.modality ?? "text";
  const fastPath = shouldShortCircuit(payload.content);
  const inferredType = classifyIntent(payload.content, modality);

  const note: Note = {
    id: randomUUID(),
    modality,
    content: payload.content.trim(),
    rawInput: payload.content,
    type: fastPath ? "standard" : inferredType,
    summary: fastPath ? undefined : summarize(payload.content),
    aiTags: fastPath ? [] : generateTags(payload.content),
    userTags: [],
    specialistData: fastPath ? {} : buildSpecialistData(inferredType, payload.content),
    uiFormat: getUiFormat(fastPath ? "standard" : inferredType),
  const fastPath = shouldShortCircuit(payload.content);

  const note: Note = {
    id: randomUUID(),
    content: payload.content.trim(),
    rawInput: payload.content,
    type: fastPath ? "standard" : classifyIntent(payload.content),
    summary: fastPath ? undefined : summarize(payload.content),
    aiTags: fastPath ? [] : generateTags(payload.content),
    isProcessed: !fastPath,
    createdAt: new Date().toISOString()
  };

  const created = await createNote(note);
  return NextResponse.json({ note: created }, { status: 201 });
  notesStore.unshift(note);
  return NextResponse.json({ note }, { status: 201 });
}
