import { useState, useRef, useCallback, useEffect } from 'react';
import { audioProcessorString, WORKLET_NAME } from '../lib/audio-processor';
import { useAudioPlayer } from './use-audio-player';

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export const useRealtime = (endpoint = '/api/realtime') => {
    const [status, setStatus] = useState<RealtimeStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const { queueAudio, reset: resetPlayer, initAudioContext: initPlayerContext, isPlaying } = useAudioPlayer();

    // Store queueAudio in a ref to avoid recreating WebSocket on every render
    const queueAudioRef = useRef(queueAudio);
    useEffect(() => {
        queueAudioRef.current = queueAudio;
    }, [queueAudio]);

    // Data for visualizer
    const [visualizerData, setVisualizerData] = useState<Uint8Array>(new Uint8Array(0));
    const analyserRef = useRef<AnalyserNode | null>(null);

    // 1. Initialize WebSocket on mount
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}${endpoint}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            // WS connected, but agent not yet
            console.log('WS Connected');
        };

        ws.onclose = () => {
            console.log('WS Disconnected');
            setStatus('disconnected');
        };

        ws.onerror = (e) => {
            console.error('WebSocket error:', e);
            setStatus('error');
            setErrorMessage('Connection failed. Please check your network and try again.');
        };

        ws.onmessage = async (event) => {
            const data = event.data;
            if (data instanceof Blob) {
                // Audio data
                const arrayBuffer = await data.arrayBuffer();
                queueAudioRef.current(new Int16Array(arrayBuffer));
            } else {
                // Control messages (JSON)
                try {
                    const msg = JSON.parse(data);
                    console.log('Received message:', msg);
                    if (msg.type === 'error') {
                        setStatus('error');
                        setErrorMessage(msg.message || 'An unknown error occurred.');
                    }
                } catch (e) {
                    // Might be mixed text/binary, ignore if not JSON
                }
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [endpoint]);

    const cleanupAudio = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        // Don't close WebSocket here - it persists for component lifetime
        workletNodeRef.current = null;
        analyserRef.current = null;
        resetPlayer();
    }, [resetPlayer]);

    const connect = useCallback(async () => {
        try {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.error('WebSocket not connected');
                return;
            }

            setStatus('connecting');
            setErrorMessage(null); // Clear previous errors

            // Send start signal to backend to connect agent
            wsRef.current.send(JSON.stringify({ type: 'start' }));

            // 2. Initialize Audio Input
            initPlayerContext(); // Ensure playback context is ready
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 24000,
            });

            // Load worklet
            const blob = new Blob([audioProcessorString], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            await audioContextRef.current.audioWorklet.addModule(url);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const source = audioContextRef.current.createMediaStreamSource(stream);

            // Analyser for visualization
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            source.connect(analyser);

            const workletNode = new AudioWorkletNode(audioContextRef.current, WORKLET_NAME);
            workletNodeRef.current = workletNode;

            workletNode.port.onmessage = (event) => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isMuted) {
                    wsRef.current.send(event.data);
                }
            };

            // Connect graph: Source -> Analyser -> Worklet -> Destination (mute locally)
            // Note: We don't connect worklet to destination to avoid feedback, 
            // the worklet sends data to WS.
            source.connect(workletNode);
            // workletNode.connect(audioContextRef.current.destination); 

            // Start visualization loop
            updateVisualizer();

            setStatus('connected');

        } catch (error) {
            console.error('Connection failed:', error);
            setStatus('error');
            setErrorMessage((error as Error).message || 'Failed to access microphone.');
            cleanupAudio();
        }
    }, [initPlayerContext, isMuted, cleanupAudio]);

    const disconnect = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'stop' }));
        }
        cleanupAudio();
        setStatus('idle');
    }, [cleanupAudio]);

    const updateVisualizer = () => {
        if (!analyserRef.current || status !== 'connected') return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setVisualizerData(dataArray);

        requestAnimationFrame(updateVisualizer);
    };

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const clearError = useCallback(() => {
        setErrorMessage(null);
        if (status === 'error') {
            setStatus('idle'); // Allow retrying
        }
    }, [status]);

    useEffect(() => {
        return () => {
            cleanupAudio();
        };
    }, [cleanupAudio]);

    return {
        status,
        connect,
        disconnect,
        isMuted,
        toggleMute,
        visualizerData,
        isPlaying,
        errorMessage,
        clearError
    };
};
