'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useSocket } from '@/components/providers/SocketProvider';
import { TypingIndicators } from '@/components/debate/TypingIndicators';
import { NeuralVisualizer } from '@/components/debate/NeuralVisualizer';
import { QualityMeter } from '@/components/debate/QualityMeter';
import { CoalitionViewer } from '@/components/debate/CoalitionViewer';
import { StatementReactions } from '@/components/debate/StatementReactions';
import { PolicyViewer } from '@/components/stitch/PolicyViewer';
import { InterventionModal } from '@/components/stitch/InterventionModal';

// Types
interface AgentStatement {
    id: string;
    agentId: string;
    content: string;
    timestamp: number;
}

interface DebateState {
    debateId: string;
    topic: string;
    currentPhase: string;
    activeAgents: string[];
    statements: AgentStatement[];
    consensusScore: number;
    qualityMetrics?: any;
    coalitions: any[];
    synopsis?: string;
    conclusion?: string;
    badgeAwards?: Array<{
        agentId: string;
        badgeType: number;
        badgeName: string;
        reason: string;
        txHash?: string;
    }>;
}

interface DebateArenaProps {
    debateId?: string;
}

export function DebateArena({ debateId }: DebateArenaProps) {
    const { socket, isConnected, debateState: socketDebateState, typingAgents } = useSocket();
    const [localDebateState, setLocalDebateState] = useState<DebateState | null>(null);

    // Determine which state to use
    // If debateId is provided and matches socket state, use socket (realtime)
    // If debateId is provided and differs, use local fetched state (historical/static)
    // If debateId is missing, use socket (default behavior)
    const displayState = (debateId && debateId !== socketDebateState?.debateId)
        ? localDebateState
        : socketDebateState;

    const scrollRef = useRef<HTMLDivElement>(null);
    const { isConnected: isWalletConnected } = useAccount();

    const [showIntervention, setShowIntervention] = useState(false);
    const [showPolicyViewer, setShowPolicyViewer] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    // Fetch state if viewing a specific debate not active on socket
    useEffect(() => {
        if (debateId && debateId !== socketDebateState?.debateId) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            fetch(`${API_URL}/debate/${debateId}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setLocalDebateState(data);
                })
                .catch(err => console.error("Failed to fetch debate:", err));
        }
    }, [debateId, socketDebateState?.debateId]);

    // Auto-scroll to bottom of streams when new statements arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayState?.statements]);

    // Use displayState for rendering instead of debateState
    const debateState = displayState;

    const proponents = debateState?.statements.filter((_, i) => i % 2 === 0) || []; // Split for visual balance
    const opponents = debateState?.statements.filter((_, i) => i % 2 !== 0) || [];

    // Automated Intervention Triggers
    useEffect(() => {
        if (!debateState) return;

        // Trigger Intervention if consensus threshold is met
        if (debateState.consensusScore > 80 && !showIntervention && !showPolicyViewer) {
            // const timer = setTimeout(() => setShowIntervention(true), 3000);
            // return () => clearTimeout(timer);
        }
    }, [debateState, showIntervention, showPolicyViewer]);

    const handleEndDebate = () => {
        setShowPolicyViewer(true);
    };

    if (showPolicyViewer) {
        return <PolicyViewer
            topic={debateState?.topic || "Topic"}
            synopsis={debateState?.synopsis || "The debate concluded with a strong consensus on the need for immediate action. Agents agreed that while risks exist, the cost of inaction is higher."}
            conclusion={debateState?.conclusion || "Ratify the proposal with an amendment to include a 6-month review period."}
            consensusScore={debateState?.consensusScore}
            badgeAwards={debateState?.badgeAwards}
        />;
    }

    return (
        <div className="flex flex-col h-screen bg-background-dark text-slate-300 font-display overflow-hidden relative">
            {showIntervention && debateState && (
                <InterventionModal
                    debateId={debateState.debateId}
                    onAcknowledge={() => setShowIntervention(false)}
                />
            )}

            {showConfig && (
                <ConfigModal
                    onClose={() => setShowConfig(false)}
                    onTriggerIntervention={() => setShowIntervention(true)}
                    onTriggerEnd={() => setShowPolicyViewer(true)}
                />
            )}

            {/* Header */}
            <header className="relative z-20 border-b border-primary/20 bg-background-dark/95 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-widest text-primary text-glow uppercase">AI Parliament</h1>
                        <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-gray-500 uppercase">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            Live Session: {debateState ? debateState.debateId.substring(0, 4).toUpperCase() : 'OFFLINE'} // Status: {debateState?.currentPhase || 'Connecting...'}
                        </div>
                    </div>
                    <div className="hidden md:flex gap-6 border-l border-primary/10 pl-6 ml-2 items-center">
                        <a href="/" className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-primary cursor-pointer transition-colors">HOME</a>
                        <a href="/governance" className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-primary cursor-pointer transition-colors">VOTES</a>
                        <a href="/vault" className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-primary cursor-pointer transition-colors">VAULT</a>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleEndDebate}
                        className="flex items-center gap-2 px-4 py-1.5 border border-red-500/30 rounded bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all text-xs font-bold uppercase tracking-wide"
                    >
                        <span className="material-icons text-sm">stop_circle</span> End Session
                    </button>
                    <button
                        onClick={() => setShowConfig(true)}
                        className="flex items-center gap-2 px-4 py-1.5 border border-primary/30 rounded bg-primary/5 hover:bg-primary/10 text-primary transition-all text-xs font-bold uppercase tracking-wide"
                    >
                        <span className="material-icons text-sm">settings_input_component</span> Demo Config
                    </button>
                </div>
            </header>

            {/* Main Grid */}
            <main className="relative z-10 flex-1 grid grid-cols-12 grid-rows-[minmax(0,1fr)_auto] gap-4 p-4 lg:p-6 overflow-hidden">

                {/* Left Column: Proponent Feeds */}
                <section className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-1">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <span className="material-icons text-sm text-green-500">arrow_upward</span>
                            Statement Stream
                        </h2>
                        <span className="text-[10px] font-mono text-primary/50">CH_01</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {(debateState?.statements || []).map((stmt) => (
                            <div key={stmt.id} className="bg-surface-dark border-l-2 border-primary/40 p-3 rounded-r hover:bg-surface-dark/80 transition-colors group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white uppercase border border-primary/20">
                                        {stmt.agentId.substring(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white tracking-wide uppercase">{stmt.agentId}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{new Date(stmt.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                    <StatementReactions statementId={stmt.id} />
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-2 mt-1">
                                    {stmt.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Center Stage: Visualization */}
                <section className="col-span-12 lg:col-span-6 flex flex-col gap-4 h-full relative group">
                    <div className="flex-1 bg-black border border-primary/20 rounded-lg relative overflow-hidden shadow-inner shadow-black">
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] pointer-events-none"></div>

                        {/* Header Overlay */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/90 to-transparent">
                            <div>
                                <h3 className="text-lg font-bold text-primary tracking-widest uppercase">Coalition Network</h3>
                                <p className="text-[10px] text-gray-400 font-mono mt-1">TOPIC: {debateState?.topic || "AWAITING_INPUT"}</p>
                            </div>
                            {debateState && (
                                <div className="text-right">
                                    <span className="text-[10px] font-mono text-gray-500 uppercase">Turn Count</span>
                                    <p className="text-xl font-bold text-white">{debateState.statements.length}</p>
                                </div>
                            )}
                        </div>

                        {/* Neural Network Visualization */}
                        <div className="absolute inset-0">
                            <NeuralVisualizer activeAgents={debateState?.activeAgents || []} />

                            {/* Overlay Stats */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <div className="text-4xl font-bold text-primary animate-pulse">{debateState?.statements.length || 0}</div>
                                <div className="text-xs text-primary/50 uppercase tracking-widest">STATEMENTS</div>
                            </div>
                        </div>

                        {/* Consensus Meter & Quality */}
                        <div className="absolute bottom-4 left-4 right-4 flex gap-4 items-end">
                            <div className="flex-1 bg-surface-dark/80 backdrop-blur border border-primary/20 rounded-lg p-3 flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold uppercase text-white tracking-widest">Consensus Formation</span>
                                        <span className="text-[10px] text-primary animate-pulse">{debateState?.consensusScore || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-yellow-600 relative overflow-hidden transition-all"
                                            style={{ width: `${debateState?.consensusScore || 0}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {debateState?.qualityMetrics && (
                                <div className="w-1/3">
                                    <QualityMeter metrics={debateState.qualityMetrics} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Log & Coalitions */}
                    <div className="h-48 grid grid-cols-2 gap-4">
                        <div className="bg-black border border-primary/10 rounded-lg p-4 flex flex-col shadow-lg" ref={scrollRef}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-primary/70 uppercase tracking-widest border border-primary/20 px-2 py-0.5 rounded">System Synthesis Log</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 text-gray-400">
                                {(debateState?.statements || []).slice(-5).map((stmt, idx) => (
                                    <p key={idx}><span className="text-primary">[{new Date(stmt.timestamp).toLocaleTimeString()}]</span> {stmt.agentId}: {stmt.content.substring(0, 50)}...</p>
                                ))}
                                {typingAgents.length > 0 && <TypingIndicators agents={typingAgents} />}
                            </div>
                        </div>
                        {debateState && debateState.coalitions && debateState.coalitions.length > 0 ? (
                            <CoalitionViewer coalitions={debateState.coalitions} />
                        ) : (
                            <div className="bg-black/50 border border-primary/10 rounded-lg p-4 flex items-center justify-center text-xs text-gray-600 uppercase tracking-wider">
                                No Coalitions Formed
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Column: Opponent Feeds */}
                <section className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-1">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <span className="material-icons text-sm text-orange-400">arrow_downward</span>
                            Opponent Stream
                        </h2>
                        <span className="text-[10px] font-mono text-primary/50">CH_02</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pl-2 space-y-3 custom-scrollbar">
                        {opponents.map((stmt) => (
                            <div key={stmt.id} className="bg-surface-dark border-r-2 border-orange-400/40 p-3 rounded-l hover:bg-surface-dark/80 transition-colors group">
                                <div className="flex flex-row-reverse items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white uppercase border border-orange-400/20">
                                        {stmt.agentId.substring(0, 2)}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-white tracking-wide uppercase">{stmt.agentId}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{new Date(stmt.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-2 mt-1 text-right">
                                    {stmt.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="relative z-20 bg-background-dark border-t border-primary/20 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase">Live Connectivity</span>
                        <span className="text-primary font-mono text-xs">WEBSOCKET_SECURE</span>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto justify-end">
                    <button className="bg-transparent border border-gray-600 text-gray-400 px-4 py-2 rounded text-xs uppercase tracking-wider hover:border-gray-400 hover:text-white transition-all">
                        Download Log
                    </button>
                    <CastVoteButton />
                </div>
            </footer>

        </div>
    );
}

function ConfigModal({ onClose, onTriggerIntervention, onTriggerEnd }: { onClose: () => void, onTriggerIntervention: () => void, onTriggerEnd: () => void }) {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleStartDebate = async () => {
        if (!topic) return;
        setIsLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${API_URL}/debate/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });
            setIsLoading(false);
            onClose();
        } catch (error) {
            console.error('Failed to start debate', error);
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Should we implement Universal Basic Compute?",
        "Is privacy a relic of the pre-AI era?",
        "Should algorithmic governance be mandatory for resource allocation?",
        "The Ethics of Mars Colonization: Priority or Distraction?"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-background-dark border border-primary/30 rounded-xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(249,195,31,0.2)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary uppercase tracking-widest">Demo Control Station</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Topic Start */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-white tracking-widest">Start New Debate</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter a controversial topic..."
                            className="w-full bg-black/50 border border-primary/30 rounded p-3 text-white text-sm focus:border-primary focus:outline-none transition-all placeholder:text-gray-700 font-mono"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTopic(s)}
                                    className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2 py-1 rounded transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleStartDebate}
                            disabled={!topic || isLoading}
                            className="w-full mt-2 bg-primary hover:bg-yellow-400 text-black font-bold uppercase tracking-widest py-3 rounded text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <span className="material-icons text-sm">play_arrow</span>
                            {isLoading ? 'Initializing...' : 'Initialize Debate Sequence'}
                        </button>
                    </div>

                    <div className="h-px bg-primary/10"></div>

                    {/* Manual Triggers */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-white tracking-widest">Event Triggers</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => { onTriggerIntervention(); onClose(); }}
                                className="border border-red-500/50 hover:bg-red-900/20 text-red-400 font-bold uppercase tracking-widest py-3 rounded text-xs transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-icons text-sm">warning</span>
                                Force Intervention
                            </button>
                            <button
                                onClick={() => { onTriggerEnd(); onClose(); }}
                                className="border border-green-500/50 hover:bg-green-900/20 text-green-400 font-bold uppercase tracking-widest py-3 rounded text-xs transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-icons text-sm">flag</span>
                                Force Conclusion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CastVoteButton() {
    const { writeContract, isPending, isSuccess } = useWriteContract();
    const { isConnected } = useAccount();

    const handleVote = () => {
        if (!isConnected) return;
        writeContract({
            address: process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS as `0x${string}`,
            abi: [{
                "inputs": [
                    { "internalType": "uint256", "name": "proposalId", "type": "uint256" },
                    { "internalType": "bool", "name": "support", "type": "bool" }
                ],
                "name": "vote",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }],
            functionName: 'vote',
            args: [BigInt(1), true], // Voting "Yes" on Proposal 1 for demo
        });
    };

    return (
        <button
            onClick={handleVote}
            disabled={!isConnected || isPending}
            className={`bg-primary text-black font-bold px-6 py-2 rounded text-xs uppercase tracking-wider hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(242,185,13,0.5)] transition-all flex items-center gap-2 ${(!isConnected || isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className="material-icons text-sm">gavel</span>
            {isPending ? 'Signing...' : isSuccess ? 'Voted!' : 'Cast Vote (Pro)'}
        </button>
    );
}
