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
        const agent = mastra.getAgent("store");
        const response = await agent.stream(text, {
            structuredOutput: {
                schema: StoreResponseSchema,
                jsonPromptInjection: true,
            }
        });

        // const uiMessages = response.aisdk.v5.toUIMessageStream();
        // uiMessages.pipeTo(new WritableStream({
        //     write: (chunk) => {
        //         this.params.onMessage(chunk);
        //     }
        // }));

        for await (const chunk of response.fullStream) {
            if (filteredMessages.includes(chunk.type)) {
                continue;
            }
            this.params.onMessage(chunk as any);
        }
    }
}
