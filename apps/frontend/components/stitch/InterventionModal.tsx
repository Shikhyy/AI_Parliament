'use client';

import React from 'react';

interface InterventionModalProps {
    onAcknowledge: () => void;
    // can add other props like consensusScore, etc.
}

export function InterventionModal({ onAcknowledge }: InterventionModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in zoom-in duration-300">

            {/* Top Alert Bar */}
            <div className="fixed top-0 left-0 w-full z-50 bg-primary text-black px-6 py-2 flex items-center justify-between font-bold tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(249,195,31,0.4)]">
                <div className="flex items-center gap-4">
                    <span className="material-icons text-xl">warning</span>
                    <span>System Override: Anti-Groupthink Protocol Active</span>
                </div>
                <div className="flex items-center gap-8">
                    <span>Phase: Dissent Injection</span>
                    <div className="flex items-center gap-2">
                        <span className="material-icons">timer</span>
                        <span>02:59:04</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px] mt-12">

                {/* Left Sidebar: Threat & Metrics */}
                <aside className="md:col-span-3 flex flex-col gap-6">
                    <div className="bg-background-dark/85 backdrop-blur-md border border-primary/30 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(249,195,31,0.1)]">
                        <h3 className="text-primary text-xs tracking-widest uppercase mb-4">Consensus Threat Level</h3>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Radial Gauge */}
                            <svg className="w-full h-full -rotate-90">
                                <circle className="text-primary/10" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeWidth="6"></circle>
                                <circle className="text-primary" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeDasharray="352" strokeDashoffset="52" strokeWidth="6"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-primary">85%</span>
                                <span className="text-[9px] uppercase tracking-tighter opacity-70 text-slate-300">Critical Echo</span>
                            </div>
                        </div>
                        <p className="mt-4 text-[10px] text-primary/80 leading-relaxed text-left">
                            Homogeneity detected. Plurality of thought has dropped below safety thresholds.
                        </p>
                    </div>

                    <div className="bg-background-dark/85 backdrop-blur-md border border-primary/30 p-6 rounded-xl flex-1 overflow-hidden relative">
                        <h3 className="text-primary text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                            <span className="material-icons text-sm">block</span> Silenced Entities
                        </h3>
                        {/* Mock Silenced List */}
                        <div className="space-y-4 opacity-70 grayscale">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-700"></div>
                                <div><p className="text-xs font-bold text-slate-300">LOGOS-9</p><p className="text-[9px] text-slate-500 uppercase">Reasoning Engine</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-700"></div>
                                <div><p className="text-xs font-bold text-slate-300">ETHOS-AL</p><p className="text-[9px] text-slate-500 uppercase">Moral Weighting</p></div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Center: Devil's Advocate Intervention */}
                <section className="md:col-span-6 flex flex-col items-center justify-center relative">
                    <div className="bg-background-dark/95 backdrop-blur-xl w-full rounded-xl overflow-hidden border-2 border-primary/50 flex flex-col shadow-[0_0_40px_rgba(249,195,31,0.2)]">
                        <div className="bg-primary/10 border-b border-primary/30 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                                <h2 className="font-bold tracking-widest text-primary text-sm">DEVIL'S ADVOCATE #001</h2>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[9px] border border-primary/40 px-2 py-0.5 rounded text-primary">STEELMANNING ACTIVE</span>
                            </div>
                        </div>
                        <div className="p-8 flex flex-col items-center text-center">
                            {/* Holographic Avatar Container */}
                            <div className="relative w-32 h-32 mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-30"></div>
                                <div className="relative w-full h-full rounded-full border-2 border-primary overflow-hidden">
                                    <img className="w-full h-full object-cover grayscale brightness-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3ilB97Z0izr7BqtbJ-3wdoQT7cv0KJNHW5vuzjLz0Wjpn8sYPCueYAb15PY6vlw-NRZ3C8VEWyqvOWIYIAN_EzAmjOCP8oYYBfj4r8l8hq-sZAPy_HLyOWXMuwMFbBEru5rqtM0XC2ugtQoHX87xRexmxylEk0Dm6VSVzRaglHBXVmduV-iTrFPnb0BrNiXqb6W0m6MTMtLAr1wPh9O_FJaMTcXGrCwK7xvOoz0Chy1YZ-aKll-sKOmQHCvimxEffIYKAWwPIeIo" />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 text-[10px] font-black skew-x-[-12deg]">
                                    ROOT ACCESS
                                </div>
                            </div>

                            <div className="max-w-md space-y-6">
                                <div className="relative">
                                    <span className="material-icons absolute -top-4 -left-6 text-3xl text-primary/20">format_quote</span>
                                    <p className="text-xl font-medium leading-tight text-white italic">
                                        "The proposed economic rebalancing assumes a linear trajectory that ignores the inherent volatility of human irrationality. You are gambling with the safety net."
                                    </p>
                                    <span className="material-icons absolute -bottom-4 -right-6 text-3xl text-primary/20 rotate-180">format_quote</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-1 w-24 bg-primary/30 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-2/3 animate-[pulse_2s_infinite]"></div>
                                    </div>
                                    <p className="text-[10px] text-primary tracking-[0.2em] uppercase font-bold">Analyzing Counter-Variables...</p>
                                </div>
                            </div>
                        </div>

                        {/* Interaction UI */}
                        <div className="p-6 bg-primary/5 border-t border-primary/20 grid grid-cols-2 gap-4">
                            <button
                                onClick={async () => {
                                    try {
                                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                                        await fetch(`${API_URL}/admin/intervene`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ debateId: 'current' })
                                        });
                                        onAcknowledge();
                                    } catch (e) {
                                        console.error("Intervention failed", e);
                                        onAcknowledge(); // Close anyway for now
                                    }
                                }}
                                className="bg-primary hover:bg-white text-black font-black py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-tighter text-sm"
                            >
                                <span className="material-icons text-sm">check_circle</span>
                                Acknowledge Dissent
                            </button>
                            <button className="border-2 border-primary/50 hover:border-primary text-primary font-black py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-tighter text-sm">
                                <span className="material-icons text-sm">info</span>
                                Request Details
                            </button>
                        </div>
                    </div>
                </section>

                {/* Right Sidebar: Logs */}
                <aside className="md:col-span-3 flex flex-col gap-6">
                    <div className="bg-background-dark/85 backdrop-blur-md border border-primary/30 p-6 rounded-xl flex-1 relative overflow-hidden">
                        <h3 className="text-primary text-xs tracking-widest uppercase mb-4">Live System Logs</h3>
                        <div className="font-mono text-[9px] text-primary/70 space-y-1 overflow-hidden h-64">
                            <p>&gt; [03:44:11] OVERRIDE: Primary Consensus Reached</p>
                            <p>&gt; [03:44:12] ERROR: Groupthink Entropy detected</p>
                            <p>&gt; [03:44:12] WARNING: Dissent Index below 5%</p>
                            <p>&gt; [03:44:15] INJECTING: Devil's Advocate Agent #001</p>
                            <p>&gt; [03:44:16] SUSPENDING: Vote.exe</p>
                            <p className="animate-pulse">&gt; [03:44:22] AWAITING_ACKNOWLEDGEMENT...</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
