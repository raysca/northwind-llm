import { useEffect, useReducer, useRef, useCallback } from "react";
import { StoreResponseSchema } from '@/frameworks/schema'
import z from "zod";

interface UseRealtimeAgentParams {
    endpoint: string;
}

export interface UserMessage {
    type: 'user_message';
    content: string;
    id: string;
}

interface Action {
    type: 'SET_CONNECTION_STATUS' | 'ADD_MESSAGE' | 'SET_CONTENT_STATUS' | 'SET_ERROR' | 'CLEAR_ERROR';
    payload?: any;
}

interface State {
    status: ConnectionStatus;
    contentStatus: ContentStatus;
    error: string | null;
    messages: (UserMessage | z.infer<typeof StoreResponseSchema>)[];
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
export type ContentStatus = 'idle' | 'streaming' | 'error';

const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            const message = { id: crypto.randomUUID(), ...action.payload }
            return {
                ...state,
                messages: [...state.messages, message]
            };
        case 'SET_CONNECTION_STATUS':
            return {
                ...state,
                status: action.payload as ConnectionStatus,
                error: action.payload === 'connected' ? null : state.error,
            };
        case 'SET_CONTENT_STATUS':
            return {
                ...state,
                contentStatus: action.payload as ContentStatus,
            };
        case 'SET_ERROR':
            return {
                ...state,
                status: 'error' as ConnectionStatus,
                error: action.payload,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
                status: state.status === 'error' ? 'idle' : state.status
            };
        default:
            return state;
    }
}

export function useRealtimeAgent({ endpoint }: UseRealtimeAgentParams) {
    const wsRef = useRef<WebSocket | null>(null);
    const [state, dispatch] = useReducer(reducer, {
        status: 'idle' as ConnectionStatus,
        contentStatus: 'idle' as ContentStatus,
        error: null,
        messages: []
    });

    const sendMessage = useCallback((message: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            dispatch({ type: 'ADD_MESSAGE', payload: { type: 'user_message', content: message } });
            dispatch({ type: 'SET_CONTENT_STATUS', payload: 'streaming' });
            wsRef.current.send(JSON.stringify({ type: 'user_message', content: message }));
        } else {
            dispatch({ type: 'SET_ERROR', payload: 'Not connected to agent' });
        }
    }, []);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}${endpoint}`);
        wsRef.current = ws;

        ws.onopen = () => {
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
            console.log('Live Agent connected');
        };

        ws.onclose = () => {
            console.log('Live Agent disconnected');
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'idle' });
        };

        ws.onerror = (e) => {
            console.error('Live Agent error:', e);
            dispatch({ type: 'SET_ERROR', payload: 'Connection failed. Please check your network or try again later.' });
        };

        ws.onmessage = async (event) => {
            // TODO: play audio response
            if (event.data instanceof Blob) {
                // Audio chunk from server
                // const arrayBuffer = await event.data.arrayBuffer();
                // playAudio(new Int16Array(arrayBuffer));
            } else {
                // JSON message from server
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.type === 'error') {
                        dispatch({ type: 'SET_ERROR', payload: msg.message || 'An unknown error occurred' });
                        dispatch({ type: 'SET_CONTENT_STATUS', payload: 'idle' });
                        return;
                    }

                    if (msg.type === 'object-result') {
                        console.log('Object result:', msg);
                        if (StoreResponseSchema.safeParse(msg.object).success) {
                            dispatch({ type: 'ADD_MESSAGE', payload: msg.object });
                        } else {
                            console.error('Invalid message format:', msg.object);
                            dispatch({ type: 'SET_ERROR', payload: 'Received invalid data from agent' });
                        }
                        dispatch({ type: 'SET_CONTENT_STATUS', payload: 'idle' });
                    }

                } catch (e) {
                    console.error('Error parsing message:', e);
                    dispatch({ type: 'SET_ERROR', payload: 'Failed to parse message from agent' });
                }
            }
        };
    }, [endpoint]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' });
    }, []);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        sendMessage,
        connect,
        disconnect,
        clearError,
        ...state,
    };
}