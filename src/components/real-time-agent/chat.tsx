'use client';
import {
    Message,
    MessageContent,
} from '@/components/ai-elements/message';

import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';

import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';

import { useRealtimeAgent, UserMessage } from '@/hooks/use-realtime-agent';
import { StoreResponseSchema } from '@/frameworks/schema';
import z from 'zod';

import { ChatInput } from './input';
import SuggestionList from './Suggestion';

import { ProductCard } from '@/components/real-time-agent/cards/ProductCard';
import { EmployeeCard } from '@/components/real-time-agent/cards/EmployeeCard';
import { CustomerCard } from '@/components/real-time-agent/cards/CustomerCard';
import { productsSchema, employeesSchema, customersSchema } from '@/db/schema';
import { Loader } from '@/components/ai-elements/loader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Assuming standard UI button exists, if not use standard HTML button or ai-elements if available

const EmptyState = ({ messages }: { messages: (z.infer<typeof StoreResponseSchema> | UserMessage)[] }) => {

    if (messages.length > 0) {
        return null;
    }

    return (
        <ConversationEmptyState
            icon={<MessageSquare className="size-12" />}
            title="Start a conversation"
            description="Type a message below to begin chatting"
        />
    );
}

const MessageItem = ({ message }: { message: z.infer<typeof StoreResponseSchema> | UserMessage }) => {
    return (
        <Message from={message.type === 'user_message' ? 'user' : 'assistant'}>
            <MessageContent>
                {message.type === 'text_response' && <p>{message.content}</p>}
                {message.type === 'product' && message.product && <ProductCard product={message.product as z.infer<typeof productsSchema>} />}
                {message.type === 'products' && message.products && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {message.products.map((p) => (
                            <ProductCard key={p.Id} product={p as z.infer<typeof productsSchema>} />
                        ))}
                    </div>
                )}
                {message.type === 'employee' && message.employee && <EmployeeCard employee={message.employee as z.infer<typeof employeesSchema>} />}
                {message.type === 'employees' && message.employees && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {message.employees.map((e) => (
                            <EmployeeCard key={e.Id} employee={e as z.infer<typeof employeesSchema>} />
                        ))}
                    </div>
                )}
                {message.type === 'customer' && message.customer && <CustomerCard customer={message.customer as z.infer<typeof customersSchema>} />}
                {message.type === 'customers' && message.customers && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {message.customers.map((c) => (
                            <CustomerCard key={c.Id} customer={c as z.infer<typeof customersSchema>} />
                        ))}
                    </div>
                )}
                {message.type === 'user_message' && <p>{message.content}</p>}
            </MessageContent>
        </Message>
    );
}

export const RealtimeChat = () => {
    const { messages, status, sendMessage, contentStatus, error, connect, clearError } = useRealtimeAgent({ endpoint: '/api/realtime' });

    return (
        <div className="relative flex h-full flex-col overflow-hidden">
            {/* Status Header */}
            <div className="flex h-10 items-center justify-between border-b px-4 text-xs font-medium text-muted-foreground bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", {
                        "bg-green-500": status === 'connected',
                        "bg-yellow-500": status === 'connecting',
                        "bg-red-500": status === 'error',
                        "bg-gray-300": status === 'idle'
                    })} />
                    <span>
                        {status === 'connected' ? 'Connected' :
                            status === 'connecting' ? 'Connecting...' :
                                status === 'error' ? 'Disconnected' : 'Idle'}
                    </span>
                </div>
                {contentStatus === 'streaming' && (
                    <div className="flex items-center gap-1.5 text-blue-500">
                        <Loader size={12} />
                        <span>Agent is thinking...</span>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center justify-between bg-destructive/10 p-2 text-sm text-destructive px-4 border-b border-destructive/20">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => {
                            clearError();
                            if (status === 'error') connect();
                        }}
                        className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium hover:bg-destructive/10"
                    >
                        <RefreshCw className="size-3" />
                        Retry
                    </button>
                </div>
            )}

            <Conversation className="flex-1">
                <ConversationContent>
                    <EmptyState messages={messages} />
                    {messages.map((message) => (
                        <MessageItem key={(message as any).id || crypto.randomUUID()} message={message} />
                    ))}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            <div className="p-4 pt-0">
                <SuggestionList onSelect={(text) => { sendMessage(text) }} />
                <ChatInput
                    status={status === 'error' ? 'error' : contentStatus === 'streaming' ? 'streaming' : 'ready'}
                    onSubmit={(text) => { sendMessage(text) }}
                    disabled={status !== 'connected' && status !== 'idle'}
                    placeholder={status === 'error' ? "Check connection..." : "Type a message..."}
                />
            </div>
        </div>
    );
}
