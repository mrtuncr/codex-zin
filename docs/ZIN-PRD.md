# ZIN - Product Requirements Document (PRD)

- **Version:** 1.0  
- **Status:** Draft  
- **Last Updated:** 2026-02-11

## 1. Executive Summary

ZIN is an AI-powered "Second Brain" note-taking application designed to frictionlessly capture, organize, and synthesize user thoughts. Unlike traditional note-taking apps that require manual organization, ZIN uses advanced AI to automatically tag, summarize, and categorize inputs from various sources (text, voice, image, handwriting). It transforms raw chaos into a structured, searchable knowledge base.

### 1.1 Vision

To become the most intuitive and intelligent personal knowledge management system that understands the user's intent without explicit instruction.

### 1.2 Core Value Proposition

- **Zero-Friction Capture:** Capture thoughts via voice, text, or camera instantly.
- **Automated Organization:** No more manual tagging or folder management. AI handles the taxonomy.
- **Contextual Intelligence:** The system understands if a note is a _To-Do_, a _Dream_, a _Quote_, or a _Business Idea_ and formats it accordingly.

## 2. Functional Requirements

### 2.1 Note Capture (The Input Layer)

The system must support multi-modal input processing.

| Feature ID | Feature Name | Description | Priority |
| --- | --- | --- | --- |
| CAP-01 | Quick Text Capture | Users can type raw thoughts. Short texts (&lt;100 words) are saved immediately; longer texts trigger AI processing. | P0 |
| CAP-02 | Voice Memos | Users can record voice notes. The system transcribes audio to text and preserves the original audio file. | P0 |
| CAP-03 | Image Analysis | Users can upload images. The AI analyzes visual content (e.g., identifying objects, reading text). | P0 |
| CAP-04 | Handwriting Recognition | OCR capability to convert handwritten notes on paper/whiteboard into digital text. | P1 |
| CAP-05 | Chrome Extension | A browser extension to capture content from the web directly into ZIN. | P1 |

### 2.2 AI Processing (The "Brain")

The core differentiator of ZIN. All inputs (except short texts) pass through an AI Orchestrator.

| Feature ID | Feature Name | Description | Priority |
| --- | --- | --- | --- |
| AI-01 | Intent Classification | Automatically categorizes notes into types: Standard, Dream, Quote, Todo, Idea, Thought, Visual Note, Journal. | P0 |
| AI-02 | Auto-Tagging | Generates 3 relevant tags based on content analysis. | P0 |
| AI-03 | Summarization | Creates a concise summary of long notes or transcripts. | P0 |
| AI-04 | Entity Extraction | Extracts dates, people, and locations (e.g., creating due dates from "meeting tomorrow"). | P1 |
| AI-05 | Sentiment Analysis | (For Journals/Dreams) Analyzes emotional tone to enrich the entry. | P2 |

### 2.3 Organization & Retrieval

| Feature ID | Feature Name | Description | Priority |
| --- | --- | --- | --- |
| ORG-01 | Smart Search | Semantic search allowing users to find notes by meaning, not just keywords. | P0 |
| ORG-02 | Dynamic Filtering | Filter by Intent (e.g., "Show me all Quotes"), Tags, or Date. | P1 |
| ORG-03 | Visual Gallery | A masonry-style grid layout to browse notes visually. | P1 |

## 3. Technical Architecture

### 3.1 Tech Stack

- **Frontend:** Next.js 14 (React), Tailwind CSS, shadcn/ui, Framer Motion.
- **Backend:** Next.js API Routes (Serverless).
- **Database:** PostgreSQL (via Supabase), managed with Drizzle ORM.
- **Storage:** Supabase Storage (for images/audio).
- **AI Engine:** Google Gemini Pro & Gemini Pro Vision (via Google AI Studio).
- **Package Manager:** pnpm (Monorepo with TurboRepo).

### 3.2 AI Pipeline (The Orchestrator)

The `AIOrchestrator` handles the complexity of processing notes.

#### Workflow

1. **Input:** User sends raw data (Text/Image/Audio).
2. **Short-Circuit:** If text &lt; 100 words, save directly (latency optimization).
3. **Local Analysis:** Determine input type properties locally.
4. **Prompt Construction:** Build a standardized prompt based on input type (e.g., specialized handwriting prompt).
5. **Single API Call:** Send to Gemini API.
   - Text inputs → Gemini Pro
   - Image/Handwriting → Gemini Pro Vision
   - Voice → Gemini Pro (with audio payload)
6. **Response Parsing:** Receive structured JSON `UnifiedNoteResponse`.
7. **Persistence:** Save normalized text, metadata, and vectors to the database.

#### Key Optimization

- **Single-Shot Processing:** Use a unified prompt to get classification, tagging, and formatting in one API call to reduce latency and cost.

## 4. Data Model

### 4.1 Core Schema (`packages/database/src/schema.ts`)

#### `users`

- `id`: UUID (Primary Key)
- `email`: String
- `planId`: Enum (`Free`, `Pro`)
- `preferences`: JSON (Theme, Mascot)

#### `notes`

- `id`: UUID
- `userId`: UUID (Foreign Key)
- `type`: Enum (`standard`, `dream`, `quote`, etc.)
- `content`: Text (normalized/cleaned)
- `rawInput`: Text (original input preservation)
- `summary`: Text (AI-generated)
- `aiTags`: JSON Array (`["tech", "ideas", "ai"]`)
- `userTags`: JSON Array (manual overrides)
- `specialistData`: JSONB (type-specific fields like `author` for quotes, `interpretation` for dreams)
- `uiFormat`: JSON (typography, color, accent hints for UI rendering)
- `isProcessed`: Boolean (processing status)

#### `subscriptions`

Tracks user entitlements and plan status (e.g., Stripe/RevenueCat integration).

## 5. UI/UX Guidelines

- **Design Philosophy:** Clean, modern, playful.
- **Theming:** Support Light/Dark/System + accent colors tied to note intent (e.g., Dreams = purple/haze, Ideas = yellow/bulb).
- **Responsiveness:** Mobile-first approach.
- **Components:** Built on shadcn/ui for consistency and accessibility.

## 6. Future Roadmap

- Mobile App: Native React Native application (initiated, currently paused for web focus).
- Vector Search: Implement `pgvector` for true semantic search.
- Chat with Notes: RAG (Retrieval-Augmented Generation) interface to "talk" to your brain.
- Integrations: Connect with Notion, Slack, and Email.
