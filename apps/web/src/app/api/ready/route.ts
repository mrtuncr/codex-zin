import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const dataDir = path.join(process.cwd(), ".data");
const probeFile = path.join(dataDir, ".ready_probe");

export async function GET() {
  try {
    await mkdir(dataDir, { recursive: true });
    await writeFile(probeFile, new Date().toISOString(), "utf8");
    await readFile(probeFile, "utf8");
    await access(dataDir);

    return NextResponse.json(
      {
        ok: true,
        service: "zin-web",
        checks: {
          storageWritable: true
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        service: "zin-web",
        checks: {
          storageWritable: false
        },
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
