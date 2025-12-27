import { RealtimeStatus } from '../hooks/use-realtime';

interface StatusIndicatorProps {
    status: RealtimeStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'connected': return 'bg-green-500';
            case 'connecting': return 'bg-yellow-500';
            case 'error': return 'bg-red-500';
            case 'disconnected': return 'bg-gray-400';
            default: return 'bg-gray-300';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'connected': return 'Live';
            case 'connecting': return 'Connecting...';
            case 'error': return 'Error';
            case 'disconnected': return 'Disconnected';
            default: return 'Idle';
        }
    };

    return (
        <div className="flex items-center gap-2 text-sm font-medium">
            <span className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
            <span className="text-muted-foreground">{getStatusText()}</span>
        </div>
    );
}
