export interface TranscriptionEntry {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
