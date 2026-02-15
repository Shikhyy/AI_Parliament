'use client';

import React from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useSocket } from '@/components/providers/SocketProvider';

export const IdeaBoard = () => {
    const { debateState } = useSocket();

    if (!debateState) return null;

    const { currentPhase, coalitions } = debateState;

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Phase Indicator */}
            <GlassPanel className="p-4 border-primary/20" hoverEffect={false}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-[10px] font-bold text-primary tracking-widest uppercase">Current Phase</h2>
                    <span className="text-[10px] font-mono text-white">{(debateState.consensusScore || 0).toFixed(0)}% CONSENSUS</span>
                </div>
                <div className="text-xl font-bold text-white uppercase tracking-wider">
                    {currentPhase?.replace('_', ' ') || 'INITIALIZING'}
                </div>
                <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div
                        className="bg-primary h-full transition-all duration-1000"
                        style={{ width: `${debateState.consensusScore || 5}%` }}
                    ></div>
                </div>
            </GlassPanel>

            {/* Coalitions */}
            <GlassPanel className="flex-1 flex flex-col border-primary/10 overflow-hidden p-0" hoverEffect={false}>
                <div className="p-3 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
                    <h2 className="text-[10px] font-bold text-primary tracking-widest uppercase">Coalition Nodes</h2>
                    <span className="material-icons text-xs text-primary animate-pulse">hub</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {coalitions && coalitions.length > 0 ? (
                        coalitions.map((coalition: any) => (
                            <div key={coalition.id} className="p-3 rounded bg-white/5 border border-white/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-white">{coalition.name || 'Unnamed Coalition'}</span>
                                    <span className="text-[10px] font-mono text-primary">{(coalition.strength * 100).toFixed(0)}% STR</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-2 italic">"{coalition.sharedPosition}"</p>
                                <div className="flex gap-1 flex-wrap">
                                    {coalition.agentIds.map((id: string) => (
                                        <span key={id} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{id}</span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-slate-600 font-mono">
                            [ NO COALITIONS FORMED ]
                        </div>
                    )}
                </div>
            </GlassPanel>
        </div>
    );
};
