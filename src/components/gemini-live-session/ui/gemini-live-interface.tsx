import { Phone } from 'lucide-react';
import { TranscriptionDisplay } from './transcription-display';
import { AudioVisualizerLive } from './audio-visualizer-live';
import { CallControlsLive } from './call-controls-live';
import { ToolCallIndicator } from './tool-call-indicator';
import { useGeminiLive } from '../hooks/use-gemini-live';
import { ProductCard } from '@/components/real-time-agent/cards/ProductCard';
import { OrderCard } from '@/components/real-time-agent/cards/OrderCard';
import { EmployeeCard } from '@/components/real-time-agent/cards/EmployeeCard';
import { CustomerCard } from '@/components/real-time-agent/cards/CustomerCard';

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

          {/* Content Display */}
          {displayedContent && (
            <div className="flex-none p-2 border border-slate-800 rounded-md bg-slate-900/50">
              <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Displayed Content
              </h3>
              <div className="flex justify-center">
                {displayedContent.type === 'product' && displayedContent.product && (
                  <ProductCard product={displayedContent.product} />
                )}
                {displayedContent.type === 'products' && displayedContent.products && (
                  <div className="flex flex-col gap-2 w-full">
                    {displayedContent.products.map((p: any) => (
                      <ProductCard key={p.Id} product={p} />
                    ))}
                  </div>
                )}
                {displayedContent.type === 'order' && displayedContent.order && (
                  <OrderCard order={displayedContent.order} />
                )}
                {displayedContent.type === 'orders' && displayedContent.orders && (
                  <div className="flex flex-col gap-2 w-full">
                    {displayedContent.orders.map((o: any) => (
                      <OrderCard key={o.Id} order={o} />
                    ))}
                  </div>
                )}
                {displayedContent.type === 'employee' && displayedContent.employee && (
                  <EmployeeCard employee={displayedContent.employee} />
                )}
                {displayedContent.type === 'employees' && displayedContent.employees && (
                  <div className="flex flex-col gap-2 w-full">
                    {displayedContent.employees.map((e: any) => (
                      <EmployeeCard key={e.Id} employee={e} />
                    ))}
                  </div>
                )}
                {displayedContent.type === 'customer' && displayedContent.customer && (
                  <CustomerCard customer={displayedContent.customer} />
                )}
                {displayedContent.type === 'customers' && displayedContent.customers && (
                  <div className="flex flex-col gap-2 w-full">
                    {displayedContent.customers.map((c: any) => (
                      <CustomerCard key={c.Id} customer={c} />
                    ))}
                  </div>
                )}
                {displayedContent.type === 'text_response' && (
                  <div className="p-4 bg-slate-800 rounded-md text-sm">
                    {displayedContent.content}
                  </div>
                )}
              </div>
            </div>
          )}

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
