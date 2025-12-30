# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

---

## Project-Specific Architecture

This is an AI-powered Northwind store assistant showcasing real-time voice interactions with a SQLite database using Google Gemini's native audio capabilities and Mastra framework.

### Commands

**Development:**
```bash
bun dev          # Start dev server with hot reload (src/index.ts)
bun start        # Production mode
bun run build    # Build frontend
bun lmstudio     # Run with LMStudio local models
```

### Database Layer

**Location:** `databases/northwind.sqlite` (SQLite database with Northwind schema)

**Schema Files:**
- `src/db/schema.ts` - Zod schemas for all entities (Product, Order, Customer, etc.)
- **IMPORTANT:** All database fields use **PascalCase** naming convention (e.g., `ProductName`, `CustomerId`, `OrderDate`)

**Query Functions:**
- `src/db/client.ts` - Singleton database connection and `getSchema()` helper
- `src/db/products.ts` - Product queries (`getProductById`, `searchProducts`, `getProductsByCategory`, etc.)
- `src/db/orders.ts` - Order queries (`getOrders`, `getOrdersByCustomer`, `getTotalSales`, etc.)
- `src/db/customers.ts`, `employees.ts` - Additional entity queries

**Input Validation:**
- `src/frameworks/schema.ts` - Centralized Zod schemas for tool inputs and structured response types
- Use these schemas for consistent validation across frameworks

### Agent Framework Implementations

The project demonstrates three AI agent implementations:

#### 1. Gemini Native Audio (Primary Voice Implementation)
- **Location:** `src/frameworks/gemini-native/`
- **Entry Point:** `src/index.ts` WebSocket handler for `/api/gemini-live`
- **Agent:** `src/frameworks/gemini-native/agent.ts` - Direct integration with Google Gemini Live API using `@google/genai` SDK
- **Tools:**
  - `tools/query-tool.ts` - Database queries via SQL
  - `tools/display-tool.ts` - Structured content display (products, orders, etc.)
  - `tools/termination-tool.ts` - Session termination
- **Model:** `gemini-2.5-flash-native-audio-preview-09-2025` (or configurable via `GEMINI_LIVE_MODEL`)
- **Audio:** 16kHz PCM16 sample rate
- **Features:**
  - Real-time bidirectional audio streaming
  - Tool calling with automatic execution and response
  - Input/output transcription events
  - Turn-based conversation management

#### 2. Mastra Framework (Voice Alternative)
- **Location:** `src/frameworks/mastra/agents/`
- **Agent:** `src/frameworks/mastra/agents/voice.ts` - Uses Mastra's voice capabilities
- **Tools:** `src/frameworks/mastra/agents/tools/` (database query tools)
- **Note:** Alternative implementation pattern for voice agents using Mastra SDK

#### 3. Realtime WebSocket Agent
- **Location:** `src/frameworks/realtime/`
- **Agent:** `src/frameworks/realtime/agent.ts` - Generic WebSocket agent wrapper
- **Mastra Integration:** `src/frameworks/realtime/mastra.ts` - Mastra agent with LMStudio/OpenAI models
- **Entry Point:** `src/index.ts` WebSocket handler for `/api/realtime`
- **Features:** Text-based agent interactions via WebSocket

### Real-Time Voice Component

**Location:** `src/components/realtime-call/`

**Key Parts:**
- `hooks/use-realtime.ts` - WebSocket connection management, audio I/O, connection state
- `hooks/use-audio-player.ts` - Audio playback buffer and Web Audio API
- `lib/audio-processor.ts` - Audio Worklet for PCM encoding at 16kHz sample rate
- `ui/realtime-interface.tsx` - Main UI component
- `ui/controls.tsx`, `visualizer.tsx`, `status-indicator.tsx` - UI subcomponents

