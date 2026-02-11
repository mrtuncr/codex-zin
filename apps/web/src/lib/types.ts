export type NoteType =
  | "standard"
  | "dream"
  | "quote"
  | "todo"
  | "idea"
  | "thought"
  | "visual_note"
  | "journal";

export interface Note {
  id: string;
  type: NoteType;
  content: string;
  rawInput: string;
  summary?: string;
  aiTags: string[];
  isProcessed: boolean;
  createdAt: string;
}
