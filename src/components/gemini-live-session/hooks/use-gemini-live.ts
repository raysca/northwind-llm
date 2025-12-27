import { useState, useRef, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { TranscriptionEntry, SessionStatus } from '../types';
import { useAudioCapture } from './use-audio-capture';
import { useAudioPlaybackLive } from './use-audio-playback-live';

export function useGeminiLive(endpoint = '/api/gemini-live') {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Transcriptions
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');

  // Audio visualization
  const [visualizerData, setVisualizerData] = useState<Uint8Array>(new Uint8Array(0));

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioCapture = useAudioCapture();
  const { playAudio, stopPlayback } = useAudioPlaybackLive();
  const visualizerFrameRef = useRef<number | null>(null);
  const updateVisualizerRef = useRef<(() => void) | null>(null);

  // Ref for handleServerMessage to avoid stale closures
  const handleServerMessageRef = useRef<((msg: any) => Promise<void>) | null>(null);

  // Initialize WebSocket (persistent connection)
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}${endpoint}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Gemini Live WebSocket connected');
    };

    ws.onclose = () => {
      console.log('Gemini Live WebSocket disconnected');
      setStatus('disconnected');
    };

    ws.onerror = (e) => {
      console.error('Gemini Live WebSocket error:', e);
      setError('Connection failed');
      setStatus('error');
    };

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        // Audio chunk from server
        const arrayBuffer = await event.data.arrayBuffer();
        playAudio(new Int16Array(arrayBuffer));
      } else {
        // JSON message from server
        try {
          const msg = JSON.parse(event.data);
          // Use ref to get latest version of handleServerMessage
          if (handleServerMessageRef.current) {
            handleServerMessageRef.current(msg);
          }
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [endpoint, playAudio]);

  const handleServerMessage = useCallback(
    async (msg: any) => {
      switch (msg.type) {
        case 'websocket_connected':
          console.log('WebSocket connected to backend');
          break;

        case 'ready':
          console.log('✅ Gemini session ready, starting audio capture');
          // Now it's safe to start capturing audio
          try {
            await audioCapture.startCapture((audioChunk: ArrayBuffer) => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(audioChunk);
              }
            });
            setStatus('connected');
            // Start visualizer
            if (updateVisualizerRef.current) {
              updateVisualizerRef.current();
            }
          } catch (err: any) {
            console.error('Failed to start audio capture:', err);
            setError(err.message || 'Failed to start audio capture');
            setStatus('error');
          }
          break;

        case 'input_transcription':
          setCurrentInput((prev) => prev + msg.text);
          break;

        case 'output_transcription':
          setCurrentOutput((prev) => prev + msg.text);
          break;

        case 'turn_complete':
          // Save current input/output to history
          setTranscriptions((prev) => {
            const newEntries: TranscriptionEntry[] = [];

            if (currentInput.trim()) {
              newEntries.push({
                id: nanoid(),
                role: 'user',
                text: currentInput,
                timestamp: Date.now(),
              });
            }

            if (currentOutput.trim()) {
              newEntries.push({
                id: nanoid(),
                role: 'model',
                text: currentOutput,
                timestamp: Date.now(),
              });
            }

            return [...prev, ...newEntries];
          });
          setCurrentInput('');
          setCurrentOutput('');
          break;

        case 'error':
          console.error('Backend error:', msg.message);
          setError(msg.message);
          setStatus('error');
          break;

        case 'session_closed':
          console.error('Gemini session closed unexpectedly:', msg.reason, 'Code:', msg.code);
          setError(`Session closed: ${msg.reason}`);
          setStatus('error');
          // Clean up audio
          audioCapture.stopCapture();
          stopPlayback();
          if (visualizerFrameRef.current) {
            cancelAnimationFrame(visualizerFrameRef.current);
            visualizerFrameRef.current = null;
          }
          break;

        default:
          console.log('Unknown message type:', msg.type);
      }
    },
    [currentInput, currentOutput, audioCapture, stopPlayback]
  );

  // Keep ref updated with latest handleServerMessage
  useEffect(() => {
    handleServerMessageRef.current = handleServerMessage;
  }, [handleServerMessage]);

  // Update visualizer function
  const updateVisualizer = useCallback(() => {
    if (status !== 'connected' || !audioCapture.analyserNode) {
      return;
    }

    const dataArray = new Uint8Array(audioCapture.analyserNode.frequencyBinCount);
    audioCapture.analyserNode.getByteFrequencyData(dataArray);
    setVisualizerData(dataArray);

    visualizerFrameRef.current = requestAnimationFrame(() => {
      if (updateVisualizerRef.current) {
        updateVisualizerRef.current();
      }
    });
  }, [status, audioCapture]);

  // Store updateVisualizer in ref
  useEffect(() => {
    updateVisualizerRef.current = updateVisualizer;
  }, [updateVisualizer]);

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      // Send start signal to backend
      // Backend will connect to Gemini and send 'ready' when it's safe to send audio
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('Sending start signal to backend...');
        wsRef.current.send(JSON.stringify({ type: 'start' }));
      } else {
        throw new Error('WebSocket not connected');
      }

      // Audio capture will start when we receive 'ready' message
      console.log('Waiting for Gemini session to be ready...');
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setError(err.message || 'Failed to start voice assistant');
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('disconnect() called');
    // Send stop signal to backend
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }

    // Stop audio capture and playback
    audioCapture.stopCapture();
    stopPlayback();

    // Stop visualizer
    if (visualizerFrameRef.current) {
      cancelAnimationFrame(visualizerFrameRef.current);
      visualizerFrameRef.current = null;
    }

    setStatus('idle');
    setVisualizerData(new Uint8Array(0));

    console.log('Gemini Live session stopped');
  }, [audioCapture, stopPlayback]);

  // Store latest disconnect in ref
  const disconnectRef = useRef(disconnect);
  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectRef.current();
    };
  }, []);

  return {
    status,
    error,
    connect,
    disconnect,
    transcriptions,
    currentInput,
    currentOutput,
    visualizerData,
  };
}
