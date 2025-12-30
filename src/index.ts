import { serve } from "bun";
import index from "./index.html";
import { GeminiLiveSession } from "./frameworks/gemini-native";
import { WebsocketAgent } from "./frameworks/realtime/agent";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/realtime": (req, server) => {
      if (server.upgrade(req, { data: { isWebsocketAgent: true } })) {
        return undefined;
      }
      return new Response("Upgrade failed", { status: 500 });
    },

    "/api/gemini-live": (req, server) => {
      if (server.upgrade(req, { data: { isGeminiLive: true } })) {
        return undefined;
      }
      return new Response("Upgrade failed", { status: 500 });
    },

    "/audio-processor-16k.js": async () => {
      const file = Bun.file("public/audio-processor-16k.js");
      return new Response(file, {
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
  websocket: {
    // TypeScript: specify the type of ws.data like this
    data: {} as {
      isWebsocketAgent?: boolean;
      session?: GeminiLiveSession;
      isGeminiLive?: boolean;
      realtimeAgent?: WebsocketAgent;
    },
    async open(ws) {

      // NEW - Gemini Live handler
      if (ws.data.isGeminiLive) {
        try {
          console.log('Initializing Gemini Live Session...');
          const session = new GeminiLiveSession({
            onAudio: (chunk) => {
              ws.send(chunk);
            },
            onInterruption: (event) => {
              console.log('Gemini Live Session interruption:', event);
              ws.send(JSON.stringify({ type: 'interruption', event }));
            },
            onToolCall: (tool) => {
              console.log('Gemini Live Session tool call:', tool);
              ws.send(JSON.stringify({ type: 'tool_call', tool }));
            },
            onToolResult: (tool) => {
              console.log('Gemini Live Session tool result:', tool);
              ws.send(JSON.stringify({ type: 'tool_result', tool }));
            },
            onInputTranscription: (text) => {
              ws.send(JSON.stringify({ type: 'input_transcription', text }));
            },
            onOutputTranscription: (text) => {
              ws.send(JSON.stringify({ type: 'output_transcription', text }));
            },
            onTurnComplete: () => {
              ws.send(JSON.stringify({ type: 'turn_complete' }));
            },
            onError: (error) => {
              console.error('Gemini Live Session error:', error);
              ws.send(JSON.stringify({ type: 'error', message: error.message }));
            },
            onClose: (code, reason) => {
              console.log('Gemini session closed unexpectedly, notifying client', code, reason);
              ws.send(JSON.stringify({
                type: 'session_closed',
                code,
                reason: reason || 'Gemini session closed'
              }));
            },
          });
          ws.data.session = session;
          ws.send(JSON.stringify({ type: 'websocket_connected' }));
          console.log('Gemini Live Session initialized (WebSocket ready)');
        } catch (error) {
          console.error('Failed to initialize Gemini Live Session:', error);
          ws.close(1011, 'Internal Server Error: Failed to initialize session');
        }
      }


      // NEW - Realtime handler
      if (ws.data.isWebsocketAgent) {
        console.log('Initializing Realtime Agent...');
        const agent = new WebsocketAgent({
          onMessage: (message) => {
            ws.send(JSON.stringify(message));
          },
          onError: (error) => {
            console.error('Realtime Agent error:', error);
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
          }
        });
        ws.data.realtimeAgent = agent;
        console.log('Realtime Agent initialized successfully');
      }
    },
    async message(ws, message) {
      // NEW - Gemini Live handler
      if (ws.data.isGeminiLive && ws.data.session) {
        if (message instanceof Buffer || message instanceof Uint8Array) {
          // Audio chunk from client
          await ws.data.session.sendAudio(message as Buffer);
        } else if (typeof message === 'string') {
          try {
            const data = JSON.parse(message);
            if (data.type === 'start') {
              console.log('Starting Gemini Live session...', data.config);
              await ws.data.session.connect(() => {
                // Called when Gemini session is ready
                ws.send(JSON.stringify({ type: 'ready' }));
                console.log('✅ Gemini Live session ready, sent ready signal to client');
              }, data.config);
            } else if (data.type === 'stop') {
              await ws.data.session.disconnect();
              console.log('Gemini Live session disconnected via stop signal');
            } else if (data.type === 'text') {
              await ws.data.session.sendText(data.content);
            }
          } catch (e) {
            console.error('Error handling Gemini Live message:', e);
            ws.send(JSON.stringify({ type: 'error', message: (e as Error).message }));
          }
        }
        return;
      }

      // NEW - Realtime handler
      if (ws.data.realtimeAgent) {
        const data = JSON.parse(message.toString());
        ws.data.realtimeAgent.processText(data.content);
        return;
      }
    },
    async close(ws) {
      // NEW - Gemini Live cleanup
      if (ws.data.isGeminiLive && ws.data.session) {
        await ws.data.session.disconnect();
        console.log('Gemini Live session disconnected');
        return;
      }

    },
  }
});

console.log(`🚀 Server running at ${server.url}`);
