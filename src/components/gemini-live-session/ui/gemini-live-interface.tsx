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
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Northwind Support</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              Gemini Live Agent
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Transcription & Audio - Full Width */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto">
          <TranscriptionDisplay
            transcriptions={transcriptions}
            currentInput={currentInput}
            currentOutput={currentOutput}
            isActive={isActive}
          />
          <AudioVisualizerLive data={visualizerData} isActive={isActive} />
          <ToolCallIndicator tool={currentTool} />
          <CallControlsLive
            status={status}
            onConnect={connect}
            onDisconnect={disconnect}
            error={error}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 bg-slate-950 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-mono">
        <div className="flex items-center space-x-4">
          <span>LATENCY: ~200ms</span>
          <span>SR: 16kHz→24kHz</span>
          <span>VOICE: Puck</span>
        </div>
        <div>NORTHWIND CORP © 2024 - GEMINI LIVE v1.0.0</div>
      </footer>
    </div>
  );
}
