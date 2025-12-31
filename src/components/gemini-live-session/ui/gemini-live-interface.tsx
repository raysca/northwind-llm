import { useRef, useEffect } from 'react';
import { Phone, Mic, Sparkles } from 'lucide-react';
import { AudioVisualizerLive } from './audio-visualizer-live';
import { CallControlsLive } from './call-controls-live';
import { ToolCallIndicator } from './tool-call-indicator';
import { useGeminiLive } from '../hooks/use-gemini-live';
import { ProductCard } from '@/components/real-time-agent/cards/ProductCard';
import { OrderCard } from '@/components/real-time-agent/cards/OrderCard';
import { EmployeeCard } from '@/components/real-time-agent/cards/EmployeeCard';
import { CustomerCard } from '@/components/real-time-agent/cards/CustomerCard';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { cn } from '@/lib/utils';

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
    displayedContent,
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
  }, [transcriptions, currentInput, currentOutput]);

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

          {/* Chat Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6 scroll-smooth" ref={scrollRef}>
            {transcriptions.length === 0 && !currentInput && !currentOutput && isActive && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                <Mic className="w-8 h-8 mb-2" />
                <p className="text-sm">Listening...</p>
              </div>
            )}

            {transcriptions.map((entry) => (
              <Message key={entry.id} from={entry.role === 'user' ? 'user' : 'assistant'}>
                <MessageContent className={cn(
                  "shadow-sm backdrop-blur-sm",
                  entry.role === 'user' ? "bg-indigo-600/90 text-white border-indigo-500/50" : "bg-slate-800/80 border-slate-700/50"
                )}>
                  {entry.text}
                </MessageContent>
              </Message>
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

        {/* Right Panel: Data & Tools Display */}
        {/* On mobile, this stacks below, but we might want it to be a toggle or different view if content is heavy. 
            For now, following the plan: responsive split. Flex-col handles stacking. */}
        <div className={cn(
          "flex-1 md:max-w-md lg:max-w-lg bg-slate-900/30 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col",
          // Hide on mobile if no content to show, or maybe just show minimal?
          !displayedContent && !currentTool ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Context & Tools
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Active Tool Indicator */}
            <div className="transition-all duration-300 ease-in-out">
              <ToolCallIndicator tool={currentTool} />
            </div>

            {/* Displayed Content */}
            {displayedContent && (
              <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                {displayedContent.type === 'product' && displayedContent.product && (
                  <ProductCard product={displayedContent.product} />
                )}
                {displayedContent.type === 'products' && displayedContent.products && (
                  <div className="flex flex-col gap-3">
                    {displayedContent.products.map((p: any) => (
                      <ProductCard key={p.Id} product={p} />
                    ))}
                  </div>
                )}
                {displayedContent.type === 'order' && displayedContent.order && (
                  <OrderCard order={displayedContent.order} />
                )}
                {displayedContent.type === 'orders' && displayedContent.orders && (
                  <div className="flex flex-col gap-3">
                    {displayedContent.orders.map((o: any) => (
                      <OrderCard key={o.Id} order={o} />
                    ))}
                  </div>
                )}
                {displayedContent.type === 'employee' && displayedContent.employee && (
                  <EmployeeCard employee={displayedContent.employee} />
                )}
                {displayedContent.type === 'employees' && displayedContent.employees && (
                  <div className="flex flex-col gap-3">
                    {displayedContent.employees.map((e: any) => (
                      <EmployeeCard key={e.Id} employee={e} />
                    ))}
                  </div>
                )}
                {displayedContent.type === 'customer' && displayedContent.customer && (
                  <CustomerCard customer={displayedContent.customer} />
                )}
                {displayedContent.type === 'customers' && displayedContent.customers && (
                  <div className="flex flex-col gap-3">
                    {displayedContent.customers.map((c: any) => (
                      <CustomerCard key={c.Id} customer={c} />
                    ))}
                  </div>
                )}
                {displayedContent.type === 'text_response' && (
                  <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-sm leading-relaxed text-slate-300 shadow-sm">
                    {displayedContent.content}
                  </div>
                )}
              </div>
            )}

            {!displayedContent && !currentTool && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-2 p-8 text-center opacity-50">
                <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide">No active context</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

