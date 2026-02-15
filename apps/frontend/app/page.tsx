'use client';

import { useState } from 'react';
import { LandingPage } from '@/components/stitch/LandingPage';
import { DebateLobby } from '@/components/stitch/DebateLobby';
import { DebateArena } from '@/components/stitch/DebateArena';
import { useSocket } from '@/components/providers/SocketProvider';

export default function Home() {
    const [view, setView] = useState<'LANDING' | 'LOBBY' | 'ARENA'>('LANDING');
    const [selectedDebateId, setSelectedDebateId] = useState<string | null>(null);
    const { joinDebate, leaveDebate } = useSocket();

    const handleEnterParliament = () => {
        setView('LOBBY');
    };

    const handleJoinDebate = (debateId: string) => {
        setSelectedDebateId(debateId);
        joinDebate(debateId);
        setView('ARENA');
    };

    const handleLeaveDebate = () => {
        if (selectedDebateId) {
            leaveDebate(selectedDebateId);
        }
        setSelectedDebateId(null);
        setView('LOBBY');
    };

    return (
        <main className="h-screen w-screen overflow-hidden">
            {view === 'LANDING' && (
                <div className="relative h-full">
                    <LandingPage />
                    {/* Overlay Enter Button if LandingPage doesn't have one that works for us */}
                    <div className="absolute bottom-20 left-0 right-0 flex justify-center z-50 pointer-events-none">
                        <button
                            onClick={handleEnterParliament}
                            className="pointer-events-auto bg-primary text-black font-bold text-lg px-8 py-3 rounded-full hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)] uppercase tracking-widest"
                        >
                            Enter Parliament
                        </button>
                    </div>
                </div>
            )}

            {view === 'LOBBY' && (
                <DebateLobby onJoin={handleJoinDebate} />
            )}

            {view === 'ARENA' && selectedDebateId && (
                <div className="h-full relative">
                    <button
                        onClick={handleLeaveDebate}
                        className="absolute top-4 left-20 z-50 bg-black/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 rounded px-3 py-1 text-xs uppercase tracking-widest transition-all"
                    >
                        &larr; Exit to Lobby
                    </button>
                    <DebateArena debateId={selectedDebateId} />
                </div>
            )}
        </main>
    );
}
