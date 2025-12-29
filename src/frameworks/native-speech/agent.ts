
export interface NativeSpeechAgentParams {
    onText?: (text: string) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

export class NativeSpeechAgent {
    private params: NativeSpeechAgentParams;
    private connected: boolean = false;

    constructor(params: NativeSpeechAgentParams) {
        this.params = params;
    }

    public async connect() {
        this.connected = true;
        console.log("Native Speech Agent connected");
        this.params.onConnect?.();
    }

    public async disconnect() {
        this.connected = false;
        console.log("Native Speech Agent disconnected");
        this.params.onDisconnect?.();
    }

    public async processText(text: string) {
        if (!this.connected) {
            console.warn("Native Speech Agent not connected, ignoring text:", text);
            return;
        }

        console.log("Native Speech Agent processing text:", text);

        // Simulating processing (Echo for now)
        // In the future this is where LLM logic would go

        const responseText = `Echo: ${text}`;

        if (this.params.onText) {
            this.params.onText(responseText);
        }
    }
}
