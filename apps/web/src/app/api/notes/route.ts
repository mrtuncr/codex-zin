import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
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

  notesStore.unshift(note);
  return NextResponse.json({ note }, { status: 201 });
}
