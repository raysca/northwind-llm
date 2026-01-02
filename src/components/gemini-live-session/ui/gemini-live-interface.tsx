import { useRef, useEffect } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { AudioVisualizerLive } from './audio-visualizer-live';
import { CallControlsLive } from './call-controls-live';
import { useGeminiLive } from '../hooks/use-gemini-live';
import { GeminiMessageItem } from './gemini-message';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { cn } from '@/lib/utils';

export function GeminiLiveInterface() {
  const {
    status,
    error,
    connect,
    disconnect,
    messages,
    currentInput,
    currentOutput,
    visualizerData,
    usageMetadata,
    isBackendConnected,
  } = useGeminiLive();

  const isActive = status === 'connected';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentInput, currentOutput]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-6 py-4 bg-slate-950/50 backdrop-blur-md border-b border-slate-800 z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={cn("absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full", isActive && "animate-pulse")} />
            <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-100">Northwind Assistant</h1>
            <div className="flex items-center space-x-2">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" :
                  isBackendConnected ? "bg-blue-500" : "bg-red-500"
              )} />
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                {isActive ? 'Live Session' : isBackendConnected ? 'Ready' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        {/* Token Usage Stats - Hidden on small mobile */}
        {usageMetadata && (
          <div className="hidden sm:flex items-center space-x-4 text-[10px] text-slate-500 font-mono bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800/50">
            <div className="flex items-center space-x-1.5">
              <span className="w-1 h-3 bg-blue-500/50 rounded-full" />
              <span>IN: {usageMetadata.promptTokens}</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center space-x-1.5">
              <span className="w-1 h-3 bg-purple-500/50 rounded-full" />
              <span>OUT: {usageMetadata.candidatesTokens}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

        {/* Left Panel: Conversation & Visualizer */}
        {/* We keep the visualizer and controls on the left/main area, but now the chat list handles all content types */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800/50 relative">

          {/* Visualizer Area */}
          <div className="flex-none h-48 sm:h-64 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900/20 to-transparent">
            <div className="w-full max-w-md px-8 py-4">
              <AudioVisualizerLive data={visualizerData} isActive={isActive} />
            </div>
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                <p className="text-sm font-medium tracking-wide">
                  {isBackendConnected ? 'Ready to connect' : 'Connecting to server...'}
                </p>
              </div>
            )}
          </div>

          {/* Chat Scroll Area - Unified Message Stream */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6 scroll-smooth" ref={scrollRef}>
            {messages.length === 0 && !currentInput && !currentOutput && isActive && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                <Mic className="w-8 h-8 mb-2" />
                <p className="text-sm">Listening...</p>
              </div>
            )}

            {messages.map((msg) => (
              <GeminiMessageItem key={msg.id} message={msg} />
            ))}

            {currentInput && (
              <Message from="user">
                <MessageContent className="bg-indigo-600/50 text-white/90 border-indigo-500/30 animate-pulse">
                  {currentInput}
                </MessageContent>
              </Message>
            )}

            {currentOutput && (
              <Message from="assistant">
                <MessageContent className="bg-slate-800/50 border-slate-700/30 animate-pulse">
                  {currentOutput}
                </MessageContent>
              </Message>
            )}

            {/* Bottom Spacer */}
            <div className="h-4" />
          </div>

          {/* Floating Controls Overlay (Desktop: Bottom Center, Mobile: Fixed Bottom) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <CallControlsLive
              status={status}
              onConnect={connect}
              onDisconnect={disconnect}
              error={error}
              disabled={!isBackendConnected}
            />
          </div>
        </div>

        {/* Right Panel: Removed effectively, or we could keep it for debugging/context if needed, 
            but for now the request implies a unified view. 
            I will hide it since everything is now in the message stream. 
        */}
      </main>
    </div>
  );
}

