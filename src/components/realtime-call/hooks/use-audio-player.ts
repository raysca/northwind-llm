import { useRef, useCallback, useEffect, useState } from 'react';

export const useAudioPlayer = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<Int16Array[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const activeSourcesRef = useRef(0);
    const nextStartTimeRef = useRef(0);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 24000,
            });
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const updatePlayingState = useCallback(() => {
        setIsPlaying(activeSourcesRef.current > 0);
    }, []);

    const playQueue = useCallback(() => {
        const ctx = audioContextRef.current;
        if (!ctx || audioQueueRef.current.length === 0) {
            return;
        }

        while (audioQueueRef.current.length > 0) {
            const chunk = audioQueueRef.current.shift();
            if (!chunk) continue;

            const float32Data = new Float32Array(chunk.length);
            for (let i = 0; i < chunk.length; i++) {
                float32Data[i] = chunk[i] / 0x8000;
            }

            const buffer = ctx.createBuffer(1, float32Data.length, 24000);
            buffer.getChannelData(0).set(float32Data);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            const currentTime = ctx.currentTime;
            const startTime = Math.max(currentTime, nextStartTimeRef.current);
            source.start(startTime);

            nextStartTimeRef.current = startTime + buffer.duration;

            activeSourcesRef.current++;
            updatePlayingState();

            source.onended = () => {
                activeSourcesRef.current--;
                updatePlayingState();
            };
        }
    }, [updatePlayingState]);

    const queueAudio = useCallback((audioData: Int16Array) => {
        audioQueueRef.current.push(audioData);
        initAudioContext();
        playQueue();
    }, [initAudioContext, playQueue]);

    const reset = useCallback(() => {
        audioQueueRef.current = [];
        nextStartTimeRef.current = 0;
        activeSourcesRef.current = 0;
        updatePlayingState();

        if (audioContextRef.current) {
            // Note: closing the context stops all sounds immediately
            audioContextRef.current.close().then(() => {
                audioContextRef.current = null;
            });
        }
    }, [updatePlayingState]);

    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    return { queueAudio, reset, initAudioContext, isPlaying };
};
