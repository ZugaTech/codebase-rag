import { useState } from 'react';
import { IndexPanel } from './components/IndexPanel';
import { ChatInterface } from './components/ChatInterface';
import { Github, Code2, Sparkles } from 'lucide-react';

function App() {
    const [activeCollection, setActiveCollection] = useState<string | null>(null);

    return (
        <div className="flex h-screen w-screen bg-github-bg text-github-text overflow-hidden font-sans">
            <IndexPanel onIndexComplete={setActiveCollection} />

            {activeCollection ? (
                <ChatInterface collectionName={activeCollection} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-github-accent/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

                    <div className="relative space-y-8 max-w-2xl">
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <div className="p-3 bg-github-sidebar border border-github-border rounded-2xl shadow-xl ring-1 ring-white/5">
                                <Github size={40} className="text-white" />
                            </div>
                            <div className="w-12 h-[1px] bg-github-border" />
                            <div className="p-3 bg-github-accent border border-github-accent/30 rounded-2xl shadow-xl shadow-github-accent/20 ring-1 ring-white/10">
                                <Sparkles size={40} className="text-white" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold tracking-tight text-white">
                                Intelligent Code<br />
                                <span className="text-github-accent">Reasoning OS</span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto">
                                Index your local repository to enable deep semantic exploration and automated architecture analysis.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="bg-github-sidebar/40 border border-github-border p-4 rounded-xl text-left backdrop-blur-sm">
                                <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center mb-3">
                                    <Code2 size={16} className="text-blue-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-[#adbac7] mb-1">Semantic Search</h3>
                                <p className="text-[11px] text-gray-500 leading-normal">
                                    No more grep. Ask for context and logic directly in natural language.
                                </p>
                            </div>
                            <div className="bg-github-sidebar/40 border border-github-border p-4 rounded-xl text-left backdrop-blur-sm">
                                <div className="w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center mb-3">
                                    <Sparkles size={16} className="text-purple-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-[#adbac7] mb-1">Exact Citations</h3>
                                <p className="text-[11px] text-gray-500 leading-normal">
                                    Every answer includes direct file paths and line numbers with snippets.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-12 animate-bounce opacity-30">
                            <div className="w-1 h-8 rounded-full bg-github-accent/50" />
                            <p className="text-[10px] uppercase tracking-widest font-bold">Start indexing to begin</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
