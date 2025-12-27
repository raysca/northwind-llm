import { useRef, useCallback } from 'react';

export function useAudioPlaybackLive() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Match Gemini output
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playAudio = useCallback(
    async (audioData: Int16Array) => {
      initAudioContext();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      // Convert Int16 to Float32
      const float32Data = new Float32Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        float32Data[i] = audioData[i] / 0x8000;
      }

      // Create audio buffer
      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      // Create source
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      // Schedule playback
      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      source.start(startTime);

      nextStartTimeRef.current = startTime + buffer.duration;

      // Track source
      sourcesRef.current.add(source);
      source.onended = () => {
        sourcesRef.current.delete(source);
      };
    },
    [initAudioContext]
  );

  const stopPlayback = useCallback(() => {
    // Stop all playing sources
    sourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    console.log('Audio playback stopped');
  }, []);

  return {
    playAudio,
    stopPlayback,
    initAudioContext,
  };
}
