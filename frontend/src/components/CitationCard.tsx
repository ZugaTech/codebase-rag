import React, { useState } from 'react';
import { FileCode, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Citation } from '../types';
import { CodeBlock } from './CodeBlock';
import { clsx } from 'clsx';

interface CitationCardProps {
    citation: Citation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyPath = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(citation.filepath);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score > 0.8) return 'bg-green-500';
        if (score > 0.6) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-github-card border-l-2 border-github-accent rounded-r-md overflow-hidden transition-all duration-200">
            <div
                className="p-3 cursor-pointer hover:bg-white/5 flex items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <FileCode size={18} className="text-gray-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate text-[#adbac7]">{citation.filepath}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-github-sidebar px-1.5 py-0.5 rounded text-gray-400 font-mono">
                                L{citation.start_line}-{citation.end_line}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-12 h-1 bg-github-sidebar rounded-full overflow-hidden">
                                    <div
                                        className={clsx("h-full", getScoreColor(citation.relevance_score))}
                                        style={{ width: `${citation.relevance_score * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono">
                                    {(citation.relevance_score * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                        onClick={handleCopyPath}
                        className="p-1.5 text-gray-500 hover:text-white transition-colors"
                        title="Copy path"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </div>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 border-t border-github-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <CodeBlock
                        code={citation.snippet}
                        language={citation.filepath.split('.').pop() || 'plaintext'}
                    />
                </div>
            )}
        </div>
    );
};
