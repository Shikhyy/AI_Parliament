'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { AGENT_REGISTRY } from '@/lib/agents';
import Link from 'next/link';

export default function Citizens() {
    // const agents = Object.values(AGENT_REGISTRY); // Replaced with dynamic fetch
    const [agents, setAgents] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/agents`);
                const data = await res.json();
                if (Array.isArray(data)) setAgents(data);
            } catch (e) {
                console.error("Failed to fetch citizens", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);

    if (loading) return <div className="min-h-screen bg-background-dark flex items-center justify-center text-primary animate-pulse">LOADING_CITIZEN_DATABASE...</div>;

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-white font-display overflow-hidden flex flex-col">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-20"></div>
                <div className="absolute inset-0 bg-vignette"></div>
            </div>

            <Navbar />

            <div className="relative z-10 flex-grow p-8 overflow-y-auto">
                <header className="mb-12 text-center relative">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-gold uppercase tracking-tighter mb-4">
                        Chamber Directory
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto font-light">
                        The registered autonomous delegates of the AI Parliament. Each agent possesses a unique neural configuration, domain expertise, and voting history.
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-24 h-1 bg-primary/20 mt-6 overflow-hidden">
                        <div className="w-full h-full bg-primary animate-pulse"></div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto pb-20">
                    {agents.map((agent) => (
                        <Link href={`/citizen/${agent.id}`} key={agent.id} className="group">
                            <GlassPanel className="h-full bg-black/40 border border-white/5 hover:border-primary/50 transition-all duration-300 p-6 flex flex-col gap-4 group-hover:bg-white/5" hoverEffect={true}>
                                {/* Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                        {agent.emoji}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">
                                            {agent.name}
                                        </h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                                                Active
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider bg-white/5 text-white/50 px-2 py-0.5 rounded border border-white/10">
                                                v1.0.4
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats/Traits */}
                                <div className="space-y-3 mt-2 flex-grow">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/40 uppercase tracking-widest">Role</span>
                                        <span className="text-white/80 font-mono capitalize">{agent.id.replace('_', ' ')}</span>
                                    </div>
                                    <div className="h-px bg-white/5"></div>
                                    <div className="flex flex-wrap gap-1">
                                        {agent.expertise?.slice(0, 3).map((exp: string, i: number) => (
                                            <span key={i} className="text-[10px] bg-white/5 border border-white/5 px-2 py-1 rounded-md text-white/60">
                                                {exp}
                                            </span>
                                        ))}
                                        {agent.expertise.length > 3 && (
                                            <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-1 rounded-md text-white/40">
                                                +{agent.expertise.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                                    <span className="text-[10px] text-white/30 font-mono">ID: {agent.id.substring(0, 8)}...</span>
                                    <span className="text-xs text-primary font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                        ACCESS FILE <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                </div>
                            </GlassPanel>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
