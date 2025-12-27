import { Wrench, Database, ShoppingBag, ClipboardList, Search } from 'lucide-react';

interface ToolCallIndicatorProps {
    tool: { name: string; args: any } | null;
}

export function ToolCallIndicator({ tool }: ToolCallIndicatorProps) {
    if (!tool) return null;

    const getIcon = (name: string) => {
        if (name.includes('product')) return <ShoppingBag className="w-4 h-4" />;
        if (name.includes('order')) return <ClipboardList className="w-4 h-4" />;
        if (name.includes('search')) return <Search className="w-4 h-4" />;
        return <Database className="w-4 h-4" />;
    };

    const formatToolName = (name: string) => {
        return name
            .replace(/_/g, ' ')
            .replace(/Tool$/, '')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <div className="flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-indigo-900/40 border border-indigo-500/30 text-indigo-200 px-4 py-2 rounded-full flex items-center space-x-3 shadow-lg backdrop-blur-sm">
                <div className="animate-spin-slow">
                    <Wrench className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="h-4 w-px bg-indigo-500/30" />
                <div className="flex items-center space-x-2">
                    {getIcon(tool.name)}
                    <span className="text-xs font-medium tracking-wide">
                        Executing: <span className="text-white">{formatToolName(tool.name)}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
