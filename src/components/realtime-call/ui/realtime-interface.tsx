import { Card, CardContent } from '@/components/ui/card';
import { useRealtime } from '../hooks/use-realtime';
import { Visualizer } from './visualizer';
import { StatusIndicator } from './status-indicator';
import { Controls } from './controls';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function RealtimeInterface() {
    const {
        status,
        connect,
        disconnect,
        isMuted,
        toggleMute,
        visualizerData,
        isPlaying,
        errorMessage,
        clearError
    } = useRealtime();

    return (
        <Card className="w-full max-w-sm mx-auto shadow-xl overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center gap-6 bg-gradient-to-b from-background to-muted/20">
                <div className="w-full flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Voice Assistant</h3>
                    <StatusIndicator status={status} isPlaying={isPlaying} />
                </div>

                {errorMessage && (
                    <Alert variant="destructive" className="relative pr-8">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {errorMessage}
                        </AlertDescription>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full hover:bg-destructive/20 text-destructive-foreground"
                            onClick={clearError}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Alert>
                )}

                <div className="w-full relative">
                    <Visualizer data={visualizerData} />

                    {status === 'idle' && !errorMessage && (
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
