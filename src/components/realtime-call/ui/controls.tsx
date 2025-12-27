import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RealtimeStatus } from '../hooks/use-realtime';

interface ControlsProps {
    status: RealtimeStatus;
    isMuted: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    onToggleMute: () => void;
}

export function Controls({ status, isMuted, onConnect, onDisconnect, onToggleMute }: ControlsProps) {
    const isConnected = status === 'connected';
    const isConnecting = status === 'connecting';

    return (
        <div className="flex items-center justify-center gap-4 mt-4">
            {!isConnected && !isConnecting && (
                <Button
                    onClick={onConnect}
                    className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700 shadow-lg"
                    size="icon"
                >
                    <Phone className="w-5 h-5 text-white" />
                </Button>
            )}

            {(isConnected || isConnecting) && (
                <>
                    <Button
                        onClick={onToggleMute}
                        variant={isMuted ? "destructive" : "secondary"}
                        className="rounded-full w-12 h-12 shadow-md"
                        size="icon"
                        disabled={!isConnected}
                    >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>

                    <Button
                        onClick={onDisconnect}
                        className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 shadow-lg"
                        size="icon"
                    >
                        <PhoneOff className="w-5 h-5 text-white" />
                    </Button>
                </>
            )}
        </div>
    );
}
