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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as NoteType | null;
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");

  const notes = await listNotes({
    type: type ?? undefined,
    tag: tag ?? undefined,
    q: q ?? undefined
  });

  return NextResponse.json({ notes });
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
    isProcessed: !fastPath,
    createdAt: new Date().toISOString()
  };

  const created = await createNote(note);
  return NextResponse.json({ note: created }, { status: 201 });
}
