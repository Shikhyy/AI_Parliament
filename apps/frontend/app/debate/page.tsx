'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DebateInfo {
    id: string;
    topic: string;
    phase: string;
    statements: number;
    activeAgents: number;
    ageMinutes: number;
    idleMinutes: number;
}

export default function DebateLobby() {
    const [debates, setDebates] = useState<DebateInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTopic, setNewTopic] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchDebates = async () => {
        try {
            const res = await fetch(`${API_URL}/debates`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setDebates(data);
            }
        } catch (error) {
            console.error('Failed to fetch debates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDebates();
        const interval = setInterval(fetchDebates, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleCreateDebate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopic.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch(`${API_URL}/debate/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: newTopic })
            });
            const data = await res.json();
            if (data.success && data.state?.debateId) {
                router.push(`/debate/${data.state.debateId}`);
            }
        } catch (error) {
            console.error('Failed to create debate:', error);
            setIsCreating(false);
        }
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-200 selection:bg-primary selection:text-white flex flex-col">
            <Navbar />

            <div className="flex flex-1">
                {/* Side Navigation (consistent with Archive/Governance) */}
                <aside className="w-20 hidden lg:flex flex-col items-center py-8 bg-background-dark border-r border-primary/20 z-10">
                    <div className="mb-12">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/40">
                            <span className="material-icons text-white">gavel</span>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
                                Active <span className="bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">Debates</span>
                            </h1>
                            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Multi-Agent Parliamentary Sessions</p>
                        </div>

                        {/* Create Debate Form */}
                        <form onSubmit={handleCreateDebate} className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Enter a debate topic..."
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                className="bg-background-dark/50 border border-primary/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary w-full md:w-80"
                            />
                            <button
                                type="submit"
                                disabled={isCreating || !newTopic.trim()}
                                className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {isCreating ? 'Starting...' : 'Start Session'}
                            </button>
                        </form>
                    </header>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading && debates.length === 0 ? (
                            <p className="text-slate-500">Loading sessions...</p>
                        ) : debates.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-slate-700 rounded-xl">
                                <span className="material-icons text-4xl text-slate-600 mb-4">forum</span>
                                <p className="text-slate-400">No active debates.</p>
                                <p className="text-sm text-slate-600">Start a new one to begin capability demonstration.</p>
                            </div>
                        ) : (
                            debates.map((debate) => (
                                <Link href={`/debate/${debate.id}`} key={debate.id}>
                                    <GlassPanel className="h-full p-6 flex flex-col hover:border-primary/50 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${debate.phase === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary-light'
                                                }`}>
                                                {debate.phase.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                {debate.ageMinutes}m ago
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {debate.topic}
                                        </h3>

                                        <div className="mt-auto pt-4 flex gap-4 text-sm text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <span className="material-icons text-base">person</span>
                                                {debate.activeAgents} Agents
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="material-icons text-base">chat_bubble_outline</span>
                                                {debate.statements} Turns
                                            </div>
                                        </div>
                                    </GlassPanel>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
