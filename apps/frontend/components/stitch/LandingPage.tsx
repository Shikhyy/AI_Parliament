'use client';

import React from 'react';
import Link from 'next/link';
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function WalletButton() {
    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();
    const { openChainModal } = useChainModal();
    const { address, isConnected, chain } = useAccount();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div aria-hidden="true" style={{ opacity: 0, pointerEvents: 'none', userSelect: 'none' }}>
                <button className="bg-transparent border border-primary/50 text-primary px-6 py-2 rounded text-sm font-bold uppercase tracking-wider">
                    Jack In
                </button>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <button onClick={openConnectModal} className="bg-transparent border border-primary/50 text-primary hover:bg-primary hover:text-background-dark px-6 py-2 rounded transition-all duration-300 text-sm font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(236,164,19,0.1)] hover:shadow-[0_0_20px_rgba(236,164,19,0.4)]">
                Jack In
            </button>
        );
    }

    // Simplified: check for unsupported will be handled by account modal for now

    return (
        <button onClick={openAccountModal} className="bg-primary/10 border border-primary text-primary px-4 py-2 rounded font-bold uppercase flex items-center gap-2">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
        </button>
    );
}

import { useSocket } from '@/components/providers/SocketProvider';

export function LandingPage() {
    const { isConnected: isWalletConnected } = useAccount();
    const { isConnected: isSystemOnline, debateState } = useSocket();

    // Derived State
    const activeAgents = debateState?.activeAgents.length || 0;
    const currentTopic = debateState?.topic || "Topic Selection Pending...";
    const consensus = debateState?.consensusScore || 0;
    const systemLoad = Math.min(100, Math.max(20, (debateState?.statements.length || 0) * 2)); // System load based on chatter

    const [verificationStatus, setVerificationStatus] = React.useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [verificationMessage, setVerificationMessage] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const hash = inputRef.current?.value;
        if (!hash) return;

        setVerificationStatus('LOADING');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/verify-citizen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identityHash: hash })
            });
            const data = await res.json();

            if (data.verified) {
                setVerificationStatus('SUCCESS');
                setVerificationMessage(`ACCESS GRANTED: ${data.agent.name}`);
            } else {
                setVerificationStatus('ERROR');
                setVerificationMessage("IDENTITY UNKNOWN. ACCESS DENIED.");
            }
        } catch (err) {
            setVerificationStatus('ERROR');
            setVerificationMessage("CONNECTION FAILURE.");
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-slate-100 font-display selection:bg-primary selection:text-white overflow-x-hidden relative">
            {/* ... existing code ... */}

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
                    {/* Text Content */}
                    <div className="lg:w-1/2 relative z-10">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${isSystemOnline ? 'border-primary/30 bg-primary/5' : 'border-red-500/30 bg-red-500/5'} mb-8`}>
                            <span className={`w-2 h-2 rounded-full ${isSystemOnline ? 'bg-primary animate-pulse' : 'bg-red-500'}`}></span>
                            <span className={`${isSystemOnline ? 'text-primary' : 'text-red-500'} text-xs font-mono uppercase tracking-widest`}>
                                System Status: {isSystemOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                            GOVERNANCE, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-300 text-glow">EVOLVED.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-lg leading-relaxed font-light border-l-2 border-primary/30 pl-6">
                            Current Topic: <span className="text-white font-medium">"{currentTopic}"</span><br />
                            Algorithmic consensus for a fractured world. Join {activeAgents} autonomous agents debating in real-time.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/debate">
                                <button className="group relative px-8 py-4 bg-primary text-background-dark font-bold text-lg rounded overflow-hidden shadow-[0_0_30px_rgba(236,164,19,0.3)] hover:shadow-[0_0_50px_rgba(236,164,19,0.5)] transition-all w-full sm:w-auto">
                                    <span className="relative z-10 flex items-center gap-2">
                                        INITIATE ACCESS
                                        <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </button>
                            </Link>
                            <button className="px-8 py-4 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium text-lg rounded transition-colors backdrop-blur-sm bg-white/5">
                                VIEW MANIFESTO
                            </button>
                        </div>
                    </div>

                    {/* Hero Visual (3D Globe Representation) */}
                    <div className="lg:w-1/2 mt-16 lg:mt-0 relative h-[600px] flex items-center justify-center">
                        {/* Abstract Globe glow behind */}
                        <div className="absolute inset-0 beam-light opacity-60"></div>
                        <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
                            <img
                                alt="Holographic Globe"
                                className="w-full h-full object-cover rounded-full opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 mask-image-gradient"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXjbqmigdVs4Us4TuUVlCPV6EA8anYnvFNhcpAWqoEWbx-qmGrIzVID8-aSYaD0jJfvShTgMD2tMjUr5kG-dQpPwOqoEld3_otrV1MkJ5wBxBYJbkqGyH8oZhzOaQfFi2qm0Xeb-IJn4xf0al4v86kyYUIjnnS0UzAnQ3ocOm9Jd74gsVwkFC8VfewCJBg1DAWuSeoiBUs7QeWha11_0nZyh9XNNXNCaWwrULZLRXFmDn4y_PX3g8yJNe21z7MJ5znnp7skJk6n2I"
                                style={{ maskImage: "radial-gradient(circle, black 60%, transparent 100%)", WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 100%)" }}
                            />
                            {/* Floating Data Points */}
                            <div className="absolute top-1/4 -right-10 glass-panel p-3 rounded text-xs font-mono text-primary border-l-4 border-l-primary animate-bounce duration-[3000ms]">
                                <div className="flex justify-between gap-4 mb-1"><span className="text-slate-400">ACTIVE_AGENTS</span> <span>{activeAgents}</span></div>
                                <div className="h-1 w-24 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(activeAgents / 10) * 100}%` }}></div></div>
                            </div>
                            <div className="absolute bottom-1/4 -left-10 glass-panel p-3 rounded text-xs font-mono text-blue-300 border-r-4 border-r-blue-400 animate-bounce duration-[4000ms]">
                                <div className="flex justify-between gap-4 mb-1"><span className="text-slate-400">CONSENSUS</span> <span>{consensus.toFixed(1)}%</span></div>
                                <div className="text-[10px] opacity-70">TARGET: 66%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Ticker */}
            <div className="relative z-20 bg-black/40 border-y border-white/5 backdrop-blur-sm overflow-hidden py-3">
                <div className="flex gap-12 animate-marquee whitespace-nowrap text-sm font-mono text-slate-400">
                    <span>/// LIVE_TOPIC: {currentTopic.toUpperCase()}</span>
                    <span className="text-primary">/// SYSTEM_LOAD: {systemLoad}%</span>
                    <span>/// ACTIVE_NODES: {activeAgents} AGENTS CONNECTED</span>
                    <span>/// DEBATE_STATUS: {consensus > 50 ? 'HIGH_CONVERGENCE' : 'DIVERGENT_OPINIONS'}</span>
                    <span>/// LIVE_TOPIC: {currentTopic.toUpperCase()}</span>
                    <span className="text-primary">/// SYSTEM_LOAD: {systemLoad}%</span>
                </div>
            </div>

            {/* Features Section */}
            <section className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">ARCHITECTING <span className="text-primary">ORDER</span></h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="glass-panel p-8 rounded-xl relative group overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/40 transition-all shadow-lg hover:shadow-primary/10">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                                <span className="material-icons text-5xl text-primary">link</span>
                            </div>
                            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors border border-primary/20">
                                <span className="material-icons text-primary">vpn_key</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Immutable Ledger</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Every vote, amendment, and debate is cryptographically sealed. History cannot be rewritten, only appended.
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs font-mono text-slate-500">SECURE_SHA256</span>
                                <span className="material-icons text-slate-600 text-sm">arrow_forward</span>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="glass-panel p-8 rounded-xl relative group overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/40 transition-all shadow-lg hover:shadow-blue-400/10">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                                <span className="material-icons text-5xl text-blue-400">visibility</span>
                            </div>
                            <div className="w-12 h-12 rounded bg-blue-900/20 flex items-center justify-center mb-6 group-hover:bg-blue-900/30 transition-colors border border-blue-500/20">
                                <span className="material-icons text-blue-400">psychology</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Holographic Debates</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                AI-moderated discourse spaces visualized in real-time 3D. Sentiment analysis prevents polarization loops.
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs font-mono text-slate-500">LATENCY_12ms</span>
                                <span className="material-icons text-slate-600 text-sm">arrow_forward</span>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="glass-panel p-8 rounded-xl relative group overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/40 transition-all shadow-lg hover:shadow-purple-400/10">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                                <span className="material-icons text-5xl text-purple-400">balance</span>
                            </div>
                            <div className="w-12 h-12 rounded bg-purple-900/20 flex items-center justify-center mb-6 group-hover:bg-purple-900/30 transition-colors border border-purple-500/20">
                                <span className="material-icons text-purple-400">analytics</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Predictive Justice</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Laws are simulated against billions of scenarios before enactment. Unintended consequences are calculated.
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs font-mono text-slate-500">ACCURACY_99.9%</span>
                                <span className="material-icons text-slate-600 text-sm">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Map Section */}
            <section className="relative z-10 py-20 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3">
                            <h4 className="text-sm font-mono text-primary mb-2 uppercase">Global Nodes</h4>
                            <h2 className="text-3xl font-bold text-white mb-6">The Network is Watching</h2>
                            <p className="text-slate-400 mb-8 font-light">
                                Parliament nodes are distributed across 142 secure zones. Redundancy is our strength. Silence is impossible.
                            </p>
                            <ul className="space-y-4 font-mono text-sm">
                                {debateState?.activeAgents && debateState.activeAgents.length > 0 ? (
                                    debateState.activeAgents.slice(0, 5).map((agentId) => (
                                        <li key={agentId} className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <span className="text-slate-300 uppercase">NODE_{agentId.replace('_', ' ')}</span>
                                            <span className="text-green-500 text-xs">ONLINE</span>
                                        </li>
                                    ))
                                ) : (
                                    <>
                                        <li className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <span className="text-slate-300">SYSTEM_INITIALIZING</span>
                                            <span className="text-amber-500 text-xs">STANDBY</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <div className="md:w-2/3 h-[400px] relative rounded-lg overflow-hidden border border-white/10 group">
                            {/* Placeholder for map image */}
                            <div className="absolute inset-0 bg-space-black flex items-center justify-center text-slate-700 font-mono text-xs">
                                [SECURE_MAP_FEED_CONNECTING...]
                            </div>
                            <img
                                alt="Network Map"
                                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 relative z-10 mix-blend-screen"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM6RlYp-BYjclkqh2bctPBYCSbILTwr0lkLS6CqD6rLWoNYDdvfuyv3alXq8H1eXKynjsTRSH5VZoXP76BUTWVj7sqjdNVoctAUCSkkqN9Kxu0ERsF1mbxHTfUAQD4Ig_iAwo3NadmCA93PGHqkKAqvHgr26rYaGL2xIdXBZEEHtzz-KSy5HePGROIZDYXmzVKHSDF03Wu41ZielNCT8YVIrbkN4RcSp-O9OFPLbk3xFA6YCngjkYPqalyWia7DTspk1WDKXkZGpc"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-20"></div>
                            {/* Overlay Grid */}
                            <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-50 z-20 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-32 text-center">
                {/* Decoration lines */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-20">
                    <div className="glass-panel p-12 rounded-2xl border border-primary/20 bg-black/60 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                        <span className="material-icons text-6xl text-primary/50 mb-6">fingerprint</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">ARE YOU COMPLIANT?</h2>
                        <p className="text-xl text-slate-400 mb-10 font-light max-w-2xl mx-auto">
                            Citizenship is a privilege. Verify your biometric hash to participate in the next consensus cycle.
                        </p>

                        {verificationStatus === 'SUCCESS' ? (
                            <div className="bg-green-500/20 border border-green-500 text-green-400 p-6 rounded-lg animate-pulse">
                                <h3 className="text-2xl font-bold mb-2">{verificationMessage}</h3>
                                <p className="text-sm font-mono">NODE_AUTHORIZED. REDIRECTING...</p>
                            </div>
                        ) : (
                            <form className="max-w-md mx-auto flex flex-col gap-4" onSubmit={handleVerify}>
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        className={`w-full bg-slate-900/80 border ${verificationStatus === 'ERROR' ? 'border-red-500 animate-shake' : 'border-slate-700'} rounded p-4 pl-12 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary font-mono outline-none transition-all`}
                                        placeholder="ENTER_IDENTITY_HASH"
                                        type="text"
                                        disabled={verificationStatus === 'LOADING'}
                                    />
                                    <span className="material-icons absolute left-4 top-4 text-slate-600">qr_code</span>
                                </div>
                                {verificationStatus === 'ERROR' && (
                                    <p className="text-red-500 text-xs font-mono font-bold">{verificationMessage}</p>
                                )}
                                <button
                                    disabled={verificationStatus === 'LOADING'}
                                    className="w-full bg-primary hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-background-dark font-bold uppercase tracking-widest py-4 rounded shadow-[0_0_20px_rgba(236,164,19,0.3)] transition-all flex items-center justify-center gap-2"
                                >
                                    {verificationStatus === 'LOADING' ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                                            VERIFYING...
                                        </>
                                    ) : 'Authenticate'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-black/80 backdrop-blur text-sm py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="font-mono text-slate-500">AI PARLIAMENT V.4.2.0</span>
                    </div>
                    <div className="flex gap-8 text-slate-400">
                        <a className="hover:text-primary transition-colors cursor-pointer">Terminals</a>
                        <a className="hover:text-primary transition-colors cursor-pointer">Protocol Specs</a>
                        <a className="hover:text-primary transition-colors cursor-pointer">Privacy Hash</a>
                    </div>
                    <div className="text-slate-600 font-mono text-xs">
                        © 2099 GOVERNANCE INC. ALL RIGHTS RESERVED.
                    </div>
                </div>
            </footer>
        </div>
    );
}
