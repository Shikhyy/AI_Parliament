'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS;

export function Navbar() {
    return (
        <nav className="relative z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(236,164,19,0.5)]">
                            <span className="material-icons text-background-dark text-lg">gavel</span>
                        </div>
                        <span className="text-xl font-bold tracking-widest uppercase text-white">AI Parliament</span>
                    </Link>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link href="/archive" className="text-slate-300 hover:text-primary transition-colors px-3 py-2 text-sm font-medium tracking-wide">ARCHIVE</Link>
                            <Link href="/ledger" className="text-slate-300 hover:text-primary transition-colors px-3 py-2 text-sm font-medium tracking-wide">LEDGER</Link>
                            <Link href="/citizens" className="text-slate-300 hover:text-primary transition-colors px-3 py-2 text-sm font-medium tracking-wide">CITIZENS</Link>

                            {/* Archestra Status */}
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-bold">Archestra Active</span>
                            </div>

                            <ConnectButton.Custom>
                                {({
                                    account,
                                    chain,
                                    openAccountModal,
                                    openChainModal,
                                    openConnectModal,
                                    authenticationStatus,
                                    mounted,
                                }: any) => {
                                    const ready = mounted && authenticationStatus !== 'loading';
                                    const connected =
                                        ready &&
                                        account &&
                                        chain &&
                                        (!authenticationStatus ||
                                            authenticationStatus === 'authenticated');

                                    const isAdmin = connected && account.address && ADMIN_ADDRESS && account.address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

                                    return (
                                        <div
                                            {...(!ready && {
                                                'aria-hidden': true,
                                                'style': {
                                                    opacity: 0,
                                                    pointerEvents: 'none',
                                                    userSelect: 'none',
                                                },
                                            })}
                                            className="flex items-center gap-4"
                                        >
                                            {/* Admin Link */}
                                            {isAdmin && (
                                                <Link href="/admin" className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/50 text-red-500 rounded hover:bg-red-500/20 transition-all font-bold uppercase text-xs tracking-wider">
                                                    <span className="material-icons text-sm">admin_panel_settings</span>
                                                    ADMIN
                                                </Link>
                                            )}

                                            {connected && !chain.unsupported && (
                                                <FaucetButton address={account.address} />
                                            )}

                                            {(() => {
                                                if (!connected) {
                                                    return (
                                                        <button onClick={openConnectModal} className="bg-transparent border border-primary/50 text-primary hover:bg-primary hover:text-background-dark px-4 py-1.5 rounded transition-all duration-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(236,164,19,0.1)] hover:shadow-[0_0_20px_rgba(236,164,19,0.4)]">
                                                            Connect Identity
                                                        </button>
                                                    );
                                                }

                                                if (chain.unsupported) {
                                                    return (
                                                        <button onClick={openChainModal} className="bg-red-500 text-white px-3 py-1.5 rounded font-bold uppercase text-xs">
                                                            Wrong Network
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <button onClick={openAccountModal} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all px-3 py-1.5 rounded-full group">
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                                                            {account.address.slice(2, 4)}
                                                        </div>
                                                        <span className="text-slate-300 group-hover:text-primary font-mono text-xs tracking-tight">
                                                            {account.displayName}
                                                        </span>
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    );
                                }}
                            </ConnectButton.Custom>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function FaucetButton({ address }: { address: string }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleClaim = async () => {
        setLoading(true);
        setStatus('idle');
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/faucet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                console.error(data.error);
                setStatus('error');
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClaim}
            disabled={loading || status === 'success'}
            className={`
                px-3 py-1.5 rounded font-bold uppercase text-xs transition-all duration-300
                ${status === 'success'
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50'
                    : status === 'error'
                        ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20'
                }
            `}
        >
            {loading ? 'Sending...' : status === 'success' ? 'Sent!' : status === 'error' ? 'Failed' : 'Claim Tokens'}
        </button>
    );
}
