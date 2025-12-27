import { useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { TranscriptionEntry as TranscriptionEntryType } from '../types';
import { TranscriptionEntry } from './transcription-entry';
import { CurrentTranscription } from './current-transcription';

interface TranscriptionDisplayProps {
  transcriptions: TranscriptionEntryType[];
  currentInput: string;
  currentOutput: string;
  isActive: boolean;
}

export function TranscriptionDisplay({
  transcriptions,
  currentInput,
  currentOutput,
  isActive,
}: TranscriptionDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions, currentInput, currentOutput]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Status indicator */}
      <div className="flex items-center space-x-2 text-slate-400 px-6 pt-4 pb-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
          }`}
        />
        <span className="text-sm font-medium">
          {isActive ? 'Live Conversation' : 'Assistant Idle'}
        </span>
      </div>

      {/* Transcription container */}
      <div
        ref={scrollRef}
        className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mx-6 mb-4 overflow-y-auto space-y-6 scroll-smooth shadow-inner"
      >
        {transcriptions.length === 0 && !currentInput && !currentOutput && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 text-center">
            <Mic className="w-12 h-12 opacity-20" />
            <p>
              No active conversation.
              <br />
              Start a call to speak with the back-office database.
            </p>
          </div>
        )}

        {transcriptions.map((entry) => (
          <TranscriptionEntry key={entry.id} {...entry} />
        ))}

        <CurrentTranscription input={currentInput} output={currentOutput} />
      </div>
    </div>
  );
}
