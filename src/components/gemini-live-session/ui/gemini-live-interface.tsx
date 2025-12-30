import { Phone } from 'lucide-react';
import { TranscriptionDisplay } from './transcription-display';
import { AudioVisualizerLive } from './audio-visualizer-live';
import { CallControlsLive } from './call-controls-live';
import { ToolCallIndicator } from './tool-call-indicator';
import { useGeminiLive } from '../hooks/use-gemini-live';

export function GeminiLiveInterface() {
  const {
    status,
    error,
    connect,
    disconnect,
    transcriptions,
    currentInput,
    currentOutput,
    visualizerData,
    currentTool,
  } = useGeminiLive();

  const isActive = status === 'connected';

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Support Agent</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none">
              Live Voice
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Transcription & Audio */}
        <div className="flex-1 flex flex-col w-full p-4 gap-4 overflow-y-auto">

          <div className="flex-1 min-h-[200px]">
            <AudioVisualizerLive data={visualizerData} isActive={isActive} />
          </div>

          <div className="flex-none">
            <ToolCallIndicator tool={currentTool} />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] border border-slate-800 rounded-md bg-slate-900/50 p-2">
            <TranscriptionDisplay
              transcriptions={transcriptions}
              currentInput={currentInput}
              currentOutput={currentOutput}
              isActive={isActive}
            />
          </div>

        </div>

        {/* Controls - Fixed at bottom of main if needed, or just part of flow */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
          <CallControlsLive
            status={status}
            onConnect={connect}
            onDisconnect={disconnect}
            error={error}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-2 bg-slate-950 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-mono">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`} />
          <span>{isActive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        <div>v1.0</div>
      </footer>
    </div>
  );
}
