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

import { MessageSquare } from 'lucide-react';

import { useRealtimeAgent } from '@/hooks/use-realtime-agent';
import { StoreResponseSchema } from '@/frameworks/schema';
import z from 'zod';

import { UserMessage } from '@/hooks/use-realtime-agent';
import { ChatInput } from './input';
import SuggestionList from './Suggestion';

import { ProductCard } from '@/components/real-time-agent/cards/ProductCard';
import { EmployeeCard } from '@/components/real-time-agent/cards/EmployeeCard';
import { CustomerCard } from '@/components/real-time-agent/cards/CustomerCard';
import { productsSchema, employeesSchema, customersSchema } from '@/db/schema';

const EmptyState = ({ messages }: { messages: z.infer<typeof StoreResponseSchema>[] }) => {

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
    const { messages, status, sendMessage, contentStatus } = useRealtimeAgent({ endpoint: '/api/realtime' });
    return (
        <>
            {status === 'connected' && (
                <Conversation>
                    <ConversationContent>
                        <EmptyState messages={messages} />
                        {messages.map((message) => (
                            <MessageItem key={message.id} message={message} />
                        ))}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
            )}
            {status === 'connecting' && (
                <p>Connecting...</p>
            )}
            {status === 'error' && (
                <p>Error: {status}</p>
            )}
            {status === 'connected' && (
                <p>Connected</p>
            )}
            {contentStatus === 'streaming' && (
                <p>Streaming...</p>
            )}
            <SuggestionList onSelect={(text) => { sendMessage(text) }} />
            <ChatInput status={status as any} onSubmit={(text) => { sendMessage(text) }} />
        </>
    );
}
