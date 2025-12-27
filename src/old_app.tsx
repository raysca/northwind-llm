
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { dbService } from './services/database';
import { decode, decodeAudioData, createBlob } from './lib/audio-utils';
import {
  PhoneIcon,
  PhoneXMarkIcon,
  MicrophoneIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export interface TranscriptionEntry {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}


const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

// Function Declarations for Gemini
const functions: FunctionDeclaration[] = [
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
  {
    name: 'get_customer_info',
    parameters: {
      type: Type.OBJECT,
      description: 'Find details about a customer by their ID.',
      properties: {
        id: { type: Type.STRING, description: 'The unique customer ID (e.g. ALFKI).' },
      },
      required: ['id'],
    },
  },
];

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcriptions
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcriptions, currentInput, currentOutput]);

  const startSession = async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      // Initialize Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      // Request Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are the Northwind Back-Office Support Assistant. You help employees check inventory, verify orders, and find customer details. Use the provided tools to query the database accurately. Be helpful, professional, and concise.',
          tools: [{ functionDeclarations: functions }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            setIsActive(true);

            // Audio Stream from Mic
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
              setCurrentInput(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.outputTranscription) {
              setCurrentOutput(prev => prev + message.serverContent!.outputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
              setTranscriptions(prev => [
                ...prev,
                { id: Math.random().toString(), role: 'user', text: currentInput, timestamp: Date.now() },
                { id: Math.random().toString(), role: 'model', text: currentOutput, timestamp: Date.now() }
              ].filter(t => t.text.trim() !== ''));
              setCurrentInput('');
              setCurrentOutput('');
            }

            // Handle Audio Playback
            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64 && outputCtx) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioBase64), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Interrupt Handling
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Function Calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                console.log('Tool call:', fc);
                let result: any = 'Function not found';

                if (fc.name === 'list_products') result = dbService.getProducts();
                if (fc.name === 'get_product_details') result = dbService.getProduct(fc.args.id as string);
                if (fc.name === 'list_orders') result = dbService.getOrders();
                if (fc.name === 'get_customer_info') result = dbService.getCustomer(fc.args.id as string);

                sessionPromise.then((session) => {
                  session.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { result },
                    }
                  });
                });
              }
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            setError('Connection error. Please check your API key and network.');
            stopSession();
          },
          onclose: () => {
            console.log('Session closed');
            stopSession();
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start voice assistant');
      setIsActive(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.input.close();
    audioContextRef.current?.output.close();
    sessionPromiseRef.current?.then(s => s.close());
    sessionPromiseRef.current = null;
    sourcesRef.current.clear();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <PhoneIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Northwind Support</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Back-Office Live Agent</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {error && (
            <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-500/30">
              {error}
            </div>
          )}
          <button
            onClick={isActive ? stopSession : startSession}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg ${isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
          >
            {isActive ? (
              <>
                <PhoneXMarkIcon className="w-5 h-5" />
                <span>End Call</span>
              </>
            ) : (
              <>
                <PhoneIcon className="w-5 h-5" />
                <span>Start Call</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Real-time Transcripts & Visualizer */}
        <div className="flex-1 flex flex-col p-6 space-y-4 max-w-2xl border-r border-slate-800">
          <div className="flex items-center space-x-2 text-slate-400 mb-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-sm font-medium">{isActive ? 'Live Conversation' : 'Assistant Idle'}</span>
          </div>

          <div
            ref={transcriptScrollRef}
            className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 overflow-y-auto space-y-6 scroll-smooth shadow-inner"
          >
            {transcriptions.length === 0 && !currentInput && !currentOutput && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 text-center">
                <MicrophoneIcon className="w-12 h-12 opacity-20" />
                <p>No active conversation.<br />Start a call to speak with the back-office database.</p>
              </div>
            )}

            {transcriptions.map((t) => (
              <div
                key={t.id}
                className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${t.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                  <p className="text-sm leading-relaxed">{t.text}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {(currentInput || currentOutput) && (
              <div className="space-y-4">
                {currentInput && (
                  <div className="flex flex-col items-end animate-pulse">
                    <div className="bg-indigo-600/50 text-white/80 px-4 py-3 rounded-2xl rounded-tr-none">
                      <p className="text-sm">{currentInput}</p>
                    </div>
                  </div>
                )}
                {currentOutput && (
                  <div className="flex flex-col items-start">
                    <div className="bg-slate-800/80 text-slate-300 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-700">
                      <p className="text-sm italic">{currentOutput}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audio Visualizer Mock */}
          {isActive && (
            <div className="h-12 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-center space-x-1 px-4">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-indigo-500 rounded-full animate-bounce"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: '0.6s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Database Explorer Dashboard */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-lg font-bold flex items-center mb-4">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-indigo-400" />
              Northwind Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingBagIcon className="w-6 h-6 text-emerald-400" />
                  <span className="text-2xl font-bold">{dbService.getProducts().length}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">SKUs in Catalog</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-amber-400" />
                  <span className="text-2xl font-bold">{dbService.getOrders().length}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Open Orders</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <UserGroupIcon className="w-6 h-6 text-sky-400" />
                  <span className="text-2xl font-bold">{dbService.getCustomers().length}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Managed Accounts</p>
              </div>
            </div>

            {/* Inventory Quick View */}
            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Inventory</h3>
                  <button className="text-xs text-indigo-400 font-medium">View All</button>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800/50 text-slate-400 text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {dbService.getProducts().slice(0, 5).map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-4 py-3 font-medium group-hover:text-indigo-400">{p.name}</td>
                          <td className="px-4 py-3 text-slate-400">${p.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.unitsInStock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                              {p.unitsInStock} UNITS
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Orders Quick View */}
              <section>
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Orders</h3>
                  <button className="text-xs text-indigo-400 font-medium">View History</button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {dbService.getOrders().map(o => (
                    <div key={o.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-slate-600 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-700 transition-colors">
                          #{o.id.slice(-3)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">Order {o.id}</p>
                          <p className="text-xs text-slate-500">{o.customerId} • {o.orderDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">${o.total.toFixed(2)}</p>
                        <span className={`text-[10px] font-bold uppercase ${o.status === 'Shipped' ? 'text-blue-400' : 'text-amber-400'
                          }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="px-6 py-2 bg-slate-950 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-mono">
        <div className="flex items-center space-x-4">
          <span>LATENCY: ~200ms</span>
          <span>SR: 24kHz</span>
          <span>VOICE: Kore</span>
        </div>
        <div>
          NORTHWIND CORP © 2024 - BACKOFFICE PORTAL v2.4.1
        </div>
      </footer>
    </div>
  );
}
