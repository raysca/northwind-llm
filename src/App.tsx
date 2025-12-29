import { useState } from "react";
import ChatBot from "./components/chat";
import { GeminiLiveInterface } from "./components/gemini-live-session";
import { SpeechEcho } from "./components/speech-echo";
import "./index.css";

type Mode = 'chat' | 'mastra-voice' | 'gemini-native-voice' | 'speech-echo';

export function App() {
  const [mode, setMode] = useState<Mode>('gemini-native-voice');

  return (
    <>
      {/* Mode Toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-lg">
        <button
          onClick={() => setMode('chat')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'chat'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMode('mastra-voice')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'mastra-voice'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
          Mastra Voice
        </button>
        <button
          onClick={() => setMode('gemini-native-voice')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'gemini-native-voice'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
          Gemini Native Voice
        </button>
        <button
          onClick={() => setMode('speech-echo')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'speech-echo'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
          Speech Echo
        </button>
      </div>

      {/* Render based on mode */}
      {mode === 'chat' && (
        <div className="container mx-auto p-8 text-center relative z-10">
          <ChatBot />
        </div>
      )}
      {mode === 'mastra-voice' && (
        <div className="text-white">
          <p className="text-center py-20">Mastra Voice implementation - integrate RealtimeInterface here</p>
        </div>
      )}
      {mode === 'gemini-native-voice' && <GeminiLiveInterface />}
      {mode === 'speech-echo' && (
        <div className="flex h-screen w-full items-center justify-center bg-black">
          <SpeechEcho />
        </div>
      )}
    </>
  );
}

export default App;
