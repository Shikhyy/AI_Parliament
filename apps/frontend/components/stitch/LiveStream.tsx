'use client';

import React, { useEffect, useState, useRef } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useSocket } from '@/components/providers/SocketProvider';

// Custom hook for typewriter effect
const useTypewriter = (text: string, speed = 30) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return displayedText;
};

// Component for a single message bubble
const MessageBubble = ({ message, isLatest }: { message: any, isLatest: boolean }) => {
    const text = isLatest ? useTypewriter(message.content) : message.content;
    const isOpposing = message.agentId.includes("SKEPTIC") || message.agentId.includes("RISK"); // Simple heuristic for styling

    return (
        <div className={`flex flex-col ${isOpposing ? 'items-end self-end text-right' : 'items-start'} max-w-2xl animate-in slide-in-from-bottom-2 duration-500`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 bg-primary/10 border border-primary/20">{message.agentId}</span>
                <span className="text-xs font-bold text-white uppercase">AGENT</span>
            </div>
            <GlassPanel
                className={`p-4 rounded-lg ${isOpposing ? 'rounded-tr-none border-r-2 border-r-slate-500' : 'rounded-tl-none border-l-2 border-l-primary'} relative`}
                hoverEffect={false}
            >
                <p className="text-sm leading-relaxed text-slate-300">
                    {text}
                    {isLatest && <span className="inline-block w-1.5 h-3 bg-primary ml-1 animate-pulse" />}
                </p>
            </GlassPanel>
        </div>
    );
};

export const LiveStream = () => {
    const { debateState } = useSocket();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [debateState?.statements?.length]);

    if (!debateState?.statements) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
                WAITING FOR SIGNAL...
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative" ref={scrollRef}>
            {debateState.statements.map((msg: any, idx: number) => (
                <MessageBubble
                    key={`${msg.agentId}-${idx}`}
                    message={msg}
                    isLatest={idx === debateState.statements.length - 1}
                />
            ))}
        </div>
    );
};
