import { useEffect, useRef } from 'react';

interface VisualizerProps {
    data: Uint8Array;
}

export function Visualizer({ data }: VisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgb(240, 240, 240)'; // Background
        // transparent
        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / data.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
            barHeight = data[i] / 2;

            // Gradient or solid color
            ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }, [data]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full h-24 rounded-md bg-muted/50"
        />
    );
}
