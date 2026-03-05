import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { CitationCard } from './CitationCard';
import { clsx } from 'clsx';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isAssistant = message.role === 'assistant';

    return (
        <div className={clsx(
            "flex flex-col gap-2 max-w-[85%] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isAssistant ? "self-start" : "self-end"
        )}>
            <div className={clsx(
                "flex items-center gap-2 mb-1",
                isAssistant ? "flex-row" : "flex-row-reverse"
            )}>
                <div className={clsx(
                    "w-6 h-6 rounded flex items-center justify-center p-1",
                    isAssistant ? "bg-github-accent text-white" : "bg-github-card text-gray-400 border border-github-border"
                )}>
                    {isAssistant ? <Bot size={14} /> : <User size={14} />}
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">
                    {isAssistant ? 'Code Analyst' : 'You'}
                </span>
                <span className="text-[10px] text-gray-600 font-mono">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            <div className={clsx(
                "p-4 rounded-lg shadow-sm text-sm leading-relaxed",
                isAssistant
                    ? "bg-github-sidebar border border-github-border text-[#adbac7]"
                    : "bg-github-accent text-white"
            )}>
                <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-transparent prose-pre:p-0">
                    <ReactMarkdown
                        components={{
                            code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <div className="bg-black/20 rounded p-2 my-2 overflow-x-auto ring-1 ring-white/10">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </div>
                                ) : (
                                    <code className="bg-white/10 px-1 rounded text-github-accent" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
            </div>

            {isAssistant && message.citations && message.citations.length > 0 && (
                <div className="mt-4 space-y-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 px-1">
                        <span className="w-4 h-[1px] bg-gray-700" />
                        Sources & Context
                        <span className="w-16 h-[1px] bg-gray-700" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {message.citations.map((citation, i) => (
                            <CitationCard key={i} citation={citation} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
