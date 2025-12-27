// Audio Processor Worklet for 16kHz PCM encoding
// This worklet runs on the audio rendering thread and converts
// Float32 audio samples to Int16 PCM format for Gemini Live API

class AudioProcessor16k extends AudioWorkletProcessor {
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

    // Accumulate audio samples into buffer
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.bufferIndex++] = channelData[i];

      // When buffer is full, flush it
      if (this.bufferIndex >= this.bufferSize) {
        this.flush();
      }
    }

    return true;
  }

  flush() {
    if (this.bufferIndex === 0) return;

    // Convert Float32 to Int16 PCM
    const int16Data = new Int16Array(this.bufferIndex);
    for (let i = 0; i < this.bufferIndex; i++) {
      // Clamp between -1 and 1
      const s = Math.max(-1, Math.min(1, this.buffer[i]));
      // Convert to 16-bit signed integer
      int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Send PCM data to main thread
    this.port.postMessage(int16Data.buffer, [int16Data.buffer]);

    this.bufferIndex = 0;
  }
}

registerProcessor('audio-processor-16k-worklet', AudioProcessor16k);
