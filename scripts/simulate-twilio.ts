import { WebSocket } from "ws";

const WS_URL = "ws://localhost:3000/api/twilio-stream";

function simulateTwilioCall() {
    console.log(`Connecting to ${WS_URL}...`);
    const ws = new WebSocket(WS_URL);

    ws.on("open", () => {
        console.log("✅ Connected to Twilio Stream Endpoint");

        // 1. Send 'start' event
        const startMsg = {
            event: "start",
            start: {
                streamSid: "MZ1234567890",
                callSid: "CA1234567890",
                tracks: ["inbound"],
                mediaFormat: {
                    encoding: "audio/x-mulaw",
                    sampleRate: 8000,
                    channels: 1
                }
            }
        };
        ws.send(JSON.stringify(startMsg));
        console.log(">> Sent 'start' event");

        // 2. Simulate sending audio (silence)
        // 160 bytes of silence (0xFF in mu-law acts as silence/low amplitude)
        const silencePayload = Buffer.alloc(160, 0xFF).toString("base64");

        let chunkCount = 0;
        const interval = setInterval(() => {
            if (ws.readyState !== WebSocket.OPEN) {
                clearInterval(interval);
                return;
            }

            const mediaMsg = {
                event: "media",
                media: {
                    track: "inbound",
                    chunk: (chunkCount++).toString(),
                    timestamp: Date.now().toString(),
                    payload: silencePayload
                }
            };
            ws.send(JSON.stringify(mediaMsg));
            // console.log(`>> Sent media chunk ${chunkCount}`);

            if (chunkCount > 50) { // Send for ~1 second (50 * 20ms)
                clearInterval(interval);
                console.log("Stopped sending audio, waiting for response...");

                // Send stop event after a few seconds
                setTimeout(() => {
                    const stopMsg = {
                        event: "stop",
                        stop: {
                            accountSid: "AC123",
                            callSid: "CA1234567890"
                        }
                    };
                    ws.send(JSON.stringify(stopMsg));
                    console.log(">> Sent 'stop' event");
                    setTimeout(() => ws.close(), 500);
                }, 5000);
            }
        }, 20); // 20ms chunks
    });

    ws.on("message", (data) => {
        try {
            const msg = JSON.parse(data.toString());
            if (msg.event === "media") {
                console.log(`<< Received media chunk (payload len: ${msg.media.payload.length}) from stream ${msg.streamSid}`);
            } else if (msg.event === "mark") {
                console.log("<< Received mark event");
            } else if (msg.event === "clear") {
                console.log("<< Received clear event");
            } else {
                console.log("<< Received message:", msg);
            }
        } catch (e) {
            console.log("<< Received raw message:", data.toString());
        }
    });

    ws.on("close", (code, reason) => {
        console.log(`❌ Disconnected: ${code} ${reason}`);
    });

    ws.on("error", (err) => {
        console.error("❌ WebSocket error:", err);
    });
}

simulateTwilioCall();
