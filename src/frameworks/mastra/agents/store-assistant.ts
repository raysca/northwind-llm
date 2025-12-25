import { Agent } from "ai";

export const storeAssistant = new Agent({
    name: "store-assistant",
    model: "gemini-2.5-flash",
    description: "A helpful assistant for the store.",
    instruction: "You are a helpful assistant for the store.",
});
