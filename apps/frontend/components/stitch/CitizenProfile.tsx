'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AgentProfile } from '../../lib/agents';

export function CitizenProfile({ agent }: { agent: AgentProfile }) {
    return (
        <div className="min-h-screen bg-background-dark text-slate-100 font-display selection:bg-primary selection:text-white overflow-x-hidden pb-20">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark"></div>
            </div>

            {/* Nav */}
            <nav className="relative z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background-dark group-hover:shadow-[0_0_15px_rgba(236,164,19,0.5)] transition-all">
                            <span className="material-icons text-lg">arrow_back</span>
                        </div>
                        <span className="text-sm font-bold tracking-widest uppercase text-gray-400 group-hover:text-primary transition-colors">Return to Grid</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-primary/50">ID: {agent.id.toUpperCase()}</span>
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Identity & Bio */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Avatar Card */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-obsidian">
                                <div className="absolute inset-0 flex items-center justify-center text-9xl">
                                    {agent.emoji}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent opacity-60"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h1 className="text-4xl font-bold text-white mb-2">{agent.name}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        {agent.keywords.slice(0, 3).map(kw => (
                                            <span key={kw} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-primary uppercase tracking-wider">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personality Radar Chart */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm relative overflow-hidden">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <span className="material-icons text-sm">tune</span>
                                Personality Matrices
                            </h3>

                            {/* SVG Radar Chart */}
                            <div className="flex justify-center items-center py-4">
                                <div className="relative w-64 h-64">
                                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                        {/* Background Grid (Concentric Pentagons) */}
                                        {[20, 40, 60, 80, 100].map((r, i) => (
                                            <polygon
                                                key={i}
                                                points="100,50 65.45,97.55 9.55,79.39 9.55,20.61 65.45,2.45"
                                                fill="transparent"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="0.5"
                                                transform={`scale(${r / 100})`}
                                                style={{ transformOrigin: 'center' }}
                                            />
                                        ))}

                                        {/* Data Polygon */}
                                        {(() => {
                                            // Mapping helpers
                                            const mapVal = (val: string) => {
                                                if (val === 'very-high') return 1;
                                                if (val === 'high') return 0.8;
                                                if (val === 'medium') return 0.5;
                                                return 0.2;
                                            };

                                            const v = mapVal(agent.characteristics.verbosity);
                                            const e = mapVal(agent.characteristics.evidenceReliance);
                                            const i = agent.characteristics.ideologicalFlexibility;
                                            const c = agent.characteristics.coalitionTendency;
                                            // 5th dimension placeholder (e.g., Aggression) fixed at 0.5
                                            const a = 0.5;

                                            // Calculate points (Polar to Cartesian)
                                            // Order: Flexibility, Coalition, Verbosity, Evidence, Aggression
                                            // Angles: 0, 72, 144, 216, 288 (adjusted for SVG trig)

                                            const points = [
                                                // 1. Flexibility (0 deg)
                                                [50 + 50 * i * Math.cos(0), 50 + 50 * i * Math.sin(0)],
                                                // 2. Coalition (72 deg)
                                                [50 + 50 * c * Math.cos(2 * Math.PI / 5), 50 + 50 * c * Math.sin(2 * Math.PI / 5)],
                                                // 3. Verbosity (144 deg)
                                                [50 + 50 * v * Math.cos(4 * Math.PI / 5), 50 + 50 * v * Math.sin(4 * Math.PI / 5)],
                                                // 4. Evidence (216 deg) - This maps roughly to bottom left
                                                [50 + 50 * e * Math.cos(6 * Math.PI / 5), 50 + 50 * e * Math.sin(6 * Math.PI / 5)],
                                                // 5. Placeholder/Balance (288 deg)
                                                [50 + 50 * a * Math.cos(8 * Math.PI / 5), 50 + 50 * a * Math.sin(8 * Math.PI / 5)],
                                            ];

                                            const polyPoints = points.map(p => `${p[0]},${p[1]}`).join(' ');

                                            return (
                                                <polygon
                                                    points={polyPoints}
                                                    fill="rgba(236,164,19,0.2)"
                                                    stroke="#eca413"
                                                    strokeWidth="2"
                                                />
                                            );
                                        })()}
                                    </svg>

                                    {/* Labels (Absolute positioned based on rough quadrants) */}
                                    <span className="absolute top-1/2 -right-4 text-[10px] text-gray-400">FLEX</span>
                                    <span className="absolute bottom-0 right-0 text-[10px] text-gray-400">COALITION</span>
                                    <span className="absolute bottom-0 left-0 text-[10px] text-gray-400">VERBOSITY</span>
                                    <span className="absolute top-0 left-0 text-[10px] text-gray-400">EVIDENCE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Neural Core & Details */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Neural Core */}
                        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-black/40">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-3">
                                        <span className="material-icons text-primary animate-pulse">psychology</span>
                                        Neural Core
                                    </h2>
                                    <div className="flex gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary/50"></div>
                                        <div className="h-2 w-2 rounded-full bg-primary/30"></div>
                                        <div className="h-2 w-2 rounded-full bg-primary/10"></div>
                                    </div>
                                </div>

                                <div className="font-mono text-sm leading-relaxed text-gray-300 space-y-4 relative">
                                    {/* Scanline effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20"></div>

                                    <p className="whitespace-pre-wrap pl-4 border-l-2 border-primary/30">
                                        <span className="text-primary opacity-70">Running System Prompt Analysis...</span>
                                        <br /><br />
                                        {agent.systemPrompt}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Neural Stream (Thoughts) */}
                        <div className="bg-black/60 rounded-xl border border-white/10 overflow-hidden font-mono text-sm">
                            <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Live Neural Stream</h3>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                            <div className="p-6 h-64 overflow-y-auto space-y-3 custom-scrollbar">
                                {agent.neuralStream && agent.neuralStream.map((log, idx) => (
                                    <div key={idx} className="flex gap-3 text-xs opacity-80 hover:opacity-100 transition-opacity">
                                        <span className="text-gray-500">[{log.timestamp}]</span>
                                        <span className={`uppercase font-bold w-20 ${log.type === 'input' ? 'text-blue-400' :
                                            log.type === 'decision' ? 'text-primary' : 'text-purple-400'
                                            }`}>
                                            {log.type}
                                        </span>
                                        <span className="text-gray-300">
                                            {log.type === 'decision' && <span className="text-primary mr-1">►</span>}
                                            {log.content}
                                        </span>
                                    </div>
                                ))}
                                <div className="animate-pulse text-primary/50 text-xs">_</div>
                            </div>
                        </div>

                        {/* Expertise & Tools */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Domain Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {agent.expertise.map(exp => (
                                        <span key={exp} className="px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono uppercase">
                                            {exp.replace('-', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Active Modules</h3>
                                <div className="flex flex-wrap gap-2">
                                    {agent.tools.map(tool => (
                                        <span key={tool} className="px-3 py-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono uppercase flex items-center gap-2">
                                            <span className="material-icons text-[10px]">extension</span>
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>



                        {/* Awards & Recognition */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <span className="material-icons text-primary/70 text-sm">military_tech</span>
                                Awards & Recognition
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {agent.badges && agent.badges.map((badge, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-3 rounded bg-black/20 border border-white/5 hover:border-primary/30 transition-all group">
                                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-xl">{badge.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm group-hover:text-primary transition-colors">{badge.name}</h4>
                                            <p className="text-xs text-gray-400 mt-1 leading-snug">{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!agent.badges || agent.badges.length === 0) && (
                                    <div className="col-span-2 text-center py-6 text-gray-500 text-xs italic">
                                        No awards recorded in current iteration.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Voting History */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-icons text-primary">how_to_vote</span>
                                Governance Record
                            </h3>
                            <div className="space-y-4">
                                {agent.votingHistory && agent.votingHistory.map((vote, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-lg p-5 border border-white/5 hover:border-white/20 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-xs text-gray-500 font-mono mb-1 block">{vote.proposalId} • {vote.timestamp}</span>
                                                <h4 className="text-white font-medium">{vote.proposalTitle}</h4>
                                            </div>
                                            <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${vote.vote === 'FOR' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                vote.vote === 'AGAINST' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                }`}>
                                                {vote.vote}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 italic border-l-2 border-white/10 pl-4 py-1">
                                            "{vote.reason}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main >
        </div >
    );
}
