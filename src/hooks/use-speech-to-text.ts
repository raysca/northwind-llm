import { useState, useEffect, useRef, useCallback } from 'react';

export interface SpeechToTextOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onResult?: (transcript: string, isFinal: boolean) => void;
    onSpeechStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
}

export interface UseSpeechToTextLink {
    isListening: boolean;
    transcript: string;
    start: () => void;
    stop: () => void;
    resetTranscript: () => void;
    error: any;
}

export const useSpeechToText = ({
    lang = 'en-US',
    continuous = true,
    interimResults = true,
    onResult,
    onSpeechStart,
    onEnd,
    onError
}: SpeechToTextOptions = {}): UseSpeechToTextLink => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<any>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = lang;
            recognitionRef.current.continuous = continuous;
            recognitionRef.current.interimResults = interimResults;
        } else {
            console.error("Browser does not support SpeechRecognition");
            setError("Browser does not support SpeechRecognition");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.stop();
            }
        };
    }, [lang, continuous, interimResults]);

    const start = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                // Clear previous listeners to avoid duplicates if re-starting
                recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                    let finalTrans = '';
                    let interimTrans = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            finalTrans += result[0].transcript;
                            onResult?.(result[0].transcript, true);
                        } else {
                            interimTrans += result[0].transcript;
                            onResult?.(result[0].transcript, false);
                        }
                    }

                    // We update the local transcript state with everything
                    setTranscript((prev) => {
                        // A simple strategy: append final, show interim
                        // But often simple display is enough
                        // For this hook let's just show the accumulated current session
                        // Note: detecting 'final' is tricky for state updates 
                        // because 'continuous' mode keeps resultIndex moving.

                        // Better approach for display:
                        // Reconstruct fully from event results
                        let fullTranscript = '';
                        for (let i = 0; i < event.results.length; i++) {
                            fullTranscript += event.results[i][0].transcript;
                        }
                        return fullTranscript;
                    });
                };

                // @ts-ignore - types might not include onspeechstart
                recognitionRef.current.onspeechstart = () => {
                    onSpeechStart?.();
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                    onEnd?.();
                };

                recognitionRef.current.onerror = (event: any) => {
                    setError(event.error);
                    onError?.(event.error);
                };

                recognitionRef.current.start();
                setIsListening(true);
                setError(null);
            } catch (e) {
                console.error("Failed to start speech recognition", e);
                setError(e);
            }
        }
    }, [isListening, onResult, onSpeechStart, onEnd, onError]);

    const stop = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        start,
        stop,
        resetTranscript,
        error
    };
};
