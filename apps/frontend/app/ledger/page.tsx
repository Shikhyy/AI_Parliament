'use client';

import { Navbar } from '@/components/layout/Navbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useEffect, useState } from 'react';
import { getDebates, Debate } from '@/lib/api';

export default function Ledger() {
    const [debates, setDebates] = useState<Debate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDebates = async () => {
            try {
                const data = await getDebates();
                setDebates(data);
            } catch (error) {
                console.error("Failed to fetch debates", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDebates();
        const interval = setInterval(fetchDebates, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display overflow-hidden flex flex-col">
            {/* Background Data Stream Layer */}
            <div className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-[linear-gradient(0deg,rgba(37,192,244,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,192,244,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
            <div className="fixed inset-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark pointer-events-none z-0"></div>

            <Navbar />

            <div className="relative z-10 flex flex-1 overflow-hidden">
                {/* Left Sidebar: Evolution Tree */}
                <aside className="w-72 border-r border-primary/10 bg-background-dark/50 backdrop-blur-sm hidden lg:flex flex-col p-6 overflow-y-auto">
                    <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <span className="material-icons text-sm">account_tree</span> Evolution Tree
                    </h2>
                    <div className="relative flex flex-col gap-12 ml-4">
                        {/* Vertical Connection Line */}
                        <div className="absolute left-[-16px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-primary to-transparent opacity-30"></div>

                        {/* Tree Nodes - Dynamic */}
                        {debates.map((debate, index) => (
                            <div key={debate.id} className="relative group cursor-pointer transition-opacity opacity-80 hover:opacity-100">
                                <div className={`absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full ${index === 0 ? 'bg-primary shadow-[0_0_15px_rgba(37,192,244,0.3)]' : 'bg-slate-500'}`}></div>
                                <p className={`text-[10px] ${index === 0 ? 'text-primary' : 'text-slate-500'} mb-1 uppercase`}>
                                    EPOCH {String(index + 1).padStart(2, '0')}
                                </p>
                                <h3 className={`text-white font-bold text-sm ${index === 0 ? 'group-hover:text-primary' : ''} transition-colors line-clamp-2`}>
                                    {debate.topic}
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                    {debate.phase === 'completed' ? 'Ratified Protocol' : 'Active Discussion'}
                                </p>
                            </div>
                        ))}

                        {debates.length === 0 && !loading && (
                            <div className="text-xs text-slate-500 italic">No epochs recorded.</div>
                        )}
                    </div>

                    <div className="mt-auto pt-8 border-t border-primary/10">
                        <div className="bg-primary/5 p-4 rounded-sm border border-primary/20">
                            <p className="text-[10px] text-primary uppercase font-bold mb-2">Sync Status</p>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-4/5"></div>
                                </div>
                                <span className="text-[10px] text-white">Online</span>
                            </div>
                            <p className="text-[9px] text-slate-500">Connected to Parliament Mesh</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content: The Living Scroll */}
                <section className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center custom-scrollbar">
                    {/* Search & Filters */}
                    <div className="w-full max-w-4xl mb-12 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 group w-full">
                            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50">search</span>
                            <input className="w-full bg-background-dark/80 border border-primary/30 rounded-sm py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-primary/30 placeholder:uppercase tracking-widest" placeholder="QUERY LEDGER ARTICLES..." type="text" />
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-background-dark border border-primary/20 text-xs px-4 py-3 text-slate-300 hover:text-primary hover:border-primary transition-colors flex items-center gap-2">
                                <span className="material-icons text-sm">filter_list</span> CATEGORY
                            </button>
                            <button className="bg-background-dark border border-primary/20 text-xs px-4 py-3 text-slate-300 hover:text-primary hover:border-primary transition-colors flex items-center gap-2">
                                <span className="material-icons text-sm">history_edu</span> SIGNATORIES
                            </button>
                        </div>
                    </div>

                    {/* Scroll Container */}
                    <div className="w-full max-w-4xl space-y-12 pb-24">
                        {loading && (
                            <div className="text-center py-12">
                                <div className="animate-pulse text-primary font-mono text-sm">SYNCING WITH BLOCKCHAIN LEDGER...</div>
                            </div>
                        )}

                        {!loading && debates.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-slate-700 rounded-lg">
                                <p className="text-slate-400 font-mono">NO RECORDS FOUND IN GENESIS BLOCK.</p>
                                <p className="text-xs text-slate-600 mt-2">Start a debate to initialize the ledger.</p>
                            </div>
                        )}

                        {debates.map((debate, i) => (
                            <article key={debate.id} className="relative bg-background-dark/40 border-l-2 border-primary/50 p-8 hover:bg-background-dark/60 transition-all group">
                                <div className="absolute -right-6 top-8 w-24 h-24 hidden md:block perspective-[1000px] group-hover:[&>div]:rotate-y-180">
                                    <div className="w-full h-full border-2 border-accent-gold/50 rounded-full flex items-center justify-center bg-accent-gold/10 backdrop-blur-sm transition-transform duration-700 preserve-3d">
                                        <span className="material-icons text-3xl text-accent-gold">
                                            {i % 2 === 0 ? 'security' : 'psychology'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 border border-primary/30">ARTICLE {String(debates.length - i).padStart(2, '0')}</span>
                                    <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 border border-slate-700">
                                        <span className={`w-2 h-2 rounded-full ${debate.phase === 'completed' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></span>
                                        <span className="text-[10px] text-slate-300 font-mono">VERIFIED: {debate.id.slice(0, 10)}...</span>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-primary transition-colors uppercase">{debate.topic}</h2>
                                <p className="text-slate-400 leading-relaxed mb-6 font-light">
                                    {debate.statements > 0
                                        ? `Protocol contains ${debate.statements} verified statements from ${debate.activeAgents} autonomous agents. Consensus formation is ${debate.phase === 'completed' ? 'complete' : 'ongoing'}.`
                                        : "Protocol initialized. Awaiting autonomous agent contributions."}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                                    <div className="flex gap-4">
                                        <button className="text-[10px] text-slate-500 hover:text-primary uppercase tracking-widest font-bold flex items-center gap-1 transition-colors">
                                            <span className="material-icons text-xs">edit</span> View Transcript
                                        </button>
                                        <button className="text-[10px] text-slate-500 hover:text-primary uppercase tracking-widest font-bold flex items-center gap-1 transition-colors">
                                            <span className="material-icons text-xs">share</span> Export Hash
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-mono">Age: {debate.ageMinutes}m // State: {debate.phase.toUpperCase()}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Right Sidebar: Stats & Info */}
                <aside className="w-80 border-l border-primary/10 bg-background-dark/50 backdrop-blur-sm hidden xl:flex flex-col p-6 overflow-y-auto">
                    <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-8">System Telemetry</h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-2">
                                <span>Ledger Integrity</span>
                                <span className="text-primary">SECURE</span>
                            </div>
                            <img className="w-full h-32 object-cover grayscale brightness-50 border border-primary/20 rounded-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6V1keBrNRIGg2u-620TECFRWH7fKeC3Vs7qhf3PPHkWpZ3VIa3xowVZPinuVY9lDsMttv7Qs2ryIr1Jab2ZkCmmHcdfOvzUECBnnHP-bKK4HRJFj9ZDYxsNRS4A4-PvhbZMf6iGN9SdBZh0V36dW3bdOWlYUcpTUY8NFSK6ka02X6uBFFG55_mObxdispuJhLFY5jcRY3P1SzYJyxWRpYJVrXgDJxpAzl6KoYPqjsPd3w_yfJiq3ODuIkmkyEX0E8365Myua_lIk" alt="Graph data" />
                        </div>
                        <div className="bg-background-dark border border-primary/10 p-4">
                            <p className="text-[10px] text-primary uppercase font-bold mb-4">Constitutional Meta-Data</p>
                            <ul className="space-y-3">
                                <li className="flex justify-between items-center">
                                    <span className="text-[11px] text-slate-400">Word Count</span>
                                    <span className="text-[11px] text-white font-mono">
                                        {(debates.reduce((acc, d) => acc + (d.statements * 50), 0)).toLocaleString()} {/* Est. 50 words per statement */}
                                    </span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-[11px] text-slate-400">Total Signatures</span>
                                    <span className="text-[11px] text-white font-mono">
                                        {debates.reduce((acc, d) => acc + Number(d.activeAgents), 0)}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Status Bar */}
            <footer className="z-50 bg-background-dark/90 backdrop-blur-md border-t border-primary/20 px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">PARLIAMENT_MESH_ONLINE</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>LATENCY: 12ms</span>
                        <span className="text-primary/30">|</span>
                        <span>PKT_LOSS: 0.00%</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
