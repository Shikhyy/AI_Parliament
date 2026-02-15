'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';

interface DebateSummary {
    id: string;
    topic: string;
    phase: string;
    activeAgents: number;
    statements: number;
    ageMinutes: number;
}

interface Protocol {
    id: string;
    name: string;
    description: string;
    rules: any;
}

export function DebateLobby({ onJoin }: { onJoin: (debateId: string) => void }) {
    const [debates, setDebates] = useState<DebateSummary[]>([]);
    const [protocols, setProtocols] = useState<Record<string, Protocol>>({});
    const [selectedProtocol, setSelectedProtocol] = useState<string>('standard');
    const [newTopic, setNewTopic] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { socket } = useSocket();

    useEffect(() => {
        fetchDebates();
        fetchProtocols();
        const interval = setInterval(fetchDebates, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchDebates = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/debates`);
            const data = await res.json();
            setDebates(data);
        } catch (err) {
            console.error("Failed to fetch debates", err);
        }
    };

    const fetchProtocols = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/protocols`);
            const data = await res.json();
            setProtocols(data);
        } catch (err) {
            console.error("Failed to fetch protocols", err);
        }
    };

    const handleCreate = async () => {
        if (!newTopic) return;
        setIsCreating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/debate/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: newTopic, protocolId: selectedProtocol })
            });
            const data = await res.json();
            if (data.success) {
                setNewTopic('');
                fetchDebates();
                onJoin(data.state.debateId);
            }
        } catch (err) {
            console.error("Failed to create debate", err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-dark text-slate-300 font-display p-6 overflow-y-auto">
            <h1 className="text-3xl font-bold tracking-widest text-primary text-glow uppercase mb-8">Debate Lobby</h1>

            {/* Create New Debate */}
            <div className="bg-black/40 border border-primary/20 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">Initialize New Session</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Enter Debate Topic..."
                            className="w-full bg-black/60 border border-primary/30 rounded p-3 text-white focus:border-primary focus:outline-none placeholder:text-gray-600"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={!newTopic || isCreating}
                            className="w-full bg-primary text-black font-bold uppercase tracking-widest py-3 rounded hover:bg-yellow-400 disabled:opacity-50 transition-all"
                        >
                            {isCreating ? 'Initializing...' : 'Start Session'}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Select Protocol</label>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.values(protocols).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProtocol(p.id)}
                                    className={`text-left p-3 rounded border transition-all ${selectedProtocol === p.id ? 'bg-primary/20 border-primary text-white' : 'bg-black/20 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold uppercase text-xs tracking-wider">{p.name}</span>
                                        {selectedProtocol === p.id && <span className="material-icons text-xs text-primary">check_circle</span>}
                                    </div>
                                    <p className="text-[10px] opacity-80">{p.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Debates List */}
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Active Sessions ({debates.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {debates.map(debate => (
                    <div key={debate.id} className="bg-surface-dark border border-white/10 rounded-lg p-5 hover:border-primary/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all"></div>
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-mono text-gray-500 uppercase">ID: {debate.id.substring(0, 6)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${debate.phase === 'completed' ? 'bg-green-900/40 text-green-400' : 'bg-primary/10 text-primary'}`}>
                                {debate.phase}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">{debate.topic}</h3>

                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 mb-4 font-mono">
                            <div>
                                <span className="block text-[10px] text-gray-600 uppercase">Agents</span>
                                {debate.activeAgents} Active
                            </div>
                            <div>
                                <span className="block text-[10px] text-gray-600 uppercase">Turns</span>
                                {debate.statements}
                            </div>
                        </div>

                        <button
                            onClick={() => onJoin(debate.id)}
                            className="w-full border border-white/20 hover:bg-white/5 text-white py-2 rounded text-xs uppercase tracking-widest transition-colors font-bold"
                        >
                            Connect
                        </button>
                    </div>
                ))}
            </div>

            {debates.length === 0 && (
                <div className="text-center py-20 text-gray-600 uppercase tracking-widest text-sm border-2 border-dashed border-gray-800 rounded-xl">
                    No Active Sessions. Initialize one above.
                </div>
            )}
        </div>
    );
}
