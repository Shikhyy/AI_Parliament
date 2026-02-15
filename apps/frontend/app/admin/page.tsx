'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Navbar } from '@/components/layout/Navbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { AGENT_REGISTRY } from '@/lib/agents';
import { PARLIAMENT_TOKEN_ABI } from '@/lib/contracts';

// Default Admin Address
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS;

export default function AdminDashboard() {
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [customAddress, setCustomAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('1000');
    const [status, setStatus] = useState<string>('');
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (isConnected && address && ADMIN_ADDRESS && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    }, [address, isConnected]);

    const handleFundAgent = () => {
        if (!selectedAgent) return;
        const agent = AGENT_REGISTRY[selectedAgent];
        setCustomAddress(agent.walletAddress);
        setStatus(`Selected ${agent.name}. Click 'Execute Transfer' to fund.`);
    };

    const handleTransfer = async () => {
        if (!customAddress || !amount) return;

        try {
            writeContract({
                address: process.env.NEXT_PUBLIC_PARLIAMENT_TOKEN_ADDRESS as `0x${string}`,
                abi: PARLIAMENT_TOKEN_ABI,
                functionName: 'transfer',
                args: [customAddress as `0x${string}`, parseEther(amount)],
            });
            setStatus('Transaction submitted...');
        } catch (e) {
            console.error(e);
            setStatus('Error: ' + (e as Error).message);
        }
    };

    if (!isAuthorized) {
        return (
            <main className="min-h-screen bg-background-dark font-display text-slate-100 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <GlassPanel className="max-w-md w-full p-8 text-center border-red-500/30">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-icons text-red-500 text-3xl">lock</span>
                        </div>
                        <h1 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-widest">Access Denied</h1>
                        <p className="text-slate-400 mb-6">This terminal is restricted to the Deployer Address.</p>
                        <div className="text-xs font-mono bg-black/40 p-3 rounded border border-red-500/10 text-red-400">
                            ERR_UNAUTHORIZED_ENTITY
                        </div>
                    </GlassPanel>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background-dark font-display text-slate-100 selection:bg-primary/30 flex flex-col">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-12 w-full">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
                            <span className="material-icons text-primary">admin_panel_settings</span>
                            Central Bank Control
                        </h1>
                        <p className="text-slate-400 font-mono text-sm">Deployer Access Granted • {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Network Online</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Actions */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Agent Funding Card */}
                        <GlassPanel className="p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <span className="material-icons text-9xl">smart_toy</span>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                                <span className="material-icons text-primary">download</span>
                                Fund Agent Operations
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-primary/70 mb-2 font-bold">Select Operative</label>
                                    <select
                                        value={selectedAgent}
                                        onChange={(e) => setSelectedAgent(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none transition-colors"
                                    >
                                        <option value="">-- Choose Agent --</option>
                                        {Object.values(AGENT_REGISTRY).map(agent => (
                                            <option key={agent.id} value={agent.id}>
                                                {agent.emoji} {agent.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleFundAgent}
                                        disabled={!selectedAgent}
                                        className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="material-icons text-sm">content_paste</span>
                                        Pre-fill Wallet
                                    </button>
                                </div>
                            </div>
                        </GlassPanel>

                        {/* Direct Transfer Card */}
                        <GlassPanel className="p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <span className="material-icons text-9xl">payments</span>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                                <span className="material-icons text-emerald-400">send</span>
                                Execute Transaction
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">Recipient Address</label>
                                        <input
                                            type="text"
                                            value={customAddress}
                                            onChange={(e) => setCustomAddress(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-emerald-400 outline-none font-mono text-emerald-400"
                                            placeholder="0x..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">Amount (PARL)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-emerald-400 outline-none font-mono"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">PARL</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleTransfer}
                                    disabled={isPending || isConfirming || !customAddress}
                                    className="w-full py-4 bg-gradient-to-r from-primary to-accent-gold text-black font-black uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(236,164,19,0.3)] hover:shadow-[0_0_30px_rgba(236,164,19,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                                >
                                    {isPending ? 'Signing Transaction...' : isConfirming ? 'Confirming On-Chain...' : 'Authorize Transfer'}
                                </button>
                            </div>
                        </GlassPanel>
                    </div>

                    {/* Right Column: Logs & Status */}
                    <div className="lg:col-span-4 space-y-8">
                        <GlassPanel className="p-6 h-full flex flex-col bg-black/40">
                            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold flex items-center gap-2">
                                <span className="material-icons text-sm">terminal</span>
                                System Logs
                            </h3>
                            <div className="flex-1 font-mono text-xs space-y-2 overflow-y-auto custom-scrollbar text-slate-300">
                                <p className="text-slate-500 border-b border-white/5 pb-2 mb-2">// Ready for inputs...</p>
                                {status && (
                                    <div className="p-2 bg-white/5 rounded border-l-2 border-primary">
                                        <span className="text-primary mr-2">&gt;</span>
                                        {status}
                                    </div>
                                )}
                                {hash && (
                                    <div className="p-2 bg-white/5 rounded border-l-2 border-yellow-500 break-all">
                                        <span className="text-yellow-500 mr-2">&gt;</span>
                                        TX: <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{hash}</a>
                                    </div>
                                )}
                                {isSuccess && (
                                    <div className="p-2 bg-emerald-500/10 rounded border-l-2 border-emerald-500 text-emerald-400">
                                        <span className="mr-2">✓</span>
                                        Confirmation Received.
                                    </div>
                                )}
                                {error && (
                                    <div className="p-2 bg-red-500/10 rounded border-l-2 border-red-500 text-red-400">
                                        <span className="mr-2">!</span>
                                        {error.message}
                                    </div>
                                )}
                            </div>
                        </GlassPanel>
                    </div>
                </div>
            </div>
        </main>
    );
}
