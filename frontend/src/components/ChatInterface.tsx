import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Terminal } from 'lucide-react';
import { Message, Citation } from '../types';
import { MessageBubble } from './MessageBubble';
import { useRAG } from '../hooks/useRAG';

interface ChatInterfaceProps {
    collectionName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ collectionName }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const { isStreaming, submitQuery } = useRAG(collectionName);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        const assistantMsgId = (Date.now() + 1).toString();
        const initialAssistantMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, initialAssistantMsg]);

        await submitQuery(
            input,
            (text) => {
                // Try to parse partial JSON if possible, or just update content
                try {
                    const parsed = JSON.parse(text);
                    setMessages(prev => prev.map(m =>
                        m.id === assistantMsgId ? { ...m, content: parsed.answer } : m
                    ));
                } catch (e) {
                    // If not valid JSON yet, we might still want to show partial answer if backend supports it
                    // But our backend sends tokens of the JSON object.
                }
            },
            (citations) => {
                // Final update with citations
                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? { ...m, citations } : m
                ));
            }
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-github-bg relative overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-github-border flex items-center justify-between px-6 bg-github-sidebar/30 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-github-accent" />
                    <h1 className="text-sm font-semibold flex items-center gap-2">
                        Code Query
                        <span className="text-[10px] px-2 py-0.5 bg-github-accent/10 text-github-accent rounded-full border border-github-accent/20 uppercase tracking-widest">
                            Live
                        </span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Connected: {collectionName}
                    </span>
                </div>
            </div>

            {/* Chat History */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-8 flex flex-col"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 select-none">
                        <MessageSquare size={48} className="mb-4 text-gray-600" />
                        <p className="text-sm font-medium">Ask anything about the indexed codebase</p>
                        <p className="text-xs mt-2 font-mono italic">"Where is the data fetching logic?"</p>
                    </div>
                ) : (
                    messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-github-border bg-github-sidebar/20 backdrop-blur-md">
                <div className="max-w-4xl mx-auto relative group">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask a question about the code..."
                        className="w-full bg-github-sidebar border border-github-border rounded-xl p-4 pr-14 text-sm focus:border-github-accent outline-none min-h-[56px] max-h-32 resize-none transition-all duration-200 group-hover:border-gray-600"
                        disabled={isStreaming}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        className={clsx(
                            "absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-200",
                            input.trim() && !isStreaming
                                ? "bg-github-accent text-white shadow-lg shadow-github-accent/20"
                                : "bg-github-border text-gray-500 cursor-not-allowed"
                        )}
                    >
                        {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <p className="text-[10px] text-center mt-3 text-gray-600 font-mono uppercase tracking-[0.2em]">
                    GPT-4o Powered Code Reasoning Engine
                </p>
            </div>
        </div>
    );
};
