import { useState, useEffect, useCallback, useRef } from 'react';

export interface TextToSpeechOptions {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
}

export interface UseTextToSpeechLink {
    isSpeaking: boolean;
    speak: (text: string) => void;
    cancel: () => void;
    pause: () => void;
    resume: () => void;
    voices: SpeechSynthesisVoice[];
}

export const useTextToSpeech = ({
    onStart,
    onEnd,
    onError
}: TextToSpeechOptions = {}): UseTextToSpeechLink => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const updateVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };

        updateVoices();

        // Chrome loads voices asynchronously
        window.speechSynthesis.onvoiceschanged = updateVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speak = useCallback((text: string) => {
        if (!text) return;

        // Cancel any current utterance
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => {
            setIsSpeaking(true);
            onStart?.();
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            onEnd?.();
        };

        utterance.onerror = (event) => {
            console.error("TTS Error:", event);
            setIsSpeaking(false);
            onError?.(event);
        };

        window.speechSynthesis.speak(utterance);
    }, [onStart, onEnd, onError]);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const pause = useCallback(() => {
        window.speechSynthesis.pause();
    }, []);

    const resume = useCallback(() => {
        window.speechSynthesis.resume();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    return {
        isSpeaking,
        speak,
        cancel,
        pause,
        resume,
        voices
    };
};
