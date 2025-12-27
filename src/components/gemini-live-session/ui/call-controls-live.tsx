import { Phone, PhoneOff } from 'lucide-react';
import { SessionStatus } from '../types';

interface CallControlsLiveProps {
  status: SessionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  error: string | null;
}

export function CallControlsLive({
  status,
  onConnect,
  onDisconnect,
  error,
}: CallControlsLiveProps) {
  const isActive = status === 'connected' || status === 'connecting';

  return (
    <div className="px-6 pb-6 flex flex-col gap-3">
      {error && (
        <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-500/30">
          {error}
        </div>
      )}
      <button
        onClick={isActive ? onDisconnect : onConnect}
        disabled={status === 'connecting'}
        className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        {isActive ? (
          <>
            <PhoneOff className="w-5 h-5" />
            <span>{status === 'connecting' ? 'Connecting...' : 'End Call'}</span>
          </>
        ) : (
          <>
            <Phone className="w-5 h-5" />
            <span>Start Call</span>
          </>
        )}
      </button>
    </div>
  );
}
