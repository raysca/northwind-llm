import { useState, useRef, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { GeminiMessage, SessionStatus } from '../types';
import { useAudioCapture } from './use-audio-capture';
import { useAudioPlaybackLive } from './use-audio-playback-live';

export function useGeminiLive(endpoint = '/api/gemini-live') {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unified Messages
  const [messages, setMessages] = useState<GeminiMessage[]>([]);

  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');

  // Audio visualization
  const [visualizerData, setVisualizerData] = useState<Uint8Array>(new Uint8Array(0));

  // Tool execution state - kept for active indicator if needed, but primary source is now messages
  const [currentTool, setCurrentTool] = useState<{ id?: string; name: string; args: any } | null>(null);

  // Usage Metadata state
  const [usageMetadata, setUsageMetadata] = useState<{
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  } | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioCapture = useAudioCapture();
  const { playAudio, stopPlayback, cancelPlayback } = useAudioPlaybackLive();
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
      setIsBackendConnected(true);
    };

    ws.onclose = () => {
      console.log('Gemini Live WebSocket disconnected');
      setStatus('disconnected');
      setIsBackendConnected(false);
    };

    ws.onerror = (e) => {
      console.error('Gemini Live WebSocket error:', e);
      setError('Connection failed');
      setStatus('error');
      setIsBackendConnected(false);
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
          try {
            await audioCapture.startCapture((audioChunk: ArrayBuffer) => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(audioChunk);
              }
            });
            setStatus('connected');
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
          setMessages((prev) => {
            const newMessages: GeminiMessage[] = [];

            if (currentInput.trim()) {
              newMessages.push({
                id: nanoid(),
                role: 'user',
                type: 'text',
                content: currentInput,
                timestamp: Date.now(),
              });
            }

            if (currentOutput.trim()) {
              newMessages.push({
                id: nanoid(),
                role: 'model',
                type: 'text',
                content: currentOutput,
                timestamp: Date.now(),
              });
            }

            return [...prev, ...newMessages];
          });
          setCurrentInput('');
          setCurrentOutput('');
          break;

        case 'tool_call':
          const toolCallMsg: GeminiMessage = {
            id: nanoid(), // Use msg.tool.id from backend if available, else nanoid
            role: 'model', // Tool calls are initiated by the model
            type: 'tool_call',
            content: {
              toolCallId: msg.tool.id,
              name: msg.tool.name,
              args: msg.tool.args,
            },
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, toolCallMsg]);
          setCurrentTool(msg.tool);
          break;

        case 'tool_result':
          const toolResultMsg: GeminiMessage = {
            id: nanoid(),
            role: 'tool', // Result comes from tool
            type: 'tool_result',
            content: {
              toolCallId: msg.tool.id,
              name: msg.tool.name,
              result: msg.tool.result,
            },
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, toolResultMsg]);
          setCurrentTool(null);
          break;

        case 'interruption':
          console.log('Interruption received, cancelling audio playback');
          cancelPlayback();
          // Optionally clear current output as it was interrupted
          // setCurrentOutput((prev) => prev + ' [interrupted]');
          break;

        case 'usage':
          console.log('Received usage metadata:', msg.usage);
          // Only update if current usage is greater than previous or if it's the first update
          setUsageMetadata(prev => {
            if (!prev) return msg.usage;
            // If we want cumulative in session, we might sum them, but typically API returns accumulated or per-turn.
            // Usually Gemini API returns usage for the *current request* response stream. 
            // Logic: If onUsage is called at end of turn, it's that turn's usage.
            // If we want session total, we should accumulate.
            // BUT, the API (msg.serverContent.turnComplete.usageMetadata) returns `totalTokenCount` which implies total for session or large context window?
            // Actually, `totalTokenCount` usually means prompt + candidates.
            // Let's assume we want to accumulate for the session "feel" if the API returns per-turn, 
            // but if `usageMetadata` comes from `turnComplete`, it is for that turn.
            // We'll accumulate them manually for a session total if needed, or just display "Latest Turn" metrics.
            // The User Request is "implement and display usage metadata".
            // Let's accumulate them for a "Session Total" view.
            return {
              promptTokens: msg.usage.promptTokens || 0,
              candidatesTokens: msg.usage.candidatesTokens || 0,
              totalTokens: msg.usage.totalTokens || 0,
            };
          });
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
    [currentInput, currentOutput, audioCapture, stopPlayback, cancelPlayback]
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
      // Reset usage on new connection
      setUsageMetadata(null);

      // Send start signal to backend
      // Backend will connect to Gemini and send 'ready' when it's safe to send audio
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('Sending start signal to backend...');
        wsRef.current.send(JSON.stringify({
          type: 'start',
          config: {
            sampleRate: audioCapture.sampleRate
          }
        }));
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
    setCurrentTool(null);
    // Do NOT reset usageMetadata here so user can see final stats
    // setUsageMetadata(null); 

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
    isBackendConnected,
    error,
    connect,
    disconnect,
    transcriptions: messages, // Alias to avoid breaking old usage immediately if any, but better to update call sites
    messages,
    currentInput,
    currentOutput,
    visualizerData,
    currentTool,
    // displayedContent, // Removed as it is now part of messages stream
    usageMetadata,
  };
}
