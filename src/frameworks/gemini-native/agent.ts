import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, EndSensitivity, ActivityHandling, TurnCoverage } from '@google/genai';
import type { GeminiLiveSessionCallbacks } from './types';
import {
  databaseQueryToolDeclaration,
  databaseQueryToolExecutor,
} from './tools/query-tool';
import {
  displayContentToolDeclaration,
  displayContentToolExecutor,
} from './tools/display-tool';
import {
  endSessionToolDeclaration,
  endSessionToolExecutor,
} from './tools/termination-tool';
import { getSchema } from '@/db/client';

const MODEL_NAME = process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-09-2025';
const VOICE_NAME = process.env.GEMINI_LIVE_VOICE || 'Kore';

// Function declarations for Gemini - simplified to match working old implementation
const functionDeclarations: FunctionDeclaration[] = [
  databaseQueryToolDeclaration,
  displayContentToolDeclaration,
  endSessionToolDeclaration,
];


const tools = [
  databaseQueryToolExecutor,
];

export class GeminiLiveSession {
  private session: any = null;
  private connected = false;
  private callbacks: GeminiLiveSessionCallbacks;
  private sampleRate = 16000;

  constructor(callbacks: GeminiLiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(onReady?: () => void, config?: { sampleRate?: number }) {
    if (config?.sampleRate) {
      this.sampleRate = config.sampleRate;
      console.log(`Setting Gemini Live sample rate to ${this.sampleRate}Hz`);
    } else {
      console.log('Using default sample rate: 16000Hz');
    }

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
            turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
          },
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are the Northwind Back-Office Support Assistant. 
          You help employees check inventory, verify orders, and find customer details. 
          Use the provided tools to query the database accurately. 

          The schema of the database is as follows:
          ${getSchema()}

          Be helpful, professional, and concise.

          Example questions:
          - "How many products are in the database?"
          - "What is the total value of orders for customer 'ALFKI'?"
          - "Show me all orders for customer 'ALFKI'"
          - Who supplied the customer 'ALFKI'?
          - Get me the details of a product
          - Get me the details of the order '10643'.
          - Get me the details of a customer
          - Search for a product
          
          When you want to show the user details about a product, order, employee, or customer, ALWAYS use the \`display_content\` tool. 
          For example, if the user asks "Show me product 5", query the database first, then use \`display_content\` with type='product' and the product data.
          
          IMPORTANT: You must ALWAYS speak with a standard British English accent and use British English vocabulary and spelling (e.g. "autumn" not "fall", "biscuit" not "cookie").
          
          When the user says they are done or asks to stop/end the conversation, you must use the \`end_session\` tool to terminate the call.
          `,
          tools: [{ functionDeclarations }],
          speechConfig: {
            // voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
            languageCode: 'en-US',
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
            mimeType: `audio/pcm;rate=16000`,
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
        console.log('Input transcription:', msg.serverContent.inputTranscription?.text);
        this.callbacks.onInputTranscription(msg.serverContent.inputTranscription?.text ?? '');
      }

      // Output transcription
      if (msg.serverContent?.outputTranscription) {
        console.log('Output transcription:', msg.serverContent.outputTranscription?.text);
        this.callbacks.onOutputTranscription(msg.serverContent.outputTranscription?.text ?? '');
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

      // Text response
      // if (msg.serverContent?.modelTurn?.parts?.[0]?.text) {
      //   console.log('Model turn text:', msg.serverContent.modelTurn?.parts?.[0]?.text);
      //   this.callbacks.onText(msg.serverContent.modelTurn?.parts?.[0]?.text ?? '');
      // }

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

      // Notify client that a tool is being called
      this.callbacks.onToolCall?.({ name: fc.name, args: fc.args });

      let result: any;

      try {
        switch (fc.name) {
          case 'database_query':
            result = await databaseQueryToolExecutor(fc.args);
            break;
          case 'display_content':
            result = await displayContentToolExecutor(fc.args);
            break;
          case 'end_session':
            result = await endSessionToolExecutor(fc.args);
            // Initiate disconnect sequence
            setTimeout(() => this.disconnect(), 500); // Give a brief moment for the audio response/acknowledgement if any
            break;
          default:
            result = { error: `Unknown function: ${fc.name}` };
        }

        console.log('Function result:', result);

        // Notify client of tool result
        this.callbacks.onToolResult?.({ name: fc.name, result });

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
