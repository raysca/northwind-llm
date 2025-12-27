import { useRef, useCallback } from 'react';
import { WORKLET_NAME_16K } from '../lib/audio-processor-16k';

export function useAudioCapture() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const callbackRef = useRef<((chunk: ArrayBuffer) => void) | null>(null);

  const startCapture = useCallback(async (onAudioChunk: (chunk: ArrayBuffer) => void) => {
    callbackRef.current = onAudioChunk;

    // Create AudioContext at 16kHz for Gemini input
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000,
    });

    // Load audio worklet from backend
    await audioContextRef.current.audioWorklet.addModule('/audio-processor-16k.js');

    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const source = audioContextRef.current.createMediaStreamSource(stream);

    // Create analyser for visualization
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    source.connect(analyser);

    // Create worklet node for PCM encoding
    const worklet = new AudioWorkletNode(audioContextRef.current, WORKLET_NAME_16K);
    workletNodeRef.current = worklet;

    worklet.port.onmessage = (event) => {
      callbackRef.current?.(event.data);
    };

    // Connect audio graph: source -> analyser -> worklet
    analyser.connect(worklet);

    console.log('Audio capture started at 16kHz');
  }, []);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    workletNodeRef.current = null;
    analyserRef.current = null;
    callbackRef.current = null;
    console.log('Audio capture stopped');
  }, []);

  return {
    startCapture,
    stopCapture,
    analyserNode: analyserRef.current,
  };
}
