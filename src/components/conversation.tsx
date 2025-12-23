import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Store } from 'lucide-react';
import { useEffect, useRef, useState, FormEvent } from 'react';
import { DefaultChatTransport } from 'ai';
import { Message, MessageContent, MessageResponse } from './ai-elements/message';

export function ShopAssistant() {
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/vercel',
        }),
    }) as any;

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const isLoading = status === 'streaming' || status === 'submitted';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Using sendMessage generic signature, assuming it takes a message object
        sendMessage(input);
        setInput('');
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    return (
        <Card className="w-full max-w-lg mx-auto h-[600px] flex flex-col shadow-xl">
            <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary" />
                    <CardTitle>Northwind Assistant</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <ScrollArea ref={scrollRef} className="h-full p-4 w-full">
                    {(!messages || messages.length === 0) && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center opacity-50 mt-20">
                            <Store className="w-12 h-12 mb-4" />
                            <p>Welcome to Northwind Traders!</p>
                            <p className="text-sm">Ask about our products, orders, or suppliers.</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 pb-4">
                        {messages?.map((m: any) => (
                            <>
                                {messages.map(({ role, parts }, index) => (
                                    <Message from={role} key={index}>
                                        <MessageContent>
                                            {parts.map((part, i) => {
                                                switch (part.type) {
                                                    case 'text':
                                                        return <MessageResponse key={`${role}-${i}`}>{part.text}</MessageResponse>;
                                                }
                                            })}
                                        </MessageContent>
                                    </Message>
                                ))}
                            </>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-lg px-4 py-2 text-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t bg-background z-10">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask about products..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="w-4 h-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
