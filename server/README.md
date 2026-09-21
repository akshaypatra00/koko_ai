# Koko AI - Backend Server

Production-grade multi-model AI orchestration backend for **Koko AI**, built with Node.js, Express, ES Modules, Supabase Authentication & PostgreSQL, Row-Level Security (RLS), and intelligent multi-provider routing (Gemini, Groq, OpenRouter).

---

## Architecture Overview

```
User Prompt
    │
    ▼
[Express Server] ──► [Supabase JWT Auth Middleware] (validates Bearer token)
    │
    ├──► [Profile & Preferences Service] (retrieves style, background, language)
    ├──► [Message History Service] (retrieves relevant conversation turns)
    ├──► [Memory Service] (retrieves relevant long-term memories)
    │
    ▼
[Request Analyzer] (classifies intent: coding, research, debugging, image, etc.)
    │
    ▼
[Prompt Planner] (synthesizes context without invented assumptions)
    │
    ▼
[Model Router] (rules + consensus routing to Gemini, Groq, or OpenRouter)
    │
    ├── Single Model Execution OR
    └── Parallel Consensus Execution
            │
            ▼
        [Response Judge] (evaluates accuracy, completeness, latency & score)
            │
            ▼
        [Telemetry Engine] (marks winning model, latency, and failed models)
            │
            ▼
[Structured Response] (saves message to Supabase & returns to React UI)
```

---

## Prerequisites

- Node.js v18+ (tested with v22+)
- A Supabase project with PostgreSQL

---

## Installation

```bash
cd server
npm install
```

---

## Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP port | `5000` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase Anon Key | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | - |
| `GEMINI_API_KEY` | Google Gemini API Key | - |
| `GROQ_API_KEY` | Groq API Key | - |
| `OPENROUTER_API_KEY` | OpenRouter API Key | - |
| `DEFAULT_TEXT_PROVIDER` | Fallback primary AI provider | `gemini` |
| `DEFAULT_TEXT_MODEL` | Fallback text model | `gemini-2.5-flash` |
| `ENABLE_GEMINI_IMAGE` | Toggle Gemini Imagen generation | `true` |
| `ENABLE_GEMINI_VIDEO` | Toggle Gemini Veo video generation | `false` |

---

## Supabase Database Migration

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the SQL script located in [`supabase_migration.sql`](./supabase_migration.sql).
3. This creates all 6 tables (`profiles`, `user_preferences`, `conversations`, `messages`, `memories`, `feedback`), enables Row-Level Security (RLS) on each table, sets user-level isolation policies, and configures auto-profile creation triggers.

---

## Running the Server

### Development Mode (with hot-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Automated Tests
```bash
npm test
```

---

## API Endpoints

### 1. Health
- `GET /api/health` - Server health check.

### 2. Profile & Preferences (Authenticated)
- `GET /api/profile` - Get authenticated user's profile.
- `PATCH /api/profile` - Update display name or avatar.
- `GET /api/profile/preferences` - Get personalized user preferences.
- `PATCH /api/profile/preferences` - Update routing/response preferences.

### 3. Conversations (Authenticated)
- `GET /api/conversations` - List user's conversations.
- `POST /api/conversations` - Create a new conversation thread.
- `GET /api/conversations/:conversationId` - Fetch single conversation.
- `PATCH /api/conversations/:conversationId` - Update conversation title.
- `DELETE /api/conversations/:conversationId` - Delete conversation.
- `GET /api/conversations/:conversationId/messages` - Fetch messages in thread.

### 4. Chat & Orchestration (Authenticated)
- `POST /api/chat` - Submit prompt to multi-model pipeline.
  ```json
  {
    "conversationId": "optional-id",
    "message": "Write a WebSocket state manager in React",
    "preferredProvider": "auto",
    "responseMode": "normal"
  }
  ```
- `POST /api/chat/regenerate` - Regenerate the last assistant response with updated routing.

### 5. Memories (Authenticated)
- `GET /api/memories` - Get user's durable facts and preferences.
- `POST /api/memories` - Manually save a new memory.
- `PATCH /api/memories/:memoryId` - Update memory text or importance.
- `DELETE /api/memories/:memoryId` - Delete memory.

### 6. Feedback (Authenticated)
- `POST /api/feedback` - Rate message output.
  ```json
  {
    "messageId": "msg-id",
    "rating": "up",
    "reason": "Accurate code generation"
  }
  ```
