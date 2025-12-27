import { Agent } from "@mastra/core/agent";
import { GeminiLiveVoice } from "@mastra/voice-google-gemini-live";
import { PassThrough } from "node:stream";

import { listProductsTool, getProductByIdTool, getProductDetailsTool, searchProductsTool, countProductsTool, countProductsByCategoryTool, getDiscontinuedProductsTool, getProductsByCategoryTool } from "./tools/products";
import { listOrdersTool, getOrdersByCustomerIdTool, countOrdersTool, getTotalSalesTool, getRecentOrdersTool, searchOrdersTool, getOrderWithDetailsTool } from "./tools/orders";

interface GeminiLiveAgentParams {
    onAudio?: (chunk: Buffer) => void;
    onText?: (text: string) => void;
}

const instructions = `
  You are a helpful assistant. You can use the tools below to answer the user's questions regarding products and orders.

  Use all the tools available to answer the user's questions. It is ok to use multiple tools to answer the user's questions.

  Always give confirmation that you have understood the user's question in a friendly way.

  Be concise and do not repeat yourself.

  You have access to the following tools:
  - listProductsTool
  - getProductByIdTool
  - getProductDetailsTool
  - searchProductsTool
  - countProductsTool
  - countProductsByCategoryTool
  - getDiscontinuedProductsTool
  - getProductsByCategoryTool
  - listOrdersTool
  - getOrdersByCustomerIdTool
  - countOrdersTool
  - getTotalSalesTool
  - getRecentOrdersTool
  - searchOrdersTool
  - getOrderWithDetailsTool

  Example Questions:
   - How many products do we have for sale
   - What products are discontinued
   - What are the top 10 most profitable products
   - What are the top 10 most profitable orders
   - Find me this order by this customer id
`;

const GEMINI_LIVE_AGENT_SPEAKER = process.env.GEMINI_LIVE_AGENT_SPEAKER ?? "Puck";
const GEMINI_LIVE_AGENT_MODEL = process.env.GEMINI_LIVE_AGENT_MODEL ?? "gemini-2.0-flash-exp";

export class GeminiLiveAgent {
    agent: Agent;
    #connected = false;
    private audioInputStream: PassThrough | null = null;
    private params: GeminiLiveAgentParams;

    constructor(params: GeminiLiveAgentParams) {
        this.params = params;
        this.agent = this.createAgent();
        this.registerAgentEvents();
    }

    private createAgent() {
        return new Agent({
            model: GEMINI_LIVE_AGENT_MODEL,
            instructions,
            name: "Gemini Live Agent",
            id: "gemini-live-agent",
            tools: {
                listProductsTool,
                getProductByIdTool, getProductDetailsTool, searchProductsTool, countProductsTool, countProductsByCategoryTool, getDiscontinuedProductsTool, getProductsByCategoryTool, listOrdersTool, getOrdersByCustomerIdTool, countOrdersTool, getTotalSalesTool, getRecentOrdersTool, searchOrdersTool, getOrderWithDetailsTool
            },
            voice: new GeminiLiveVoice({
                name: "Gemini Live Agent",

                speechModel: {
                    name: GEMINI_LIVE_AGENT_MODEL,
                    apiKey: process.env.GOOGLE_API_KEY ?? "dummy-key",
                },
                realtimeConfig: {
                    model: GEMINI_LIVE_AGENT_MODEL,
                    options: {
                        apiKey: process.env.GOOGLE_API_KEY ?? "dummy-key",
                    }
                },
                speaker: GEMINI_LIVE_AGENT_SPEAKER,

            })
        })
    }

    private registerAgentEvents() {
        this.agent.voice?.on("speaker", async (stream: NodeJS.ReadableStream) => {
            console.log("Gemini Live Agent is speaking");
            for await (const chunk of stream) {
                console.log("Gemini Live Agent is speaking", chunk.length);
                this.params.onAudio?.(chunk as Buffer);
            }
        });

        // stream text data to client        
        this.agent.voice?.on("writing", ({ role, text }) => {
            console.log("Gemini Live Agent is writing", text);
            this.params.onText?.(text);
        });

        this.agent.voice?.on("realtime_input", (data) => {
            console.log("Gemini Live Agent is writing", data);
        });

    }

    public async connect() {
        try {
            await this.agent.voice?.connect();
            this.#connected = true;
            console.log("Connected to Gemini Live Agent");

            // Initialize input stream
            this.audioInputStream = new PassThrough();
            // Start speaking with the stream
            this.agent.voice?.send(this.audioInputStream);
        } catch (error) {
            this.#connected = false;
            console.error("Failed to connect to Gemini Live Agent", error);
            throw error;
        }
    }

    public async disconnect() {
        try {
            if (this.audioInputStream) {
                this.audioInputStream.end();
                this.audioInputStream = null;
            }
            await this.agent.voice?.close();
            this.#connected = false;
            console.log("Disconnected from Gemini Live Agent");
        } catch (error) {
            this.#connected = false;
            console.error("Failed to disconnect from Gemini Live Agent", error);
            throw error;
        }
    }

    public async sendText(message: string) {
        console.log("Sending text to Gemini Live Agent", message);
        await this.agent.voice?.speak(message);
    }

    public async sendAudioChunk(chunk: Buffer | Uint8Array) {
        if (this.#connected && this.audioInputStream) {
            console.log("Sending audio chunk to Gemini Live Agent", chunk.length);
            // this.agent.voice?.speak(this.audioInputStream);
            this.audioInputStream.write(chunk);
        }
    }
}