'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import Link from 'next/link';

interface Protocol {
    id: string;
    name: string;
    description: string;
    rules: {
        turnDuration: number;
        maxTurns: number;
        consensusThreshold: number;
        interventionStyle: string;
    };
}

export default function ProtocolPage() {
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProtocols = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/protocols`);
                const data = await res.json();
                // Ensure data is array
                if (Array.isArray(data)) {
                    setProtocols(data);
                }
            } catch (e) {
                console.error("Failed to fetch protocols", e);
            } finally {
                setLoading(false);
            }
        };

        fetchProtocols();
    }, []);

    return (
        <main className="min-h-screen bg-background-dark font-display text-slate-100 selection:bg-primary/30 flex flex-col relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark"></div>
            </div>

            <Navbar />

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        SYSTEM <span className="text-primary text-glow">PROTOCOLS</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                        The immutable rulesets governing algorithmic consensus. Each protocol defines the pacing, intervention logic, and quorum requirements for debates.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {protocols.map((protocol) => (
                            <GlassPanel key={protocol.id} className="p-8 border border-white/10 hover:border-primary/50 transition-all duration-300 group">
                                <div className="mb-6 flex justify-between items-start">
                                    <div className="p-3 bg-white/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                        <span className="material-icons text-3xl text-primary">
                                            {protocol.id === 'standard' ? 'gavel' : protocol.id === 'blitz' ? 'bolt' : 'psychology'}
                                        </span>
                                    </div>
                                    <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">{protocol.id.toUpperCase()}_V1.0</span>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{protocol.name}</h3>
                                <p className="text-slate-400 text-sm mb-8 h-12 leading-relaxed">{protocol.description}</p>

                                <div className="space-y-4 border-t border-white/5 pt-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Turn Duration</span>
                                        <span className="text-white font-mono">{protocol.rules.turnDuration}s</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Max Turns</span>
                                        <span className="text-white font-mono">{protocol.rules.maxTurns}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Consensus Threshold</span>
                                        <span className="text-white font-mono text-primary">{protocol.rules.consensusThreshold}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Intervention Style</span>
                                        <span className={`font-mono uppercase text-xs px-2 py-0.5 rounded ${protocol.rules.interventionStyle === 'aggressive' ? 'bg-red-500/20 text-red-400' :
                                                protocol.rules.interventionStyle === 'active' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-green-500/20 text-green-400'
                                            }`}>
                                            {protocol.rules.interventionStyle}
                                        </span>
                                    </div>
                                </div>
                            </GlassPanel>
                        ))}
                    </div>
                )}

                <div className="mt-20 text-center">
                    <Link href="/debate">
                        <button className="px-8 py-3 border border-slate-600 hover:border-primary text-slate-300 hover:text-primary transition-all rounded uppercase text-sm font-bold tracking-widest">
                            ← Return to Chamber
                        </button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
