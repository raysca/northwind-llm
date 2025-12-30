interface AudioVisualizerLiveProps {
  data: Uint8Array;
  isActive: boolean;
}

export function AudioVisualizerLive({ data, isActive }: AudioVisualizerLiveProps) {
  if (!isActive) return null;

  // Use actual frequency data or fallback to animated bars
  const barCount = 24;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const value = data.length > 0 ? data[i % data.length] : Math.random() * 255;
    const heightPercent = (value / 255) * 80 + 20; // 20-100%
    return heightPercent;
  });

  return (
    <div className="h-full min-h-[60px] w-full bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-center space-x-1 px-4">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 bg-indigo-500 rounded-full transition-all duration-100"
          style={{
            height: `${height}%`,
            opacity: 0.5 + (height / 200),
          }}
        />
      ))}
    </div>
  );
}
