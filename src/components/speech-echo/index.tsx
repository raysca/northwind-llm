
import React, { useState, useEffect, useRef } from 'react';
import { useSpeechToText } from '../../hooks/use-speech-to-text';
import { useTextToSpeech } from '../../hooks/use-text-to-speech';

const getEchoServerUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/speech-echo`;
};

export const SpeechEcho = () => {
    const [serverStatus, setServerStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [echoedText, setEchoedText] = useState<string[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    const {
        isSpeaking,
        speak,
        cancel
    } = useTextToSpeech();

    const {
        isListening,
        transcript,
        start,
        stop,
        resetTranscript,
        error: speechError
    } = useSpeechToText({
        onSpeechStart: () => {
            // Interruption: User started speaking, stop TTS
            if (isSpeaking) {
                cancel();
            }
        },
        onResult: (text, isFinal) => {
            // Also stop if we get results, just in case speechstart didn't fire
            if (isSpeaking) {
                cancel();
            }

            if (isFinal && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(text);
                // Optionally clear transcript after sending
                // resetTranscript(); 
            }
        }
    });

    useEffect(() => {
        const connect = () => {
            setServerStatus('connecting');
            const ws = new WebSocket(getEchoServerUrl());
            wsRef.current = ws;

            ws.onopen = () => {
                setServerStatus('connected');
                console.log('Connected to echo server');
            };

            ws.onclose = () => {
                setServerStatus('disconnected');
                console.log('Disconnected from echo server');
                // Reconnect logic could go here
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'echo') {
                        setEchoedText(prev => [...prev, data.data]);
                        // Speak the echoed text
                        speak(data.data);
                    }
                } catch (e) {
                    console.error('Failed to parse message', e);
                }
            };
        };

        connect();

        return () => {
            wsRef.current?.close();
            cancel(); // Cleanup speech on unmount
        };
    }, []);

    return (
        <div className="p-4 border rounded-lg shadow-sm space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold">Speech Echo Test</h2>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${serverStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-600">Server: {serverStatus}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-600">{isListening ? 'Listening' : 'Idle'}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-600">{isSpeaking ? 'Speaking' : 'Silent'}</span>
                </div>
            </div>

            {speechError && (
                <div className="p-2 bg-red-100 text-red-700 text-sm rounded">
                    Error: {JSON.stringify(speechError)}
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => {
                        start();
                        cancel(); // Stop any current speech when starting to listen manually
                    }}
                    disabled={isListening}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Start Listening
                </button>
                <button
                    onClick={stop}
                    disabled={!isListening}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                    Stop
                </button>
                <button
                    onClick={() => {
                        resetTranscript();
                        setEchoedText([]);
                        cancel();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                    Clear
                </button>
            </div>

            <div className="space-y-2">
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Live Transcript</label>
                    <div className="p-2 bg-gray-50 rounded min-h-[60px] text-sm">
                        {transcript || <span className="text-gray-400 italic">...</span>}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Echoed from Server</label>
                    <div className="p-2 bg-gray-50 rounded min-h-[60px] text-sm max-h-[150px] overflow-y-auto">
                        {echoedText.length === 0 && <span className="text-gray-400 italic">No messages yet</span>}
                        {echoedText.map((msg, i) => (
                            <div key={i} className="mb-1">{msg}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
