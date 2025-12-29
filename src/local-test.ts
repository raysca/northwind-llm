import { WebsocketAgent } from "@/frameworks/realtime/agent";

const filteredMessages = [
    "tool-input-start",
    "tool-input-delta",
    "tool-input-available",
    "finish-step",
    "start-step",
    "reasoning-start",
    "reasoning-delta",
    "reasoning-end",
];

const agent = new WebsocketAgent({
    onMessage: (message: any) => {
        if (message.type === 'object-result') {
            console.log("Object Result:", message);
        } else {
            console.log("Filtered Websocket Agent message:", message.type);
        }
    },
    onError: (error) => {
        console.error("Websocket Agent error:", error);
    }
});

await agent.processText('How many products do we have for sale?');
await agent.processText('Who made the most recent order?');
await agent.processText('Give me the details of Tofu');