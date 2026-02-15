'use client';

import { Navbar } from '@/components/layout/Navbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { LiveStream } from '@/components/stitch/LiveStream';
import { IdeaBoard } from '@/components/stitch/IdeaBoard';
import { useSocket } from '@/components/providers/SocketProvider';

import { CastVoteButton } from '@/components/stitch/CastVoteButton';

import { useState } from 'react';

export default function Chamber() {
    const { isConnected, debateState } = useSocket();
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleTransmit = async () => {
        if (!inputValue.trim()) return;
        setIsSending(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${API_URL}/debate/statement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: "USER_PARTICIPANT", // Temporary ID
                    content: inputValue
                })
            });
            setInputValue("");
        } catch (err) {
            console.error("Failed to transmit:", err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-200 font-display flex flex-col">
            <Navbar />

            <div className="flex-1 flex overflow-hidden p-4 gap-4 relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(37,192,244,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

                {/* Left Sidebar: Active Representatives */}
                <aside className="w-72 flex flex-col gap-4 z-10">
                    <GlassPanel className="rounded flex flex-col h-full border-primary/10 p-0" hoverEffect={false}>
                        <div className="p-4 border-b border-primary/20 bg-primary/5">
                            <h2 className="text-xs font-bold text-primary tracking-widest uppercase">Active Representatives</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                            {/* Connection Status */}
                            <div className={`p-2 rounded text-xs font-mono text-center border ${isConnected ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                                {isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
                            </div>

                            {/* Active Agents List */}
                            {debateState?.activeAgents?.map((agentId: string) => (
                                <div key={agentId} className="relative group cursor-pointer p-2 rounded bg-primary/10 shadow-[0_0_15px_rgba(37,192,244,0.4)] border border-primary">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-14 h-14 bg-primary/5 border border-primary/30 overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-background-dark font-mono text-[8px] px-0.5 text-center truncate">{agentId}</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-[10px] font-bold text-white truncate uppercase">AGENT</h3>
                                                <span className="text-[8px] font-mono text-primary animate-pulse">ONLINE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!debateState?.activeAgents || debateState.activeAgents.length === 0) && (
                                <div className="text-center text-xs text-slate-500 mt-10">Waiting for agents...</div>
                            )}
                        </div>
                    </GlassPanel>
                </aside>

                {/* Main Debate Feed */}
                <section className="flex-1 flex flex-col gap-4 z-10">
                    <GlassPanel className="flex-1 flex flex-col relative overflow-hidden p-0" hoverEffect={false}>
                        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background-dark to-transparent z-10 pointer-events-none"></div>

                        {/* Live Stream Component */}
                        <LiveStream />

                        {/* Input Area */}
                        <div className="p-4 border-t border-primary/20 bg-background-dark/50">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTransmit()}
                                        className="w-full bg-primary/5 border border-primary/30 rounded px-4 py-3 text-sm font-mono text-primary placeholder-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                        placeholder="QUERY_AGENT_RESPONSE..."
                                        type="text"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                        <span className="material-icons text-primary/40 cursor-pointer hover:text-primary">mic</span>
                                        <span className="material-icons text-primary/40 cursor-pointer hover:text-primary">attach_file</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleTransmit}
                                    disabled={isSending || !inputValue.trim()}
                                    className={`bg-primary text-background-dark px-6 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-white transition-all flex items-center gap-2 ${isSending ? 'opacity-50' : ''}`}
                                >
                                    {isSending ? 'TRANSMITTING...' : 'TRANSMIT'}
                                    <span className="material-icons text-sm">send</span>
                                </button>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Activity Footer */}
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-primary/10">
                        <div className="text-[10px] text-gray-500 font-mono">
                            LAST BLOCK: <span className="text-primary">#SEPOLIA_8293</span>
                        </div>
                        <CastVoteButton />
                    </div>
                </section>

                {/* Right Sidebar: Consensus & Analytics */}
                <aside className="w-80 flex flex-col gap-4 z-10">
                    <IdeaBoard />
                </aside>
            </div>
        </main>
    );
}
