import React from 'react';
import { GeminiMessage, ToolCallContent } from '../types';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/real-time-agent/cards/ProductCard';
import { OrderCard } from '@/components/real-time-agent/cards/OrderCard';
import { EmployeeCard } from '@/components/real-time-agent/cards/EmployeeCard';
import { CustomerCard } from '@/components/real-time-agent/cards/CustomerCard';
import { Message, MessageContent } from '@/components/ai-elements/message';

interface GeminiMessageProps {
    message: GeminiMessage;
}

export function GeminiMessageItem({ message }: GeminiMessageProps) {
    const isUser = message.role === 'user';

    if (message.type === 'text') {
        return (
            <Message from={isUser ? 'user' : 'assistant'}>
                <MessageContent className={cn(
                    "shadow-sm backdrop-blur-sm",
                    isUser ? "bg-indigo-600/90 text-white border-indigo-500/50" : "text-slate-100 bg-slate-800 border-slate-700"
                )}>
                    {/* Ensure content is string for text type */}
                    {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                </MessageContent>
            </Message>
        );
    }

    if (message.type === 'tool_call' && message.content) {
        const content = message.content as ToolCallContent;

        if (content.name !== 'display_content') {
            return null
        }

        return (
            <div className="flex flex-col space-y-2 my-2 ml-2">
                <div className="pl-5 border-l-2 border-slate-800">
                    {renderToolResult(content.name, content.args)}
                </div>
            </div>
        );
    }

    return null;
}

function renderToolResult(name: string, result: any) {
    if (name === 'display_content') {
        if (result.type === 'product' && result.product) return <ProductCard product={result.product} />;
        if (result.type === 'order' && result.order) return <OrderCard order={result.order} />;
        if (result.type === 'employee' && result.employee) return <EmployeeCard employee={result.employee} />;
        if (result.type === 'customer' && result.customer) return <CustomerCard customer={result.customer} />;

        // Arrays
        if (result.type === 'products' && result.products) {
            return (
                <div className="flex flex-col gap-2">
                    {result.products.map((p: any) => <ProductCard key={p.Id} product={p} />)}
                </div>
            );
        }
    }

    // Fallback JSON dump for other tools or unhandled types
    return (
        <div className="text-xs bg-slate-900/50 p-2 rounded text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
            {JSON.stringify(result, null, 2)}
        </div>
    );
}
