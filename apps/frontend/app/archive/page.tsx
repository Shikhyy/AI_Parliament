'use client';

import { Navbar } from '@/components/layout/Navbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useEffect, useState } from 'react';
import { getDebates, Debate } from '@/lib/api';

export default function Archive() {
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
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchDebates, 10000);
        return () => clearInterval(interval);
    }, []);

    // Calculate stats
    const totalDebates = debates.length;
    // Mock stability score for now, maybe average it from consensus if available in list view later
    const globalStability = totalDebates > 0 ? "94.2%" : "100%";

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-200 selection:bg-primary selection:text-white flex flex-col">
            <Navbar />

            <div className="flex flex-1">
                {/* Side Navigation */}
                <aside className="w-20 hidden lg:flex flex-col items-center py-8 bg-background-dark border-r border-primary/20 z-10">
                    <div className="mb-12">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/40">
                            <span className="material-icons text-white">account_balance</span>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-8">
                        <button className="text-slate-500 hover:text-primary transition-colors">
                            <span className="material-icons">dashboard</span>
                        </button>
                        <button className="text-primary">
                            <span className="material-icons">history_edu</span>
                        </button>
                        <button className="text-slate-500 hover:text-primary transition-colors">
                            <span className="material-icons">gavel</span>
                        </button>
                        <button className="text-slate-500 hover:text-primary transition-colors">
                            <span className="material-icons">public</span>
                        </button>
                    </nav>
                    <div className="mt-auto">
                        <button className="text-slate-500 hover:text-primary transition-colors">
                            <span className="material-icons">settings</span>
                        </button>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
                    <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                        {/* Header Section */}
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
                                    Global <span className="bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">Consensus Archive</span>
                                </h1>
                                <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Decentralized AI Governance Ledger // Level 04 Access</p>
                            </div>
                            <div className="flex gap-4">
                                <GlassPanel className="px-6 py-3 rounded-xl border-primary/20" hoverEffect={false}>
                                    <p className="text-[10px] text-slate-500 font-mono uppercase">Global Stability</p>
                                    <p className="text-2xl font-bold text-white">{globalStability}</p>
                                </GlassPanel>
                                <GlassPanel className="px-6 py-3 rounded-xl border-primary/20" hoverEffect={false}>
                                    <p className="text-[10px] text-slate-500 font-mono uppercase">Total Ratified</p>
                                    <p className="text-2xl font-bold text-white">{totalDebates}</p>
                                </GlassPanel>
                            </div>
                        </header>

                        {/* Search & Filter Console */}
                        <GlassPanel className="rounded-xl p-2 mb-12 flex flex-col md:flex-row gap-2 items-center" hoverEffect={false}>
                            <div className="relative flex-grow w-full md:w-auto">
                                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">search</span>
                                <input className="w-full bg-transparent border-none focus:ring-0 text-white font-mono pl-12 py-4 placeholder:text-slate-600 focus:outline-none" placeholder="SEARCH THE HISTORY..." type="text" />
                            </div>
                            <div className="flex gap-2 p-1 w-full md:w-auto overflow-x-auto">
                                <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary font-mono text-sm whitespace-nowrap">
                                    <span className="material-icons text-sm">eco</span> ENVIRONMENT
                                </button>
                                <button className="flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-white/5 border border-transparent text-slate-400 font-mono text-sm transition-all whitespace-nowrap">
                                    <span className="material-icons text-sm">psychology</span> ETHICS
                                </button>
                                <button className="flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-white/5 border border-transparent text-slate-400 font-mono text-sm transition-all whitespace-nowrap">
                                    <span className="material-icons text-sm">payments</span> ECONOMY
                                </button>
                            </div>
                        </GlassPanel>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                            {/* 3D Globe Heatmap Visualization */}
                            <div className="lg:col-span-7 flex flex-col gap-8">
                                <GlassPanel className="relative aspect-square lg:aspect-video rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(19,55,236,0.15)] group p-0" hoverEffect={false}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
                                    <img
                                        className="w-full h-full object-cover opacity-60 mix-blend-screen"
                                        alt="Digital Globe with Blue Data Highlights"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKbaHXMThK6FLZU0DUfPyU04inn9UQeFRt0DuVHB9yshf6Y_GKpD0-fQk6kfNzJupQSEGk7DoYatF2xKVat4ANYMzsVv-bB9vdsNHxwFz3-HZShGO3J2B8-T2AJ_sjm3Hg1Ky5_oEyQYhrwvP-bO72zl8uw5kx3RQofuSANxyET-XzpsHxZKGbScZVaeYl0mQ7nN6TSXSUmmL87bu6B-0eF2WCutZ79-SFQp7qfPuIcCIAjBQuN5DFhLODaMir0oNIwbYUhR8ieG0"
                                    />
                                    {/* Floating Data Overlays */}
                                    <GlassPanel className="absolute top-6 left-6 md:top-8 md:left-8 p-4 rounded-xl border-l-4 border-l-primary" hoverEffect={false}>
                                        <p className="text-[10px] font-mono text-slate-400">ACTIVE REGION</p>
                                        <p className="text-lg font-bold text-white">PAN-EUROPEAN SECTOR</p>
                                        <div className="mt-2 h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-3/4"></div>
                                        </div>
                                    </GlassPanel>
                                    <GlassPanel className="absolute bottom-6 right-6 md:bottom-8 md:right-8 p-4 rounded-xl" hoverEffect={false}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                            <span className="font-mono text-xs text-white">REAL-TIME CONSENSUS STREAM</span>
                                        </div>
                                    </GlassPanel>
                                    {/* Scanlines effect */}
                                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>
                                </GlassPanel>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <GlassPanel className="p-4 rounded-xl" hoverEffect={false}>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase">Archive Health</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-white font-bold">OPTIMAL</span>
                                            <span className="material-icons text-primary text-sm">verified_user</span>
                                        </div>
                                    </GlassPanel>
                                    <GlassPanel className="p-4 rounded-xl" hoverEffect={false}>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase">Sync Latency</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-white font-bold">14ms</span>
                                            <span className="material-icons text-primary text-sm">sensors</span>
                                        </div>
                                    </GlassPanel>
                                    <GlassPanel className="p-4 rounded-xl" hoverEffect={false}>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase">Nodes Active</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-white font-bold">1.2M+</span>
                                            <span className="material-icons text-primary text-sm">hub</span>
                                        </div>
                                    </GlassPanel>
                                </div>
                            </div>

                            {/* Recent Debates Ledger */}
                            <div className="lg:col-span-5">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="material-icons text-primary">history</span> Recent Debates
                                    </h3>
                                    <button className="text-xs font-mono text-primary hover:underline">VIEW FULL LEDGER</button>
                                </div>
                                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loading && (
                                        <div className="text-center py-8 text-slate-500">
                                            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                            Fetching archive data...
                                        </div>
                                    )}

                                    {!loading && debates.length === 0 && (
                                        <div className="text-center py-8 text-slate-500 italic">
                                            No debates archived yet.
                                        </div>
                                    )}

                                    {debates.map((debate) => (
                                        <GlassPanel key={debate.id} className="rounded-xl p-5 relative overflow-hidden group hover:cursor-pointer" hoverEffect={false}>
                                            <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-primary/20 to-transparent group-hover:left-full transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100"></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-white font-semibold mb-1">{debate.topic}</h4>
                                                    <p className="text-xs font-mono text-slate-500">PHASE: {debate.phase.toUpperCase()} // ID: #{debate.id.slice(0, 8)}</p>
                                                </div>
                                                <div className="relative w-12 h-12 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle className="text-slate-800" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="3"></circle>
                                                        <circle className="text-primary" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset="15" strokeWidth="3"></circle>
                                                    </svg>
                                                    {/* Percentage placeholder - in real app could be consensus score */}
                                                    <span className="absolute text-[10px] font-bold text-white">--</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                                                {debate.statements} statements exchanged by {debate.activeAgents} participating agents.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-slate-500">Active for {debate.ageMinutes}m</span>
                                            </div>
                                        </GlassPanel>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Stats HUD - Mobile only or bottom */}
                    <footer className="mt-auto px-12 py-6 border-t border-primary/10 flex flex-wrap gap-8 items-center bg-background-dark/80 backdrop-blur z-20">
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-mono text-xs">LATITUDE:</span>
                            <span className="text-white font-mono text-xs">34.0522° N</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-mono text-xs">LONGITUDE:</span>
                            <span className="text-white font-mono text-xs">118.2437° W</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-mono text-xs">SYSTEM CLOCK:</span>
                            <span className="text-white font-mono text-xs">{new Date().toISOString().split('T')[0]} // UTC</span>
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                            <div className="flex gap-1">
                                <div className="w-1 h-3 bg-primary"></div>
                                <div className="w-1 h-3 bg-primary"></div>
                                <div className="w-1 h-3 bg-primary/30"></div>
                                <div className="w-1 h-3 bg-primary/30"></div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Archive Secure Connection</span>
                        </div>
                    </footer>
                </div>
        </main>
    );
}

