"use client";
import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputBody,
    PromptInputFooter,
    type PromptInputMessage,
    PromptInputProvider,
    PromptInputSpeechButton,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useRef } from "react";

export const ChatInput = ({ onSubmit, status }: { onSubmit: (message: string) => void, status: "submitted" | "streaming" | "ready" | "error" }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (message: PromptInputMessage) => {
        const hasText = Boolean(message.text);
        const hasAttachments = Boolean(message.files?.length);

        if (!(hasText || hasAttachments)) {
            return;
        }

        onSubmit(message.text);
    };

    return (
        <div className="size-full">
            <PromptInputProvider>
                <PromptInput globalDrop multiple onSubmit={handleSubmit}>
                    <PromptInputBody>
                        <PromptInputTextarea ref={textareaRef} />
                    </PromptInputBody>
                    <PromptInputFooter>
                        <PromptInputTools>
                            <PromptInputActionMenu>
                                <PromptInputActionMenuTrigger />
                                <PromptInputActionMenuContent>
                                    <PromptInputActionAddAttachments />
                                </PromptInputActionMenuContent>
                            </PromptInputActionMenu>
                            <PromptInputSpeechButton onTranscriptionChange={(text) => { onSubmit(text) }} textareaRef={textareaRef} />
                        </PromptInputTools>
                        <PromptInputSubmit status={status} />
                    </PromptInputFooter>
                </PromptInput>

            </PromptInputProvider>
        </div>
    );
};
