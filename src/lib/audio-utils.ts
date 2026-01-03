
export function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

export function createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// mu-law constants
const BIAS = 0x84;
const CLIP = 32635;

export function encodeMuLaw(sample: number): number {
    let sign = 0;
    if (sample < 0) {
        sample = -sample;
        sign = 0x80;
    }
    if (sample > CLIP) sample = CLIP;
    sample = (sample + BIAS) >> 2;
    let exponent = 7;
    for (let check = 16384; check > 0; check >>= 1) {
        if (sample & check) break;
        exponent--;
    }
    const mantissa = (sample >> (exponent + 3)) & 0x0F;
    const muLawByte = ~(sign | (exponent << 4) | mantissa);
    return muLawByte & 0xFF;
}

export function decodeMuLaw(muLawByte: number): number {
    muLawByte = ~muLawByte;
    const sign = muLawByte & 0x80;
    const exponent = (muLawByte >> 4) & 0x07;
    const mantissa = muLawByte & 0x0F;
    let sample = ((2 * mantissa) + 33) << (exponent + 2);
    sample -= BIAS;
    return sign ? -sample : sample;
}

export function pcm16ToMuLaw(pcm16: Int16Array): Uint8Array {
    const len = pcm16.length;
    const muLaw = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        muLaw[i] = encodeMuLaw(pcm16[i]!);
    }
    return muLaw;
}

export function muLawToPcm16(muLaw: Uint8Array): Int16Array {
    const len = muLaw.length;
    const pcm16 = new Int16Array(len);
    for (let i = 0; i < len; i++) {
        pcm16[i] = decodeMuLaw(muLaw[i]!);
    }
    return pcm16;
}

export function downsample(buffer: Int16Array, updateRatio: number): Int16Array {
    const newLength = Math.round(buffer.length / updateRatio);
    const result = new Int16Array(newLength);
    for (let i = 0; i < newLength; i++) {
        const index = Math.floor(i * updateRatio);
        result[i] = buffer[index]!;
    }
    return result;
}

export function upsample(buffer: Int16Array, updateRatio: number): Int16Array {
    const newLength = Math.round(buffer.length * updateRatio);
    const result = new Int16Array(newLength);
    for (let i = 0; i < newLength; i++) {
        const index = Math.floor(i / updateRatio);
        result[i] = buffer[index]!;
    }
    return result;
}
