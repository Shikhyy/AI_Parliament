'use client';

import React from 'react';

interface BadgeShowcaseProps {
    badge: {
        name: string;
        rarity: string;
        image: string;
        description: string;
    };
    onClose: () => void;
}

export function BadgeShowcase({ badge, onClose }: BadgeShowcaseProps) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white">
                <span className="material-icons text-4xl">close</span>
            </button>

            {/* Background Rays */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">

                {/* 3D Visual */}
                <div className="flex items-center justify-center relative group">
                    <div className="relative w-[500px] h-[500px]">
                        <img
                            src={badge.image}
                            alt={badge.name}
                            className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(236,164,19,0.3)] animate-float"
                        />
                        {/* Magnifying Glass Effect Simulation */}
                        <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 w-48 p-4 rounded-xl bg-black/80 border border-primary/30 backdrop-blur pointer-events-none">
                            <p className="text-[9px] text-primary uppercase tracking-widest mb-1">Surface Scan</p>
                            <div className="w-full h-32 bg-gray-900 rounded overflow-hidden mb-1">
                                <img src={badge.image} className="w-full h-full object-cover scale-[2] origin-center" />
                            </div>
                            <p className="text-[8px] text-white/50 font-mono">Material: Virtual Gold</p>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="flex flex-col justify-center space-y-8">
                    <div className="pl-8 border-l-2 border-primary/50">
                        <span className="text-primary text-xs uppercase tracking-[0.3em] font-bold">Badge Acquired</span>
                        <h1 className="text-5xl font-bold text-white mt-2 mb-4 tracking-tight">{badge.name}</h1>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">{badge.rarity}</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider">NFT #4022</span>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-md">
                        <p className="text-slate-300 leading-loose italic">
                            "{badge.description}"
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-4 bg-primary text-black font-bold uppercase tracking-widest rounded hover:bg-yellow-500 transition-all shadow-[0_0_20px_rgba(236,164,19,0.4)] flex items-center gap-2">
                            <span className="material-icons">inventory_2</span> Collect to Vault
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
