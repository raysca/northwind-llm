import { X, Coins, ArrowUpRight, ArrowDownLeft, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallSummaryPopupProps {
  usageMetadata: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  } | null;
  onDismiss: () => void;
  isOpen: boolean;
}

const COST_PER_MILLION_TOKENS = 12; // $12 per million tokens for audio

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function calculateCost(tokens: number): string {
  const cost = (tokens / 1_000_000) * COST_PER_MILLION_TOKENS;
  if (cost < 0.01) {
    return `<$0.01`;
  }
  return `$${cost.toFixed(4)}`;
}

export function CallSummaryPopup({ usageMetadata, onDismiss, isOpen }: CallSummaryPopupProps) {
  if (!isOpen || !usageMetadata) return null;

  const totalTokens = usageMetadata.totalTokens ||
    (usageMetadata.promptTokens + usageMetadata.candidatesTokens);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Card */}
      <div className={cn(
        "relative w-full max-w-sm bg-card rounded-2xl border shadow-2xl",
        "animate-in fade-in zoom-in-95 duration-200"
      )}>
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
            <Coins className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Usage Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">Token usage and estimated cost</p>
        </div>

        {/* Token Stats */}
        <div className="px-6 py-4 space-y-3">
          {/* Input Tokens */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Input Tokens</p>
                <p className="text-xs text-muted-foreground">Prompt & audio</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatNumber(usageMetadata.promptTokens)}
            </p>
          </div>

          {/* Output Tokens */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Output Tokens</p>
                <p className="text-xs text-muted-foreground">Response & audio</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatNumber(usageMetadata.candidatesTokens)}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t my-2" />

          {/* Total Tokens */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Hash className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Total Tokens</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatNumber(totalTokens)}
            </p>
          </div>
        </div>

        {/* Cost Section */}
        <div className="px-6 py-4 bg-muted/50 rounded-b-2xl border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-foreground">Estimated Cost</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{calculateCost(totalTokens)}</p>
              <p className="text-[10px] text-muted-foreground">@ $12/M tokens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
