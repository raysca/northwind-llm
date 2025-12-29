import { useEffect, useReducer, useRef } from "react";
import { StoreResponseSchema } from '@/frameworks/schema'
import z from "zod";

interface UseRealtimeAgentParams {
    endpoint: string;
}

export interface UserMessage {
    type: 'user_message';
    content: string;
}

interface Action {
    type: 'SET_CONNECTION_STATUS' | 'ADD_MESSAGE' | 'SET_CONTENT_STATUS' | 'SET_ERROR';
    payload?: any;
}

interface State {
    status: ConnectionStatus;
    contentStatus: ContentStatus;
    error: string | null;
    messages: (UserMessage | z.infer<typeof StoreResponseSchema>)[];
}

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
type ContentStatus = 'idle' | 'streaming' | 'error';

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
                error: null,
                messages: []
            };
        case 'SET_CONTENT_STATUS':
            return {
                ...state,
                contentStatus: action.payload as ContentStatus,
                error: null,
            };
        case 'SET_ERROR':
            return {
                ...state,
                status: 'error' as ConnectionStatus,
                error: action.payload,
                messages: []
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

    const sendMessage = (message: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            dispatch({ type: 'ADD_MESSAGE', payload: { type: 'user_message', content: message } });
            dispatch({ type: 'SET_CONTENT_STATUS', payload: 'streaming' });
            wsRef.current.send(JSON.stringify({ type: 'user_message', content: message }));
        }
    };

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}${endpoint}`);
        wsRef.current = ws;

        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });

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
            dispatch({ type: 'SET_ERROR', payload: 'Connection failed' });
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
                    if (msg.type === 'object-result') {
                        console.log('Object result:', msg);
                        if (StoreResponseSchema.safeParse(msg.object).success) {
                            dispatch({ type: 'ADD_MESSAGE', payload: msg.object });
                        } else {
                            dispatch({ type: 'SET_ERROR', payload: 'Invalid message format' });
                        }
                        dispatch({ type: 'SET_CONTENT_STATUS', payload: 'idle' });
                    }

                } catch (e) {
                    dispatch({ type: 'SET_ERROR', payload: 'Failed to parse message' });
                }
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [endpoint]);

    return {
        sendMessage,
        ...state,
    };
}