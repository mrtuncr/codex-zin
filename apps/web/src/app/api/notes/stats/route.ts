import { NextResponse } from "next/server";
import { getNotesStats } from "../../../../lib/note-repository";

export async function GET() {
  const stats = await getNotesStats();
  return NextResponse.json({ stats });
}
