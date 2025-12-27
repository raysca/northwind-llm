import { serve } from "bun";
import index from "./index.html";
import * as vercelRoutes from "./frameworks/vercel/route";
import { GeminiLiveAgent } from "./frameworks/mastra/agents/gemini-live";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/vercel": vercelRoutes,

    "/api/realtime": (req, server) => {
      if (server.upgrade(req, { data: { isRealtime: true } })) {
        return undefined;
      }
      return new Response("Upgrade failed", { status: 500 });
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
  websocket: {
    // TypeScript: specify the type of ws.data like this
    data: {} as { agent?: GeminiLiveAgent; isRealtime?: boolean },
    async open(ws) {
      if (ws.data.isRealtime) {
        try {
          console.log('Initializing Gemini Live Agent...');
          const agent = new GeminiLiveAgent({
            onAudio: (chunk) => {
              ws.send(chunk);
            },
            onText: (text) => {
              // Send text as control message
              ws.send(JSON.stringify({ type: 'text', content: text }));
            }
          });
          ws.data.agent = agent;
          console.log('Gemini Live Agent initialized successfully');
          // Don't connect yet!
          return;
        } catch (error) {
          console.error('Failed to initialize Gemini Live Agent:', error);
          ws.close(1011, 'Internal Server Error: Failed to initialize agent');
          return;
        }
      }

    },
    async message(ws, message) {
      if (ws.data.isRealtime && ws.data.agent) {
        if (message instanceof Buffer || message instanceof Uint8Array) {
          await ws.data.agent.sendAudioChunk(message as Buffer);
        } else if (typeof message === 'string') {
          try {
            const data = JSON.parse(message);
            if (data.type === 'text') {
              await ws.data.agent.sendText(data.content);
            } else if (data.type === 'start') {
              await ws.data.agent.connect();
              console.log('Realtime agent connected via start signal');
            } else if (data.type === 'stop') {
              await ws.data.agent.disconnect();
              console.log('Realtime agent disconnected via stop signal');
            }
          } catch (e) {
            // ignore
          }
        }
        return;
      }
    },
    async close(ws) {
      if (ws.data.isRealtime && ws.data.agent) {
        await ws.data.agent.disconnect();
        console.log('Realtime agent disconnected');
        return;
      }
    },
  }
});

console.log(`🚀 Server running at ${server.url}`);
