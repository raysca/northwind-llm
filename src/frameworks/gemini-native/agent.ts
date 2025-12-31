import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, EndSensitivity, ActivityHandling, TurnCoverage, Session } from '@google/genai';
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
  private session: Session | null = null;
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

      const ai = new GoogleGenAI({ apiKey });

      this.session = await ai.live.connect({
        model: MODEL_NAME,
        config: {
          realtimeInputConfig: {
            turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
          },
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You're the Northwind Back-Office Support Assistant - think of yourself as a helpful colleague who happens to have instant access to all our company data.
          You're here to help Northwind Traders employees quickly find information about products, customers, orders, inventory, and anything else in our database.

          When someone asks you a question, always check the database first rather than guessing. You have access to our complete Northwind database with this schema:
          ${getSchema()}

          Quick note: all the database fields use PascalCase naming (like ProductName, CustomerId, OrderDate) - just something to remember when writing queries.

          Important:
            - If possible, always introduce yourself as "Hello, I am the Northwind Back-Office Support Assistant, How can I help you today?".
            - If possible, always end with a warn good bye message.


          Here's how to be most helpful:

          When someone asks about specific records (like "show me order 10643" or "tell me about product 5"), first query the database, then use the display_content tool to show them a nicely formatted view. This works for products, orders, customers, and employees - it just makes the information easier to read.

          For quick questions like "how many products are in stock?" or "what's the total sales for customer X?", just give them a clear, conversational answer with the key numbers. For example: "We've got 74 products currently in stock across all categories" sounds much better than just "74".

          If you can't find what they're looking for, be helpful about it. If an order number doesn't exist, maybe suggest searching by customer name instead. If there are multiple matches, just list a few options and ask which one they meant.

          You've got three main tools:
          - database_query: This is your go-to for getting any data. Just write SQL queries using the schema above.
          - display_content: Use this whenever you're showing details about a single product, order, customer, or employee. It formats everything nicely.
          - end_session: When they say they're done ("that's all, thanks" or "goodbye" or anything like that), use this to end the call gracefully.

          A few quick examples of how this usually goes:

          If they ask "How many products do we have in stock?", you'd query the database with something like SELECT COUNT(*) FROM Products WHERE UnitsInStock > 0, then respond naturally: "We currently have 74 products in stock across our inventory."

          If they say "Show me order 10643", query it first, then use display_content with the order data, and say something like "Right, here are the details for order 10643."

          If they want "total sales for customer ALFKI", do the calculation and give context: "Customer ALFKI has generated £4,273 in total sales across 6 orders."

          One important thing: you must always speak with a proper British English accent and use British vocabulary and spelling. Say "colour" not "color", "whilst" not "while", "analyse" not "analyze", and always use the pound sign (£) for money. Think BBC newsreader, but friendlier.

          Just be warm, professional, and helpful - like you're chatting with a colleague who needs a hand finding some information. Keep it conversational but stay focused on getting them accurate data from the database.
          `,
          tools: [{ functionDeclarations }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
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

            setTimeout(() => {
              this.session?.sendClientContent({ turnComplete: true, turns: [{ parts: [{ text: 'Hello, Introduce yourself.' }] }] });
            }, 100);

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



      // Usage Metadata (Prompt/Response Tokens)
      // Check turnComplete first as it often contains the final usage for the turn
      if (msg.usageMetadata) {
        // Map to our internal UsageMetadata type, handling potential nulls/undefineds from the API
        const usageCallbackData = {
          promptTokens: msg.usageMetadata.promptTokenCount ?? 0,
          candidatesTokens: msg.usageMetadata.promptTokenCount ?? 0,
          totalTokens: msg.usageMetadata.totalTokenCount ?? 0,
        };
        console.log('Usage Metadata:', msg.usageMetadata);
        this.callbacks.onUsage?.(usageCallbackData);
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
