import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { classifyIntent, generateTags, shouldShortCircuit, summarize } from "../../../lib/orchestrator";
import { notesStore } from "../../../lib/store";
import type { Note } from "../../../lib/types";

interface CreateNotePayload {
  content: string;
  modality?: "text" | "audio" | "image";
}

export async function GET() {
  return NextResponse.json({ notes: notesStore });
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
