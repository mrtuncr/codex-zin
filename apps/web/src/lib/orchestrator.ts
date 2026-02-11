import type { NoteModality, NoteType } from "./types";
import type { NoteType } from "./types";

export function shouldShortCircuit(text: string): boolean {
  return text.trim().split(/\s+/).filter(Boolean).length < 100;
}

export function classifyIntent(content: string, modality: NoteModality = "text"): NoteType {
  if (modality === "image") return "visual_note";

export function classifyIntent(content: string): NoteType {
  const normalized = content.toLowerCase();

  if (normalized.includes("todo") || normalized.includes("task")) return "todo";
  if (normalized.includes("dream")) return "dream";
  if (normalized.includes("quote")) return "quote";
  if (normalized.includes("idea") || normalized.includes("startup")) return "idea";
  if (normalized.includes("today") || normalized.includes("felt")) return "journal";

  return "standard";
}

export function summarize(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean);
  return words.length <= 24 ? content : `${words.slice(0, 24).join(" ")}...`;
}

export function generateTags(content: string): string[] {
  return Array.from(
    new Set(
      content
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((token) => token.length > 4)
        .slice(0, 3)
    )
  );
}

export function buildSpecialistData(type: NoteType, content: string): Record<string, unknown> {
  const normalized = content.toLowerCase();

  if (type === "todo") {
    return {
      dueHint: normalized.includes("tomorrow") ? "tomorrow" : undefined,
      priority: normalized.includes("urgent") ? "high" : "normal"
    };
  }

  if (type === "quote") {
    const byMatch = content.match(/[-—]\s*(.+)$/);
    return {
      author: byMatch?.[1]?.trim() || "unknown"
    };
  }

  if (type === "journal" || type === "dream") {
    return {
      sentimentHint: normalized.includes("happy") ? "positive" : normalized.includes("sad") ? "negative" : "neutral"
    };
  }

  return {};
}

export function getUiFormat(type: NoteType): { accent?: string; typography?: string } {
  if (type === "dream") return { accent: "#a78bfa", typography: "serif" };
  if (type === "idea") return { accent: "#facc15", typography: "sans" };
  if (type === "todo") return { accent: "#34d399", typography: "sans" };
  if (type === "quote") return { accent: "#60a5fa", typography: "serif" };
  return { accent: "#71717a", typography: "sans" };
}
