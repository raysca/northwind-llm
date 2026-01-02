import { useRef, useEffect, useState } from 'react';
import { Mic, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { AudioVisualizerLive } from './audio-visualizer-live';
import { CallControlsLive } from './call-controls-live';
import { CallSummaryPopup } from './call-summary-popup';
import { WelcomePopup } from './welcome-popup';
import { useGeminiLive } from '../hooks/use-gemini-live';
import { GeminiMessageItem } from './gemini-message';
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

  // Call summary popup state
  const [showCallSummary, setShowCallSummary] = useState(false);
  // Welcome popup state
  const [showWelcome, setShowWelcome] = useState(true);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentInput, currentOutput]);

  return (
    <div className="flex items-center justify-center min-h-dvh w-full bg-muted/30 p-2 sm:p-4">
      {/* App Container with border */}
      <div className="flex flex-col h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] w-full max-w-2xl bg-background rounded-xl sm:rounded-2xl border shadow-lg overflow-hidden">
        {/* Header */}
        <header className="flex-none flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md",
              isActive && "ring-2 ring-indigo-400/50 ring-offset-2 ring-offset-background"
            )}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Northwind Assistant</h1>
              <div className="flex items-center gap-1.5">
                {isBackendConnected ? (
                  <Wifi className="w-3 h-3 text-emerald-600" />
                ) : (
                  <WifiOff className="w-3 h-3 text-destructive" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-emerald-600" :
                    isBackendConnected ? "text-muted-foreground" : "text-destructive"
                )}>
                  {isActive ? 'Live' : isBackendConnected ? 'Ready' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Token Usage Button */}
          {usageMetadata && (
            <button
              onClick={() => setShowCallSummary(true)}
              className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded-md border hover:bg-muted/80 hover:border-border transition-colors"
            >
              {usageMetadata.promptTokens + usageMetadata.candidatesTokens} tokens
            </button>
          )}
        </header>

        {/* Chat Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 bg-background"
        >
          {/* Empty State */}
          {messages.length === 0 && !currentInput && !currentOutput && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-4 border-2",
                isActive
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-muted border-border text-muted-foreground"
              )}>
                <Mic className={cn("w-8 h-8", isActive && "animate-pulse")} />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {isActive ? 'Listening...' : 'Voice Assistant'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {isActive
                  ? 'Speak to ask about products, orders, customers, or employees'
                  : 'Press the call button to start talking'}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4 max-w-xl mx-auto">
            {messages.map((msg) => (
              <GeminiMessageItem key={msg.id} message={msg} />
            ))}

            {/* Current Input (User Speaking) */}
            {currentInput && (
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                  <p className="text-[15px] leading-relaxed">
                    {currentInput}
                    <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-1 align-middle" />
                  </p>
                </div>
              </div>
            )}

            {/* Current Output (AI Speaking) */}
            {currentOutput && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%] border">
                  <p className="text-[15px] leading-relaxed">
                    {currentOutput}
                    <span className="inline-block w-0.5 h-4 bg-current/50 animate-pulse ml-1 align-middle" />
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Spacer */}
          <div className="h-24" />
        </div>

        {/* Bottom Call Bar */}
        <div className="flex-none border-t bg-card">
          {/* Error Message */}
          {error && (
            <div className="px-4 pt-3">
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg border border-destructive/20">
                {error}
              </div>
            </div>
          )}

          <div className="px-4 py-3 flex items-center gap-3">
            {/* Visualizer */}
            <div className="flex-1 h-12">
              {isActive ? (
                <AudioVisualizerLive data={visualizerData} isActive={isActive} />
              ) : (
                <div className="h-full rounded-xl bg-muted flex items-center justify-center border">
                  <span className="text-xs text-muted-foreground">
                    {isBackendConnected ? 'Press to start' : 'Connecting...'}
                  </span>
                </div>
              )}
            </div>

            {/* Call Button */}
            <CallControlsLive
              status={status}
              onConnect={connect}
              onDisconnect={disconnect}
              error={null}
              disabled={!isBackendConnected}
            />
          </div>
        </div>
      </div>

      {/* Call Summary Popup */}
      <CallSummaryPopup
        usageMetadata={usageMetadata}
        isOpen={showCallSummary}
        onDismiss={() => setShowCallSummary(false)}
      />

      {/* Welcome Popup */}
      <WelcomePopup
        isOpen={showWelcome}
        onDismiss={() => setShowWelcome(false)}
      />
    </div>
  );
}
