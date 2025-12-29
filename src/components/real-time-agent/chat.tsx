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
import { productsSchema } from '@/db/schema';
import { UserMessage } from '@/hooks/use-realtime-agent';
import { ChatInput } from './input';
import SuggestionList from './Suggestion';

const ProductCard = ({ product }: { product: z.infer<typeof productsSchema> }) => {
    return (
        <div>
            <p>Name: {product.ProductName}</p>
            <p>Price: {product.UnitPrice}</p>
            <p>Stock: {product.UnitsInStock}</p>
        </div>
    );
}


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
        <Message from="assistant">
            <MessageContent>
                {message.type === 'text_response' && <p>{message.content}</p>}
                {message.type === 'product' && <ProductCard product={message.product as z.infer<typeof productsSchema>} />}
                {message.type === 'user_message' && <Message from="user">{message.content}</Message>}
            </MessageContent>
        </Message>
    );
}


export const RealtimeChat = () => {
    const { messages, status, sendMessage } = useRealtimeAgent({ endpoint: '/api/realtime' });
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
            <SuggestionList onSelect={(text) => { sendMessage(text) }} />
            <ChatInput status={status as any} onSubmit={(text) => { sendMessage(text) }} />
        </>
    );
}
