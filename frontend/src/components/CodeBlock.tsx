import React from 'react';
import hljs from 'highlight.js';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
    code: string;
    language: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
    const [copied, setCopied] = React.useState(false);
    const highlighted = hljs.highlight(code, { language: language || 'plaintext' }).value;

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-md overflow-hidden bg-black/30 border border-github-border my-4">
            <div className="flex justify-between items-center px-4 py-1.5 bg-github-sidebar/50 text-xs border-b border-github-border">
                <span className="text-gray-400 font-mono tracking-tight lowercase">{language}</span>
                <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
                <code
                    className={`hljs language-${language}`}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
            </pre>
        </div>
    );
};
