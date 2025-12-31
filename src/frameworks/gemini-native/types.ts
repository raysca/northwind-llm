export interface UsageMetadata {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
}

export interface GeminiLiveSessionCallbacks {
  onAudio: (chunk: Buffer) => void;
  onInputTranscription: (text: string) => void;
  onOutputTranscription: (text: string) => void;
  onTurnComplete: () => void;
  onError: (error: Error) => void;
  onClose?: (code?: number, reason?: string) => void;
  onInterruption?: (event: any) => void;
  onToolCall?: (tool: { name: string; args: any }) => void;
  onToolResult?: (tool: { name: string; result: any }) => void;
  onUsage?: (usage: UsageMetadata) => void;
}

// Client -> Server messages
export type ClientMessage =
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'audio'; data: ArrayBuffer }
  | { type: 'text'; content: string };

// Server -> Client messages
export type ServerMessage =
  | { type: 'connected' }
  | { type: 'disconnected' }
  | { type: 'audio'; data: ArrayBuffer }
  | { type: 'input_transcription'; text: string }
  | { type: 'output_transcription'; text: string }
  | { type: 'turn_complete' }
  | { type: 'error'; message: string }
  | { type: 'function_call'; name: string; args: any }
  | { type: 'usage'; usage: UsageMetadata };

