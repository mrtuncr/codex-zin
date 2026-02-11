import { NextResponse } from "next/server";
import { deleteNote } from "../../../../lib/note-repository";
import { adminHeaderName, isAdminAuthorized } from "../../../../lib/server/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized", hint: `set ${adminHeaderName()} header` }, { status: 401 });
  }

  const deleted = await deleteNote(params.id);

  if (!deleted) {
    return NextResponse.json({ error: "note not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
