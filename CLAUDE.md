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

This is an AI-powered Northwind store assistant showcasing two agent frameworks: **Vercel AI SDK** and **Mastra**. The application provides both text chat and real-time voice interactions with a SQLite database.

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
- `src/db/client.ts` - Singleton database connection
- `src/db/products.ts` - Product queries (`getProductById`, `searchProducts`, `getProductsByCategory`, etc.)
- `src/db/orders.ts` - Order queries (`getOrders`, `getOrdersByCustomer`, `getTotalSales`, etc.)
- `src/db/customers.ts`, `employees.ts` - Additional entity queries

**Input Validation:**
- `src/frameworks/schema.ts` - Centralized Zod schemas for tool inputs (shared between Vercel and Mastra)
- Use these schemas for consistent validation across both frameworks

### Agent Framework Implementations

The project demonstrates two distinct AI agent implementations:

#### 1. Vercel AI SDK (Text Chat)
- **Location:** `src/frameworks/vercel/`
- **Entry Point:** `src/frameworks/vercel/route.ts` (handles `POST /api/vercel`)
- **Agent:** Uses `ToolLoopAgent` from Vercel AI SDK
- **Tools:** `src/frameworks/vercel/tools/` (product.ts, order.ts)
- **Instructions:** `src/instructions/store-assistant.md`
- **Model:** Configurable via `LLM_MODEL` env var (supports OpenAI, DeepSeek, LMStudio)

#### 2. Mastra Framework (Voice + Chat)
- **Location:** `src/frameworks/mastra/`
- **Entry Point:** `src/index.ts` WebSocket handler for `/api/realtime`
- **Agent:** `src/frameworks/mastra/agents/gemini-live.ts` - Uses Mastra's `Agent` with `GeminiLiveVoice`
- **Tools:** `src/frameworks/mastra/agents/tools/` (products.ts, orders.ts)
- **Model:** `gemini-2.0-flash-exp` with Google Gemini Live API
- **Features:** Real-time audio streaming via WebSocket

### Real-Time Voice Component

**Location:** `src/components/realtime-call/`

**Key Parts:**
- `hooks/use-realtime.ts` - WebSocket connection management, audio I/O, connection state
- `hooks/use-audio-player.ts` - Audio playback buffer and Web Audio API
- `lib/audio-processor.ts` - Audio Worklet for PCM encoding at 24kHz sample rate
- `ui/realtime-interface.tsx` - Main UI component
- `ui/controls.tsx`, `visualizer.tsx`, `status-indicator.tsx` - UI subcomponents

**Audio Flow:**
1. Microphone → Audio Worklet (PCM encoding) → WebSocket → Gemini Live
2. Gemini Live → WebSocket → Audio Player → Browser audio output

### API Routes

The server (`src/index.ts`) exposes:
- `POST /api/vercel` - Vercel AI SDK chat endpoint (streaming text responses)
- `WS /api/realtime` - WebSocket for Gemini Live voice calls
- `/` - HTML entry point (serves `src/index.html`)

### Environment Variables

Required in `.env`:
```
GOOGLE_API_KEY=...      # For Gemini models
GEMINI_API_KEY=...      # Alternative key name
LLM_MODEL=...           # Model selection (e.g., "gpt-4o", "deepseek/deepseek-r1", "lmstudio_model")
```

### UI Components

- **Chat UI:** `src/components/chat.tsx` - Uses `useChat()` hook from `@ai-sdk/react`
- **AI Elements:** `src/components/ai-elements/` - Specialized components for rendering AI responses (messages, reasoning, sources, tool calls)
- **Shadcn UI:** `src/components/ui/` - Radix UI-based components (button, dialog, select, etc.)

### Code Patterns

**Adding New Tools:**
1. Create tool function in `src/frameworks/{vercel|mastra}/agents/tools/`
2. Add input validation schema to `src/frameworks/schema.ts`
3. Implement database query in `src/db/*.ts` if needed
4. Register tool in agent configuration

**Database Queries:**
- Always use the query functions from `src/db/` rather than raw SQL
- Remember PascalCase field naming when writing new queries
- Use Zod schemas from `src/db/schema.ts` for type safety

**Model Configuration:**
- Model selection is centralized in `src/lib/model.ts`
- Supports prefixes: `lmstudio_`, `google/`, or defaults to OpenAI-compatible
