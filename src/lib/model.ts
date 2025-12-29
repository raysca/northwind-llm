import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { LanguageModel } from 'ai';

export const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'http://localhost:1234/v1',
});

export const openaioss = lmstudio('openai/gpt-oss-20b');

export const model = (() => {
    if (process.env.LLM_MODEL?.includes('lmstudio')) {
        console.log(`Using lmstudio: ${process.env.LLM_MODEL.replace('lmstudio_', '')}`);
        return lmstudio(process.env.LLM_MODEL.replace('lmstudio_', ''));
    } else {
        console.log(`Using model: ${process.env.LLM_MODEL}`);
        return process.env.LLM_MODEL;
    }
})() as LanguageModel;