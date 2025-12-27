import { TranscriptionEntry as TranscriptionEntryType } from '../types';

interface TranscriptionEntryProps extends TranscriptionEntryType {}

export function TranscriptionEntry({ role, text, timestamp }: TranscriptionEntryProps) {
  return (
    <div className={`flex flex-col ${role === 'user' ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
          role === 'user'
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
        }`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
      <span className="text-[10px] text-slate-500 mt-1 px-1">
        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
