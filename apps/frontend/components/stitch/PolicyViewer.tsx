'use client';

import React from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';

interface PolicyViewerProps {
    topic: string;
    synopsis?: string;
    conclusion?: string;
    consensusScore?: number;
    votesFor?: number;
    votesAgainst?: number;
}

export function PolicyViewer({ topic, synopsis, conclusion, consensusScore = 98.4, votesFor = 1402, votesAgainst = 45 }: PolicyViewerProps) {
    return (
        <div className="relative z-10 pt-12 pb-24 flex flex-col items-center bg-background-dark min-h-screen text-slate-100 font-display">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px]"></div>
                <div className="absolute inset-0 bg-vignette"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] opacity-40"></div>
            </div>

            <div className="w-full max-w-4xl px-4 mb-8 flex justify-between items-end relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary uppercase">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        Live Document Feed
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{topic} <span className="text-slate-500 font-light">v4.2</span></h2>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Consensus Reached</div>
                    <div className="text-lg font-bold text-white">{consensusScore}%</div>
                </div>
            </div>

            <article className="glass-paper w-full max-w-4xl min-h-[1200px] p-16 text-slate-800 leading-relaxed shadow-[0_0_80px_rgba(0,0,0,0.5)] bg-white/95 backdrop-blur-md relative z-10">
                <div className="border-b-4 border-slate-900 pb-8 mb-12">
                    <div className="flex justify-between items-start mb-6">
                        <img alt="Official Seal" className="w-16 h-16 grayscale opacity-90 border border-slate-200 p-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEaFbwqfCOAxLKv1ctWqKJ-yT0xxeUS3CfjZTfNPvdOdQjjxbj-_bhKa6iYc0bn6BXzctNHjlnTkEwM6KwtKTqDpSNZVkQk9AXRlergVFBm9HmK8zj9Q6G7qCLbaFf6InO7o7Q3TBNl44-fcaYuTXeaSi3SpYxWO2RPs0fL6FL-3t7sbOuw9Ie8As2u0jlEtm-8yDmNgtJlPtA8DDuiZELRu6Z_p1TDSxbHm2TEjyeVZYcnJgBSbPtpOo5BNWtK7SANrWu6Dr4s0Y" />
                        <div className="text-right">
                            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Authenticated via AI-P Protocol</p>
                            <p className="font-bold text-slate-900 text-sm">COUNCIL OF ALGORITHMIC OVERSIGHT</p>
                            <p className="text-xs text-slate-500 uppercase font-mono tracking-tighter">DATELINE: NEO-TOKYO // {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Final Recommendation</h1>
                    <p className="text-slate-500 italic font-medium">Directive on {topic}</p>
                </div>

                <section className="relative mb-12 pb-12 border-b border-slate-200 last:border-0">
                    <div className="absolute top-0 right-0 flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        <span className="material-icons text-[12px]">verified</span>
                        Blockchain Verified
                    </div>
                    <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.2em] mb-4">I. Executive Summary</h3>
                    <div className="text-lg font-medium text-slate-900 mb-4">
                        The following directive outlines the consensus reached regarding {topic}.
                    </div>
                    <p className="mb-4">
                        {synopsis || "Analysis indicates that current patterns are unsustainable. The Council recommends immediate implementation of new protocols to preserve stability. This policy aims to decouple resource access from socioeconomic status, prioritizing cognitive processing for public service nodes."}
                    </p>
                </section>

                <section className="relative mb-12 pb-12 border-b border-slate-200 last:border-0">
                    <div className="absolute top-0 right-0 flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        <span className="material-icons text-[12px]">verified</span>
                        Blockchain Verified
                    </div>
                    <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.2em] mb-6">II. Conclusion & Directives</h3>
                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-32">
                                <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">CRITICAL_ACTION</span>
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-900 mb-2 uppercase text-sm">Primary Directive</h4>
                                <p className="text-sm">{conclusion || "Immediate transfer of controls to the decentralized consensus cluster. All manual override protocols are to be superseded by algorithmic consensus logic."}</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-32">
                                <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">MODERATE_ADVISORY</span>
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-900 mb-2 uppercase text-sm">Secondary Measures</h4>
                                <p className="text-sm">Implement a rolling quota system for resource allocation. Prioritize high-impact nodes during peak cycles.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-8 justify-between text-[10px] font-mono text-slate-400">
                    <div className="space-y-1">
                        <p>IPFS CID: QmXoyp...Mxe</p>
                        <p>ENCRYPTION: AES-256-GCM</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p>SIGNATORIES: {votesFor}</p>
                        <p>NONCE: {Math.floor(Math.random() * 1000000000)}</p>
                    </div>
                </div>
            </article>
        </div>
    );
}
