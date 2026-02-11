export type NoteType =
  | "standard"
  | "dream"
  | "quote"
  | "todo"
  | "idea"
  | "thought"
  | "visual_note"
  | "journal";

export type PlanId = "free" | "pro";

export interface User {
  id: string;
  email: string;
  planId: PlanId;
  preferences: {
    theme: "light" | "dark" | "system";
    mascot?: string;
  };
}

export interface Note {
  id: string;
  userId: string;
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
