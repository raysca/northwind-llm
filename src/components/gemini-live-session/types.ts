export type GeminiMessageRole = 'user' | 'model' | 'tool';

export interface ToolCallContent {
  toolCallId: string;
  name: string;
  args: any;
}

export interface ToolResultContent {
  toolCallId: string;
  name: string;
  result: any;
}

export interface GeminiMessage {
  id: string;
  role: GeminiMessageRole;
  type: 'text' | 'tool_call' | 'tool_result';
  content: string | ToolCallContent | ToolResultContent;
  timestamp: number;
}

export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
