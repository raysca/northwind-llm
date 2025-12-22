import { storeAssistantAgent } from "@/frameworks/vercel/agents/store-assistant";

const response = await storeAssistantAgent.generate({
    messages: [
        {
            role: 'user',
            content: 'What is the price of Tofu?',
        },
    ],
});

const result = response.response.messages?.map((message) => message.content).flat();

console.log(result);