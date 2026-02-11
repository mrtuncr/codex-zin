import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Note, NoteType } from "./types";

const dataDir = path.join(process.cwd(), ".data");
const notesFile = path.join(dataDir, "notes.json");

interface NoteQuery {
  type?: NoteType;
  tag?: string;
  q?: string;
}

export interface NotesStats {
  total: number;
  processed: number;
  byType: Partial<Record<NoteType, number>>;
  topTags: string[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function hydrateNote(note: Partial<Note>): Note {
  return {
    id: note.id ?? "",
    type: note.type ?? "standard",
    modality: note.modality ?? "text",
    content: note.content ?? "",
    rawInput: note.rawInput ?? note.content ?? "",
    summary: note.summary,
    aiTags: Array.isArray(note.aiTags) ? note.aiTags : [],
    userTags: Array.isArray(note.userTags) ? note.userTags : [],
    specialistData: note.specialistData ?? {},
    uiFormat: note.uiFormat ?? {},
    isProcessed: Boolean(note.isProcessed),
    createdAt: note.createdAt ?? new Date().toISOString()
  };
}

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(notesFile, "utf8");
  } catch {
    await writeFile(notesFile, "[]", "utf8");
  }
}

async function readNotes(): Promise<Note[]> {
  await ensureDataFile();
  const raw = await readFile(notesFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<Note>[];
    return Array.isArray(parsed) ? parsed.map(hydrateNote) : [];
  } catch {
    return [];
  }
}

async function writeNotes(notes: Note[]): Promise<void> {
  await ensureDataFile();
  await writeFile(notesFile, JSON.stringify(notes, null, 2), "utf8");
}

export async function listNotes(query: NoteQuery = {}): Promise<Note[]> {
  const notes = await readNotes();

  return notes.filter((note) => {
    if (query.type && note.type !== query.type) return false;
    if (query.tag) {
      const tag = normalize(query.tag);
      if (!note.aiTags.includes(tag) && !note.userTags.includes(tag)) return false;
    }

    if (query.q) {
      const needle = normalize(query.q);
      const haystack = `${note.content} ${note.summary ?? ""} ${note.aiTags.join(" ")} ${note.userTags.join(" ")}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });
}

export async function getNotesStats(): Promise<NotesStats> {
  const notes = await readNotes();
  const byType: Partial<Record<NoteType, number>> = {};
  const tagCounts = new Map<string, number>();

  for (const note of notes) {
    byType[note.type] = (byType[note.type] ?? 0) + 1;

    for (const tag of [...note.aiTags, ...note.userTags]) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  return {
    total: notes.length,
    processed: notes.filter((note) => note.isProcessed).length,
    byType,
    topTags
  };
}

export async function createNote(note: Note): Promise<Note> {
  const notes = await readNotes();
  notes.unshift(note);
  await writeNotes(notes);
  return note;
}

export async function addUserTag(noteId: string, tag: string): Promise<Note | null> {
  const notes = await readNotes();
  const normalizedTag = normalize(tag);
  const note = notes.find((entry) => entry.id === noteId);

  if (!note || !normalizedTag) return null;

  if (!note.userTags.includes(normalizedTag)) {
    note.userTags = [...note.userTags, normalizedTag];
    await writeNotes(notes);
  }

  return note;
}

export async function deleteNote(noteId: string): Promise<boolean> {
  const notes = await readNotes();
  const nextNotes = notes.filter((note) => note.id !== noteId);

  if (nextNotes.length === notes.length) return false;

  await writeNotes(nextNotes);
  return true;
}
