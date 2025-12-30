import "./index.css";
import { RealtimeChat as ChatComponent } from "./components/real-time-agent/chat";
import { GeminiLiveInterface } from "./components/gemini-live-session";

export const RealTimeChat = () => {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-border/50">
                <ChatComponent />
            </div>

            {/* Sidebar for Gemini Live */}
            <div className="w-[400px] flex-shrink-0 bg-slate-950 border-l border-slate-800">
                <GeminiLiveInterface />
            </div>
        </div>
    );
}
