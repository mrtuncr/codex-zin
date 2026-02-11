export type NoteType =
  | "standard"
  | "dream"
  | "quote"
  | "todo"
  | "idea"
  | "thought"
  | "visual_note"
  | "journal";

export interface OrchestratorInput {
  content: string;
  modality: "text" | "image" | "audio";
}

export interface UnifiedNoteResponse {
  type: NoteType;
  summary: string;
  aiTags: string[];
  specialistData: Record<string, unknown>;
}

const typeHints: Record<NoteType, string[]> = {
  standard: ["note"],
  dream: ["dream", "sleep"],
  quote: ["quote", "said"],
  todo: ["todo", "task", "must", "need to"],
  idea: ["idea", "startup", "product"],
  thought: ["thought", "thinking"],
  visual_note: ["image", "photo", "diagram"],
  journal: ["today", "felt", "mood"]
};

function inferType(content: string, modality: OrchestratorInput["modality"]): NoteType {
  if (modality === "image") return "visual_note";

  const normalized = content.toLowerCase();
  for (const [type, hints] of Object.entries(typeHints) as [NoteType, string[]][]) {
    if (hints.some((hint) => normalized.includes(hint))) return type;
  }

  return "standard";
}

export function runOrchestrator(input: OrchestratorInput): UnifiedNoteResponse {
  const words = input.content.trim().split(/\s+/).filter(Boolean);
  const type = inferType(input.content, input.modality);
  const summary = words.length <= 20 ? input.content : `${words.slice(0, 20).join(" ")}...`;

  const aiTags = Array.from(
    new Set(
      input.content
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 3)
    )
  );

  return { type, summary, aiTags, specialistData: {} };
}
