'use client';

import { useDebateSocket } from '@/hooks/useDebateSocket';
import { motion, AnimatePresence } from 'framer-motion';

export function DebateOverlay() {
    const { debateState, lastTurn } = useDebateSocket();

    if (!debateState) return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 text-white p-6 rounded-xl border border-white/20 backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-2">Connecting to Parliament...</h2>
                <p className="opacity-70">Waiting for MCP Server...</p>
            </div>
        </div>
    );

    return (
        <div className="absolute inset-0 pointer-events-none p-8 flex justify-between">
            {/* LEFT PANEL: INFO */}
            <div className="flex flex-col gap-4 max-w-sm pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-white">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {debateState.topic}
                    </h1>
                    <div className="mt-4 flex gap-4 text-sm opacity-80">
                        <div>Phase: <span className="text-white font-mono uppercase">{debateState.currentPhase}</span></div>
                        <div>Agents: <span className="text-white font-mono">{debateState.activeAgents.length}</span></div>
                    </div>
                </div>

                {/* COALITION HUD PLACEHOLDER */}
                <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 h-48 flex items-center justify-center text-white/50 text-sm">
                    Coalition Graph Visualization
                </div>
            </div>

            {/* RIGHT PANEL: TRANSCRIPT */}
            <div className="flex flex-col gap-2 max-w-md w-full pointer-events-auto overflow-hidden">
                <div className="bg-black/80 p-3 rounded-t-xl text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10">
                    Live Transcript
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-3 mask-image-linear-to-t pb-4">
                    <AnimatePresence mode='popLayout'>
                        {(debateState.statements || []).slice(-5).reverse().map((turn) => (
                            <motion.div
                                key={turn.id}
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                layout
                                className="bg-zinc-900/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg"
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-blue-400 text-sm">{turn.agentId}</span>
                                    <span className="text-[10px] text-zinc-500">{new Date(turn.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-zinc-200 text-sm leading-relaxed">
                                    {turn.content}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
