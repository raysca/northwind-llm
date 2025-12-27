export const WORKLET_NAME = 'audio-processor-worklet';

export const audioProcessorString = `
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0];
    
    // Simple downsampling and buffering could happen here if needed,
    // but for now we just pass through or accumulate.
    // We want to send raw PCM Int16 data.
    
    // Process input data
    for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex++] = channelData[i];

        // When buffer is full, send it
        if (this.bufferIndex >= this.bufferSize) {
            this.flush();
        }
    }

    return true;
  }

  flush() {
    if (this.bufferIndex === 0) return;

    // Convert Float32 to Int16
    const int16Data = new Int16Array(this.bufferIndex);
    for (let i = 0; i < this.bufferIndex; i++) {
        // Clamp between -1 and 1
        const s = Math.max(-1, Math.min(1, this.buffer[i]));
        // Convert to 16-bit signed integer
        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Send data to main thread
    this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    
    this.bufferIndex = 0;
  }
}

registerProcessor('${WORKLET_NAME}', AudioProcessor);
`;
