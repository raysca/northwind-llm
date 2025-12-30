import z from "zod";
import { mastra } from "./mastra";
import { StoreResponseSchema } from '@/frameworks/schema'
import { UIMessage } from "ai";

export interface WebsocketAgentParams {
    onMessage: (message: UIMessage) => void;
    onError: (error: Error) => void;
}

const filteredMessages = [
    "tool-input-start",
    "tool-input-delta",
    "tool-call-delta",
    "tool-call-input-streaming-end",
    "tool-call",
    "text-start",
    "text-delta",
    "finish-step",
    "step-finish",
    "step-start",
    "text-end",
    "start-step",
    "reasoning-start",
    "reasoning-delta",
    "reasoning-end",
    "tool-call-input-streaming-start",
    "tool-call-input-streaming-end",
];

export class WebsocketAgent {
    private params: WebsocketAgentParams;

    constructor(params: WebsocketAgentParams) {
        this.params = params;
    }

    public async processText(text: string) {
        console.log("Websocket Agent processing text:", text);
        try {
            const agent = mastra.getAgent("store");
            const response = await agent.stream(text, {
                structuredOutput: {
                    schema: StoreResponseSchema,
                    jsonPromptInjection: true,
                }
            });

            for await (const chunk of response.fullStream) {
                if (filteredMessages.includes(chunk.type)) {
                    continue;
                }
                this.params.onMessage(chunk as any);
            }
        } catch (error) {
            console.error("Websocket Agent error:", error);
            // Send error to client if possible, or trigger onError
            // Since onMessage expects UIMessage, we might need a custom error message type or just use onError
            if (error instanceof Error) {
                this.params.onError(error);
                // Also send a structured error message to the client so it can be handled by the UI
                this.params.onMessage({
                    type: "error",
                    message: error.message
                } as any);
            } else {
                this.params.onError(new Error("Unknown error occurred in agent"));
                this.params.onMessage({
                    type: "error",
                    message: "Unknown error occurred"
                } as any);
            }
        }
    }
}
