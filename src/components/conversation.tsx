'use client';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import { useChat } from '@ai-sdk/react';
const Example = () => {
  const { messages } = useChat();
  return (
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
  );
};
export default Example;
