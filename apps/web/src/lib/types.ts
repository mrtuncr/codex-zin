export type NoteType =
  | "standard"
  | "dream"
  | "quote"
  | "todo"
  | "idea"
  | "thought"
  | "visual_note"
  | "journal";

export type NoteModality = "text" | "audio" | "image";

export interface Note {
  id: string;
  type: NoteType;
  modality: NoteModality;
export interface Note {
  id: string;
  type: NoteType;
  content: string;
  rawInput: string;
  summary?: string;
  aiTags: string[];
  userTags: string[];
  specialistData: Record<string, unknown>;
  uiFormat: {
    accent?: string;
    typography?: string;
  };
  isProcessed: boolean;
  createdAt: string;
}
