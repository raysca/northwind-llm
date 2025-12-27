import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, EndSensitivity, ActivityHandling, TurnCoverage } from '@google/genai';
import type { GeminiLiveSessionCallbacks } from './types';
import {
  listProductsTool,
  getProductDetailsTool,
} from '../mastra/agents/tools/products';
import {
  listOrdersTool,
} from '../mastra/agents/tools/orders';

const MODEL_NAME = process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-09-2025';
const VOICE_NAME = process.env.GEMINI_LIVE_VOICE || 'Kore';

// Function declarations for Gemini - simplified to match working old implementation
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'list_products',
    parameters: {
      type: Type.OBJECT,
      description: 'Get a list of all products in the database.',
      properties: {},
    },
  },
  {
    name: 'get_product_details',
    parameters: {
      type: Type.OBJECT,
      description: 'Get detailed information about a specific product by its ID.',
      properties: {
        id: { type: Type.STRING, description: 'The unique ID of the product.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_orders',
    parameters: {
      type: Type.OBJECT,
      description: 'Get a list of all current customer orders.',
      properties: {},
    },
  },
];

export class GeminiLiveSession {
  private session: any = null;
  private connected = false;
  private callbacks: GeminiLiveSessionCallbacks;

  constructor(callbacks: GeminiLiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(onReady?: () => void) {
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY not found in environment variables');
      }

      console.log('Connecting to Gemini Live with model:', MODEL_NAME);
      const ai = new GoogleGenAI({ apiKey });

      this.session = await ai.live.connect({
        model: MODEL_NAME,
        config: {
          realtimeInputConfig: {
            automaticActivityDetection: {
              disabled: false,
              endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
            },
            activityHandling: ActivityHandling.ACTIVITY_HANDLING_UNSPECIFIED,
            turnCoverage: TurnCoverage.TURN_INCLUDES_ALL_INPUT,
          },
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are the Northwind Back-Office Support Assistant. 
          You help employees check inventory, verify orders, and find customer details. 
          Use the provided tools to query the database accurately. 
          Be helpful, professional, and concise.
          When the customers has no more questions, you should end the conversation.
          `,
          // tools: [{ functionDeclarations }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
          },
          // Enable transcription for both input and output
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            this.connected = true;
            console.log('✅ Gemini Live session opened and ready');
            // Notify that session is ready for audio
            if (onReady) onReady();
          },
          onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
          onerror: (e: any) => {
            console.error('❌ Gemini Live session error:', e);
            this.callbacks.onError(e);
          },
          onclose: (event: any) => {
            this.connected = false;
            console.log('Close code:', event?.code, 'Reason:', event?.reason);
            // Notify callback that Gemini session closed
            if (this.callbacks.onClose) {
              this.callbacks.onClose(event?.code, event?.reason);
            }
          },
        },
      });

      console.log('Gemini Live session connection initiated');
    } catch (error) {
      console.error('Failed to connect to Gemini Live:', error);
      this.callbacks.onError(error as Error);
      throw error;
    }
  }

  async disconnect() {
    if (this.session) {
      await this.session.close();
      this.connected = false;
      this.session = null;
      console.log('Gemini Live session disconnected');
    }
  }

  async sendAudio(chunk: Buffer) {
    if (this.connected && this.session) {
      try {
        // Convert Buffer to base64 string (matching old implementation's createBlob format)
        const base64Data = chunk.toString('base64');
        this.session.sendRealtimeInput({
          media: {
            data: base64Data,
            mimeType: 'audio/pcm;rate=16000',
          }
        });
      } catch (error) {
        console.error('Failed to send audio:', error);
        this.callbacks.onError(error as Error);
      }
    } else {
      console.warn('Cannot send audio: not connected or session not initialized');
    }
  }

  async sendText(text: string) {
    if (this.connected && this.session) {
      try {
        this.session.sendRealtimeInput({ text });
      } catch (error) {
        console.error('Failed to send text:', error);
      }
    }
  }

  private async handleMessage(msg: LiveServerMessage) {
    try {
      // Input transcription
      if (msg.serverContent?.inputTranscription) {
        this.callbacks.onInputTranscription(msg.serverContent.inputTranscription.text ?? '');
      }

      // Output transcription
      if (msg.serverContent?.outputTranscription) {
        this.callbacks.onOutputTranscription(msg.serverContent.outputTranscription.text ?? '');
      }

      // Turn complete
      if (msg.serverContent?.turnComplete) {
        this.callbacks.onTurnComplete();
      }

      // Interruption
      if (msg.serverContent?.interrupted) {
        this.callbacks.onInterruption?.(msg.serverContent.interrupted);
      }

      // Audio playback
      const audioBase64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        this.callbacks.onAudio(audioBuffer);
      }

      // Function calls
      if (msg.toolCall?.functionCalls) {
        await this.handleFunctionCalls(msg.toolCall.functionCalls);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.callbacks.onError(error as Error);
    }
  }

  private async handleFunctionCalls(calls: any[]) {
    for (const fc of calls) {
      console.log('Function call:', fc.name, fc.args);
      let result: any;

      try {
        switch (fc.name) {
          case 'list_products':
            result = await listProductsTool.execute({});
            break;
          case 'get_product_details':
            result = await getProductDetailsTool.execute(fc.args);
            break;
          case 'list_orders':
            result = await listOrdersTool.execute({});
            break;
          default:
            result = { error: `Unknown function: ${fc.name}` };
        }

        console.log('Function result:', result);

        // Send tool response back to Gemini
        this.session.sendToolResponse({
          functionResponses: [{
            id: fc.id,
            name: fc.name,
            response: { result },
          }],
        });
      } catch (error) {
        console.error(`Error executing function ${fc.name}:`, error);
        this.session.sendToolResponse({
          functionResponses: [{
            id: fc.id,
            name: fc.name,
            response: { error: (error as Error).message },
          }],
        });
      }
    }
  }
}
