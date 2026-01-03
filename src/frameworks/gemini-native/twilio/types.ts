export interface TwilioMediaStreamMessage {
    event: 'connected' | 'start' | 'media' | 'stop' | 'mark' | 'clear';
    sequenceNumber?: string;
    streamSid?: string;
    media?: {
        track: 'inbound' | 'outbound';
        chunk: string;
        timestamp: string;
        payload: string;
    };
    start?: {
        accountSid: string;
        streamSid: string;
        callSid: string;
        tracks: string[];
        mediaFormat: {
            encoding: string;
            sampleRate: number;
            channels: number;
        };
        customParameters?: Record<string, string>;
    };
    stop?: {
        accountSid: string;
        callSid: string;
    };
    mark?: {
        name: string;
    };
}
