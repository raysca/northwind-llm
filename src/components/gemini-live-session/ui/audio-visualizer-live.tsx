import { cn } from '@/lib/utils';

interface AudioVisualizerLiveProps {
  data: Uint8Array;
  isActive: boolean;
}

export function AudioVisualizerLive({ data, isActive }: AudioVisualizerLiveProps) {
  if (!isActive) return null;

  // Fewer bars for a cleaner look
  const barCount = 16;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const value = data.length > 0 ? data[Math.floor((i / barCount) * data.length)] : 0;
    // Map to 15-100% height
    const baseHeight = data.length > 0 ? (value / 255) * 85 + 15 : 15;
    return baseHeight;
  });

  return (
    <div className="h-full w-full bg-muted rounded-xl flex items-center justify-center gap-[3px] px-3 border">
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-75 ease-out",
            "bg-gradient-to-t from-indigo-500 to-violet-400"
          )}
          style={{
            height: `${height}%`,
            opacity: 0.6 + (height / 250),
          }}
        />
      ))}
    </div>
  );
}
