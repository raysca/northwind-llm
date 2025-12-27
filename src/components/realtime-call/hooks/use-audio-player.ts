import { useRef, useCallback, useEffect } from 'react';

export const useAudioPlayer = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<Int16Array[]>([]);
    const isPlayingRef = useRef(false);
    const nextStartTimeRef = useRef(0);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 24000, // Match backend or standard
            });
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const playQueue = useCallback(() => {
        if (!audioContextRef.current || isPlayingRef.current || audioQueueRef.current.length === 0) {
            return;
        }

        isPlayingRef.current = true;

        while (audioQueueRef.current.length > 0) {
            const chunk = audioQueueRef.current.shift();
            if (!chunk) continue;

            // Convert Int16 back to Float32
            const float32Data = new Float32Array(chunk.length);
            for (let i = 0; i < chunk.length; i++) {
                float32Data[i] = chunk[i] / 0x8000;
            }

            const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
            buffer.getChannelData(0).set(float32Data);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);

            const currentTime = audioContextRef.current.currentTime;

            // Schedule playback
            const startTime = Math.max(currentTime, nextStartTimeRef.current);
            source.start(startTime);

            nextStartTimeRef.current = startTime + buffer.duration;

            source.onended = () => {
                // Could handle end of playback for specific chunks if needed
            };
        }

        isPlayingRef.current = false;
    }, []);

    const queueAudio = useCallback((audioData: Int16Array) => {
        audioQueueRef.current.push(audioData);
        // If we want very low latency, we might trigger play immediately if context allows
        // but often it's better to let a loop or scheduled run handle it.
        // For simplicity here:
        initAudioContext();
        playQueue();
    }, [initAudioContext, playQueue]);

    const reset = useCallback(() => {
        audioQueueRef.current = [];
        nextStartTimeRef.current = 0;
        if (audioContextRef.current) {
            audioContextRef.current.close().then(() => {
                audioContextRef.current = null;
            });
        }
    }, []);

    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    return { queueAudio, reset, initAudioContext };
};
