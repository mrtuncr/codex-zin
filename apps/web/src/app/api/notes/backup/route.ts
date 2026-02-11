import { NextResponse } from "next/server";
import {
  exportNotes,
  mergeNotes,
  replaceAllNotes
} from "../../../../lib/note-repository";
import {
  adminHeaderName,
  isAdminAuthorized,
  isAdminProtectionEnabled
} from "../../../../lib/server/auth";
import type { Note } from "../../../../lib/types";

interface ImportPayload {
  notes: Note[];
}

const MAX_IMPORT_NOTES = 5000;

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json(
      {
        error: "unauthorized",
        hint: `set ${adminHeaderName()} header`,
        protectionEnabled: isAdminProtectionEnabled()
      },
      { status: 401 }
    );
  }

  const notes = await exportNotes();
  return NextResponse.json({ notes, exportedAt: new Date().toISOString() });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);

  if (!isAdminAuthorized(request)) {
    return NextResponse.json(
      {
        error: "unauthorized",
        hint: `set ${adminHeaderName()} header`,
        protectionEnabled: isAdminProtectionEnabled()
      },
      { status: 401 }
    );
  }

  const mode = searchParams.get("mode") === "merge" ? "merge" : "replace";
  const payload = (await request.json()) as ImportPayload;

  if (!Array.isArray(payload.notes)) {
    return NextResponse.json({ error: "notes array is required" }, { status: 400 });
  }

  if (payload.notes.length > MAX_IMPORT_NOTES) {
    return NextResponse.json(
      { error: `import limit exceeded (${MAX_IMPORT_NOTES})` },
      { status: 400 }
    );
  }

  const count =
    mode === "merge"
      ? await mergeNotes(payload.notes)
      : await replaceAllNotes(payload.notes);

  return NextResponse.json({ ok: true, count, mode });
}
