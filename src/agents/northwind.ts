import { LlmAgent } from '@google/adk';
import { getCurrentTime } from '../tools/time';

export const rootAgent = new LlmAgent({
    name: 'hello_time_agent',
    model: 'gemini-2.5-flash',
    description: 'Tells the current time in a specified city.',
    instruction: `You are a helpful assistant that tells the current time in a city.
                Use the 'getCurrentTime' tool for this purpose.`,
    tools: [getCurrentTime],
});

