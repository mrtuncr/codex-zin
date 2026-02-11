import { NextResponse } from "next/server";
import { addUserTag } from "../../../../../lib/note-repository";

interface TagPayload {
  tag: string;
}

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  const payload = (await request.json()) as TagPayload;

  if (!payload.tag?.trim()) {
    return NextResponse.json({ error: "tag is required" }, { status: 400 });
  }

  const note = await addUserTag(params.id, payload.tag);

  if (!note) {
    return NextResponse.json({ error: "note not found" }, { status: 404 });
  }

  return NextResponse.json({ note });
}
