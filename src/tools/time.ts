import { FunctionTool } from '@google/adk';
import { z } from 'zod';

const Input = z.object({
    city: z.string().describe("The name of the city for which to retrieve the current time."),
});

type InputType = z.infer<typeof Input>;

/* Mock tool implementation */
export const getCurrentTime = new FunctionTool({
    name: 'get_current_time',
    description: 'Returns the current time in london.',
    parameters: Input,
    execute: ({ city }: InputType) => {
        return { status: 'success', report: `The current time in ${city} is 10:30 AM` };
    },
});
