interface CurrentTranscriptionProps {
  input: string;
  output: string;
}

export function CurrentTranscription({ input, output }: CurrentTranscriptionProps) {
  if (!input && !output) return null;

  return (
    <div className="space-y-4">
      {input && (
        <div className="flex flex-col items-end animate-pulse">
          <div className="bg-indigo-600/50 text-white/80 px-4 py-3 rounded-2xl rounded-tr-none max-w-[85%]">
            <p className="text-sm">{input}</p>
          </div>
        </div>
      )}
      {output && (
        <div className="flex flex-col items-start">
          <div className="bg-slate-800/80 text-slate-300 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-700 max-w-[85%]">
            <p className="text-sm italic">{output}</p>
          </div>
        </div>
      )}
    </div>
  );
}
