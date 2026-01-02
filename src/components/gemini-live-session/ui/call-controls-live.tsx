import { Phone, PhoneOff, Loader2 } from 'lucide-react';
import { SessionStatus } from '../types';
import { cn } from '@/lib/utils';

interface CallControlsLiveProps {
  status: SessionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  error: string | null;
  disabled?: boolean;
}

export function CallControlsLive({
  status,
  onConnect,
  onDisconnect,
  error,
  disabled = false,
}: CallControlsLiveProps) {
  const isActive = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <button
      onClick={isActive ? onDisconnect : onConnect}
      disabled={isConnecting || disabled}
      aria-label={isActive ? 'End call' : 'Start call'}
      className={cn(
        "relative flex-none w-12 h-12 rounded-full flex items-center justify-center",
        "transition-all duration-200 ease-out",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive"
          : "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500",
        isConnecting && "animate-pulse"
      )}
    >
      {isConnecting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isActive ? (
        <PhoneOff className="w-5 h-5" />
      ) : (
        <Phone className="w-5 h-5" />
      )}

      {/* Active Indicator Ring */}
      {isActive && (
        <span className="absolute inset-0 rounded-full animate-ping bg-destructive/30" />
      )}
    </button>
  );
}
