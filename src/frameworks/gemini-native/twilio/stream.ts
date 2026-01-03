import { ServerWebSocket } from "bun";
import { GeminiLiveSession } from "../agent";
import { downsample, upsample, muLawToPcm16, pcm16ToMuLaw } from "@/lib/audio-utils";
import { TwilioMediaStreamMessage } from "./types";

export class TwilioStreamHandler {
    private streamSid: string | null = null;
    private ws: ServerWebSocket<any>;
    private session: GeminiLiveSession | null = null;

    constructor(ws: ServerWebSocket<any>) {
        this.ws = ws;
    }

    setSession(session: GeminiLiveSession) {
        this.session = session;
        session.connect(() => {
            console.log('[Twilio] Gemini session ready');
        }, { sampleRate: 16000 });
    }

    // Called when Gemini produces audio
    sendMedia(chunk: Buffer) {
        if (!this.streamSid) return;

        try {
            // 1. Convert Buffer to 16-bit Int (PCM 16k)
            // chunk is raw PCM 16-bit little-endian
            const pcm16 = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / 2);

            // 2. Downsample 16k -> 8k
            const pcm8 = downsample(pcm16, 2);

            // 3. Encode to mu-law
            const muLaw = pcm16ToMuLaw(pcm8);

            // 4. Send to Twilio
            const payload = Buffer.from(muLaw).toString('base64');

            const message = {
                event: 'media',
                streamSid: this.streamSid,
                media: {
                    payload,
                }
            };

            this.ws.send(JSON.stringify(message));
        } catch (e) {
            console.error('[Twilio] Error processing outgoing audio:', e);
        }
    }

    // Handle incoming Twilio messages
    async handleMessage(message: string) {
        try {
            const data: TwilioMediaStreamMessage = JSON.parse(message);

            if (data.event === 'start') {
                this.streamSid = data.start?.streamSid || null;
                console.log(`[Twilio] Stream started: ${this.streamSid}`);
            }

            if (data.event === 'media' && data.media && this.session) {
                // 1. Decode mu-law -> 16k PCM
                const muLawBuffer = Buffer.from(data.media.payload, 'base64');
                const pcm8 = muLawToPcm16(muLawBuffer); // 8k PCM

                // 2. Upsample 8k -> 16k
                const pcm16 = upsample(pcm8, 2);

                // 3. Send to Gemini
                // Gemini expects raw Buffer of Int16
                await this.session.sendAudio(Buffer.from(pcm16.buffer));
            }

            if (data.event === 'stop') {
                console.log('[Twilio] Stream stopped');
                if (this.session) await this.session.disconnect();
            }

        } catch (e) {
            console.error('[Twilio] Error handling message:', e);
        }
    }

    async close() {
        console.log('[Twilio] WebSocket closed');
        if (this.session) await this.session.disconnect();
    }
}
