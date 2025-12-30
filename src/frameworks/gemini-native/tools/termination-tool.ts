
import { Type, FunctionDeclaration } from "@google/genai";

export const endSessionToolDeclaration: FunctionDeclaration = {
    name: 'end_session',
    description: 'End the conversation session. Use this tool when the user indicates they are done or asks to stop the conversation.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            reason: {
                type: Type.STRING,
                description: 'The reason for ending the session',
            },
        },
    },
};

export const endSessionToolExecutor = (args: any) => {
    console.log('Ending session:', args.reason);
    return { status: 'success', message: 'Session ending confirmed' };
};
