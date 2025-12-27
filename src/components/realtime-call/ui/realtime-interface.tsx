import { Card, CardContent } from '@/components/ui/card';
import { useRealtime } from '../hooks/use-realtime';
import { Visualizer } from './visualizer';
import { StatusIndicator } from './status-indicator';
import { Controls } from './controls';

export function RealtimeInterface() {
    const {
        status,
        connect,
        disconnect,
        isMuted,
        toggleMute,
        visualizerData
    } = useRealtime();

    return (
        <Card className="w-full max-w-sm mx-auto shadow-xl overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center gap-6 bg-gradient-to-b from-background to-muted/20">
                <div className="w-full flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Voice Assistant</h3>
                    <StatusIndicator status={status} />
                </div>

                <div className="w-full relative">
                    <Visualizer data={visualizerData} />

                    {status === 'idle' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md">
                            <p className="text-muted-foreground text-sm">Ready to connect</p>
                        </div>
                    )}
                </div>

                <Controls
                    status={status}
                    isMuted={isMuted}
                    onConnect={connect}
                    onDisconnect={disconnect}
                    onToggleMute={toggleMute}
                />
            </CardContent>
        </Card>
    );
}
