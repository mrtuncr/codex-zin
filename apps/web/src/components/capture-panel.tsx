"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Note, NoteType } from "../lib/types";

const intentOptions: Array<{ label: string; value: "all" | NoteType }> = [
  { label: "Hepsi", value: "all" },
  { label: "Standard", value: "standard" },
  { label: "Todo", value: "todo" },
  { label: "Idea", value: "idea" },
  { label: "Journal", value: "journal" },
  { label: "Dream", value: "dream" },
  { label: "Quote", value: "quote" }
];

interface NotesStats {
  total: number;
  processed: number;
  byType: Partial<Record<NoteType, number>>;
  topTags: string[];
}

export function CapturePanel() {
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<NotesStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | NoteType>("all");
  const [selectedTag, setSelectedTag] = useState<string>("");
export function CapturePanel() {
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | NoteType>("all");
  const [search, setSearch] = useState("");
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedType !== "all") params.set("type", selectedType);
    if (selectedTag) params.set("tag", selectedTag);
    if (search.trim()) params.set("q", search.trim());
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [search, selectedTag, selectedType]);

  async function refreshStats() {
    const response = await fetch("/api/notes/stats");
    const data = (await response.json()) as { stats: NotesStats };
    setStats(data.stats);
  }
    if (search.trim()) params.set("q", search.trim());
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [search, selectedType]);

  async function refreshNotes() {
    const response = await fetch(`/api/notes${queryString}`);
    const data = (await response.json()) as { notes: Note[] };
    setNotes(data.notes);
  }

  async function refreshAll() {
    await Promise.all([refreshNotes(), refreshStats()]);
  }

  async function addTag(noteId: string) {
    const tag = tagDrafts[noteId]?.trim();
    if (!tag) return;

    setError(null);
    const tag = window.prompt("Yeni kullanıcı etiketi:");
    if (!tag?.trim()) return;

    const response = await fetch(`/api/notes/${noteId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag })
    });

    if (!response.ok) {
      setError("Etiket eklenemedi.");
      return;
    }

    setTagDrafts((prev) => ({ ...prev, [noteId]: "" }));
    await refreshAll();
    await refreshNotes();
  }

  async function removeNote(noteId: string) {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });

    if (!response.ok) {
      setError("Not silinemedi.");
      return;
    }

    await refreshAll();
    await refreshNotes();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Bir not girmelisin.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, modality: "text" })
      });

      if (!response.ok) throw new Error("Not kaydedilemedi");

      setContent("");
      await refreshAll();
      await refreshNotes();
    } catch {
      setError("Not kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    refreshNotes();
  }, [queryString]);

  return (
    <section style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <h1 style={{ margin: 0 }}>ZIN · MVP Başlangıcı</h1>
      <p style={{ color: "#a1a1aa" }}>
        Hızlı metin yakalama + 100 kelime üstü içeriklerde basit AI sınıflandırma iskeleti.
      </p>

      {stats && (
        <div style={{ display: "grid", gap: "0.35rem", margin: "0.8rem 0", color: "#d4d4d8", fontSize: 14 }}>
          <div>Toplam not: {stats.total}</div>
          <div>AI işlenen not: {stats.processed}</div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {stats.topTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag((prev) => (prev === tag ? "" : tag))}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${selectedTag === tag ? "#a78bfa" : "#3f3f46"}`,
                  background: "transparent",
                  color: selectedTag === tag ? "#c4b5fd" : "#d4d4d8",
                  padding: "0.2rem 0.55rem",
                  cursor: "pointer"
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Aklındakini yaz..."
          rows={7}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #27272a",
            background: "#111113",
            color: "inherit",
            padding: "0.75rem"
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            justifySelf: "start",
            borderRadius: 10,
            border: "none",
            padding: "0.6rem 1rem",
            background: "#7c3aed",
            color: "white",
            cursor: loading ? "progress" : "pointer"
          }}
        >
          {loading ? "Kaydediliyor..." : "Notu Kaydet"}
        </button>

        {error && <small style={{ color: "#fb7185" }}>{error}</small>}
      </form>

      <div style={{ marginTop: "2rem", display: "grid", gap: "0.8rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as "all" | NoteType)}
            style={{ borderRadius: 8, border: "1px solid #3f3f46", background: "#111113", color: "inherit", padding: "0.45rem" }}
          >
            {intentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ara (anlam/kelime/tag)..."
            style={{
              minWidth: 240,
              borderRadius: 8,
              border: "1px solid #3f3f46",
              background: "#111113",
              color: "inherit",
              padding: "0.45rem 0.6rem"
            }}
          />

          <button
            onClick={refreshAll}
            style={{ borderRadius: 8, border: "1px solid #3f3f46", background: "transparent", color: "inherit", padding: "0.45rem 0.8rem" }}
          >
            Yenile
          </button>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag("")}
              style={{ borderRadius: 8, border: "1px solid #a78bfa", background: "transparent", color: "#c4b5fd", padding: "0.45rem 0.8rem" }}
            >
              Tag filtresini temizle: #{selectedTag}
            </button>
          )}
            onClick={refreshNotes}
            style={{ borderRadius: 8, border: "1px solid #3f3f46", background: "transparent", color: "inherit", padding: "0.45rem 0.8rem" }}
          >
            Notları Yenile
          </button>
        </div>

        {notes.length === 0 && <p style={{ color: "#a1a1aa" }}>Henüz not yok. İlk notu ekle.</p>}

        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem", display: "grid", gap: "0.8rem" }}>
          {notes.map((note) => (
            <li key={note.id} style={{ border: `1px solid ${note.uiFormat.accent ?? "#27272a"}`, borderRadius: 12, padding: "0.9rem" }}>
              <strong style={{ textTransform: "uppercase", fontSize: 12 }}>{note.type}</strong>
              <small style={{ display: "block", color: "#a1a1aa" }}>Modality: {note.modality}</small>
              <p style={{ margin: "0.4rem 0" }}>{note.content}</p>

              {note.summary && <small style={{ color: "#a1a1aa", display: "block" }}>Özet: {note.summary}</small>}

              {note.aiTags.length > 0 && (
                <p style={{ margin: "0.35rem 0 0", color: "#c4b5fd", fontSize: 13 }}>
                  AI Etiketleri: {note.aiTags.join(", ")}
                </p>
              )}

              {note.userTags.length > 0 && (
                <p style={{ margin: "0.3rem 0 0", color: "#86efac", fontSize: 13 }}>
                  Kullanıcı Etiketleri: {note.userTags.join(", ")}
                </p>
              )}

              {Object.keys(note.specialistData).length > 0 && (
                <pre style={{ margin: "0.5rem 0 0", color: "#d4d4d8", fontSize: 12, whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(note.specialistData, null, 2)}
                </pre>
              )}

              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
                <input
                  value={tagDrafts[note.id] ?? ""}
                  onChange={(event) => setTagDrafts((prev) => ({ ...prev, [note.id]: event.target.value }))}
                  placeholder="etiket"
                  style={{
                    borderRadius: 8,
                    border: "1px solid #3f3f46",
                    background: "#111113",
                    color: "inherit",
                    padding: "0.3rem 0.5rem"
                  }}
                />
                <button
                  onClick={() => addTag(note.id)}
                  style={{ borderRadius: 8, border: "1px solid #3f3f46", background: "transparent", color: "inherit", padding: "0.3rem 0.6rem" }}
                >
                  Etiket Ekle
                </button>
                <button
                  onClick={() => removeNote(note.id)}
                  style={{ borderRadius: 8, border: "1px solid #7f1d1d", background: "transparent", color: "#fca5a5", padding: "0.3rem 0.6rem" }}
                >
                  Sil
                </button>
              </div>
              <button
                onClick={() => addTag(note.id)}
                style={{
                  marginTop: "0.5rem",
                  borderRadius: 8,
                  border: "1px solid #3f3f46",
                  background: "transparent",
                  color: "inherit",
                  padding: "0.3rem 0.6rem"
                }}
              >
                Etiket Ekle
              </button>
            <li key={note.id} style={{ border: "1px solid #27272a", borderRadius: 12, padding: "0.9rem" }}>
              <strong style={{ textTransform: "uppercase", fontSize: 12 }}>{note.type}</strong>
              <p style={{ margin: "0.4rem 0" }}>{note.content}</p>
              {note.summary && <small style={{ color: "#a1a1aa" }}>Özet: {note.summary}</small>}
              {note.aiTags.length > 0 && (
                <p style={{ margin: "0.35rem 0 0", color: "#c4b5fd", fontSize: 13 }}>
                  Etiketler: {note.aiTags.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
