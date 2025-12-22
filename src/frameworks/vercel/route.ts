import { storeAssistantAgent } from '@/frameworks/vercel/agents/store-assistant'
import { createAgentUIStreamResponse } from 'ai'

export const POST = async (request: Request): Promise<Response> => {
    const { messages } = await request.json()

    // Optional: support cancellation (aborts on disconnect, etc.)
    const abortController = new AbortController();

    return createAgentUIStreamResponse({
        agent: storeAssistantAgent,
        uiMessages: messages,
        abortSignal: abortController.signal, // optional
    });
}