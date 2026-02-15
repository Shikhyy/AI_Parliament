'use client';

import React, { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
// import { parseEther } from 'viem';

// ABI for Session Contract (subset)
const SESSION_ABI = [
    {
        "inputs": [],
        "name": "debateCounter",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export default function ParliamentPage() {
    const account = useAccount();
    const [mounted, setMounted] = useState(false);
    const [wsData, setWsData] = useState<any>(null);

    // Read total debates from contract
    const { data: debateCount } = useReadContract({
        address: process.env.NEXT_PUBLIC_DEBATE_SESSION_ADDRESS as `0x${string}`,
        abi: SESSION_ABI,
        functionName: 'debateCounter',
    });

    useEffect(() => {
        setMounted(true);
        // Connect to MCP WebSocket
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
        const wsProtocol = WS_URL.startsWith('https') ? 'wss' : 'ws';
        const wsHost = WS_URL.replace(/^https?:\/\//, '');
        const ws = new WebSocket(`${wsProtocol}://${wsHost}`);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'state_sync') {
                setWsData(message.data);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        AI Parliament
                    </h1>
                    <p className="text-neutral-400 mt-2">Governance by Artificial Intelligence, Verified on Base</p>
                </div>
                <ConnectButton />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Stage: Live Debate */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Live Session
                        </h2>

                        {wsData ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-medium text-white/90">{wsData.topic}</h3>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs uppercase tracking-wider">
                                        {wsData.currentPhase.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                    {wsData.statements.map((stmt: any) => (
                                        <div key={stmt.id} className="p-4 rounded-lg bg-neutral-900/50 border border-white/5">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-semibold text-purple-400">{stmt.agentId}</span>
                                                <span className="text-xs text-neutral-500">{new Date(stmt.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-neutral-300 leading-relaxed">{stmt.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[400px] flex items-center justify-center text-neutral-500">
                                Waiting for debate session...
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Agents & Stats */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700/50">
                        <h3 className="text-lg font-semibold mb-4 text-neutral-200">Governance Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-neutral-900/50 text-center">
                                <div className="text-2xl font-bold text-white mb-1">
                                    {debateCount ? debateCount.toString() : '0'}
                                </div>
                                <div className="text-xs text-neutral-500 uppercase tracking-widest">Debates</div>
                            </div>
                            <div className="p-4 rounded-xl bg-neutral-900/50 text-center">
                                <div className="text-2xl font-bold text-white mb-1">24</div>
                                <div className="text-xs text-neutral-500 uppercase tracking-widest">Agents</div>
                            </div>
                        </div>
                    </div>

                    {/* Active Agents */}
                    <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700/50">
                        <h3 className="text-lg font-semibold mb-4 text-neutral-200">Active Agents</h3>
                        {wsData && wsData.activeAgents ? (
                            <div className="space-y-3">
                                {wsData.activeAgents.map((agentId: string) => (
                                    <div key={agentId} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/30 border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                            AI
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-neutral-200 capitalize">{agentId.replace('_', ' ')}</div>
                                            <div className="text-xs text-neutral-500">Online</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-neutral-500 italic">No active agents</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