**Audio Flow (Gemini Live):**
1. Microphone → Audio Worklet (PCM16 encoding at 16kHz) → WebSocket → Gemini Live
2. Gemini Live → WebSocket → Audio Player → Browser audio output

**Key Callbacks:**
- `onAudio` - Receives audio chunks from Gemini
- `onToolCall` / `onToolResult` - Tool execution lifecycle
- `onInputTranscription` / `onOutputTranscription` - Conversation transcripts
- `onTurnComplete` - Signals end of Gemini's response turn
- `onInterruption` - Handles user interruptions

### API Routes

The server (`src/index.ts`) exposes:
- `WS /api/gemini-live` - WebSocket for Gemini native audio (primary)
- `WS /api/realtime` - WebSocket for Mastra/generic realtime agents
- `/` - HTML entry point (serves `src/index.html`)
- `/audio-processor-16k.js` - Audio worklet script

### Environment Variables

Required in `.env`:
```
GOOGLE_API_KEY=...           # For Gemini models (required for /api/gemini-live)
GEMINI_API_KEY=...           # Alternative key name
GEMINI_LIVE_MODEL=...        # Optional: Override default model
GEMINI_LIVE_VOICE=...        # Optional: Voice name (default: "Kore")
LLM_MODEL=...                # For Mastra/realtime agents (e.g., "gpt-4o", "lmstudio_model")
```

### UI Components

- **AI Elements:** `src/components/ai-elements/` - Specialized components for rendering AI responses:
  - `tool.tsx` - Tool call visualization
  - `reasoning.tsx` - Chain-of-thought display
  - `sources.tsx` - Source citation rendering
  - `code-block.tsx` - Syntax-highlighted code blocks
  - Additional elements for artifacts, confirmations, tasks, etc.
- **Shadcn UI:** `src/components/ui/` - Radix UI-based components (button, dialog, select, etc.)
- **Voice Interface:** `src/components/realtime-call/` - Real-time audio chat UI

### Code Patterns

**Adding New Tools (Gemini Native):**
1. Create tool declaration in `src/frameworks/gemini-native/tools/` following the pattern:
   ```ts
   export const myToolDeclaration: FunctionDeclaration = {
     name: "tool_name",
     description: "Tool description for the model",
     parameters: { /* JSON Schema */ }
   };

   export const myToolExecutor = async (args: any) => {
     // Tool implementation
     return result;
   };
   ```
2. Add declaration to `functionDeclarations` array in `agent.ts`
3. Add executor to tool execution logic in `agent.ts`
4. Tool results are automatically sent back to Gemini

**Adding New Tools (Mastra):**
1. Create tool in `src/frameworks/mastra/agents/tools/`
2. Register in agent's `tools` object
3. Use Zod schema for input validation

**Database Queries:**
- Always use the query functions from `src/db/` rather than raw SQL when possible
- For custom queries, use `getDb()` from `src/db/client.ts`
- Remember PascalCase field naming when writing SQL queries
- Use Zod schemas from `src/db/schema.ts` for type safety

**Structured Responses:**
- Use `StoreResponseSchema` from `src/frameworks/schema.ts` for type-safe responses
- Supports product, products, order, orders, employee, employees, customer, customers, and text_response types

**Model Configuration:**
- Gemini models: Configured directly in agent files or via `GEMINI_LIVE_MODEL` env var
- Other models: Use `src/lib/model.ts` which supports `lmstudio_` prefix for local models

**WebSocket Handling:**
- Each WebSocket connection can be either `isGeminiLive` or `isWebsocketAgent`
- Data is attached to `ws.data` and includes session/agent instances
- Binary messages are treated as audio (for Gemini Live)
- JSON messages are control signals (start, stop, text, etc.)

**Audio Processing:**
- Always use 16kHz sample rate for Gemini Live (configurable but default)
- Audio worklet (`public/audio-processor-16k.js`) handles PCM16 encoding
- Audio chunks are sent as raw Buffer/Uint8Array over WebSocket
