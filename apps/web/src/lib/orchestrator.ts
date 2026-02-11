import type { NoteType } from "./types";

export function shouldShortCircuit(text: string): boolean {
  return text.trim().split(/\s+/).filter(Boolean).length < 100;
}

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
