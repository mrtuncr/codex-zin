import { NextResponse } from "next/server";
import { deleteNote } from "../../../../lib/note-repository";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const deleted = await deleteNote(params.id);

  if (!deleted) {
    return NextResponse.json({ error: "note not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
