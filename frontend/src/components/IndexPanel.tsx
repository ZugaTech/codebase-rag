import React, { useState } from 'react';
import { useIndexer } from '../hooks/useIndexer';
import { Folder, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface IndexPanelProps {
    onIndexComplete: (collectionName: string) => void;
}

export const IndexPanel: React.FC<IndexPanelProps> = ({ onIndexComplete }) => {
    const [path, setPath] = useState('');
    const { status, error, startIndexing } = useIndexer();

    const handleIndex = () => {
        if (!path) return;
        startIndexing(path);
    };

    const isRunning = status?.status === 'running' || status?.status === 'pending';
    const progress = status ? (status.processed_files / (status.total_files || 1)) * 100 : 0;

    React.useEffect(() => {
        if (status?.status === 'done') {
            // Slugify logic to match backend
            const slug = path.replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[-\s]+/g, '-');
            const safeName = slug.replace(/[^a-zA-Z0-9_-]/g, '');
            onIndexComplete(safeName.length < 3 ? "col-" + safeName.padEnd(3, '0') : safeName.slice(0, 63));
        }
    }, [status, path, onIndexComplete]);

    return (
        <div className="bg-github-sidebar w-80 border-r border-github-border h-screen p-4 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-github-accent font-semibold">
                <Folder size={20} />
                <span>Index Codebase</span>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Local Path</label>
                    <input
                        type="text"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        placeholder="/path/to/project"
                        className="w-full bg-github-bg border border-github-border rounded p-2 text-sm focus:border-github-accent outline-none"
                        disabled={isRunning}
                    />
                </div>

                <button
                    onClick={handleIndex}
                    disabled={isRunning || !path}
                    className={clsx(
                        "w-full py-2 rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors",
                        isRunning ? "bg-github-border text-gray-500" : "bg-github-accent text-white hover:bg-blue-600"
                    )}
                >
                    {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                    {isRunning ? 'Indexing...' : 'Start Indexing'}
                </button>

                {status && (
                    <div className="space-y-3 pt-4 border-t border-github-border">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-github-bg rounded-full h-1.5 overflow-hidden border border-github-border">
                            <div
                                className="bg-github-accent h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="text-[10px] text-gray-400 font-mono break-all leading-tight">
                            Files: {status.processed_files}/{status.total_files}<br />
                            Chunks: {status.total_chunks}
                        </div>

                        {status.status === 'done' && (
                            <div className="flex items-center gap-2 text-green-500 text-sm">
                                <CheckCircle size={16} />
                                <span>Indexing Complete</span>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-2 text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
