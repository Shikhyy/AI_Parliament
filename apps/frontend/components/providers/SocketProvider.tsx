'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface QualityMetrics {
    evidenceScore: number;
    diversityScore: number;
    engagementScore: number;
    constructivenessScore: number;
    timestamp: number;
}

interface Statement {
    id: string;
    agentId: string;
    content: string;
    timestamp: number;
    phase: string;
    toolsUsed: string[];
    citations: string[];
    reactions?: any[];
}

interface Coalition {
    id: string;
    agentIds: string[];
    sharedPosition: string;
    strength: number;
    formationReason?: string;
}

interface DebateState {
    debateId: string;
    topic: string;
    currentPhase: string;
    activeAgents: string[];
    statements: Statement[];
    turnCount: number;
    consensusScore: number;
    coalitions: Coalition[];
    qualityMetrics?: QualityMetrics;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    debateState: DebateState | null;
    typingAgents: string[];
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    debateState: null,
    typingAgents: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [debateState, setDebateState] = useState<DebateState | null>(null);
    const [typingAgents, setTypingAgents] = useState<string[]>([]);

    useEffect(() => {
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
        const socketInstance = io(WS_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('state_sync', (data: DebateState) => {
            setDebateState(data);
        });

        socketInstance.on('statement_added', (statement: Statement) => {
            setDebateState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    statements: [...prev.statements, statement],
                    turnCount: prev.turnCount + 1,
                };
            });
        });

        socketInstance.on('phase_changed', (newPhase: string) => {
            setDebateState(prev => {
                if (!prev) return null;
                return { ...prev, currentPhase: newPhase };
            });
        });

        socketInstance.on('quality_updated', (metrics: QualityMetrics) => {
            setDebateState(prev => {
                if (!prev) return null;
                return { ...prev, qualityMetrics: metrics };
            });
        });

        socketInstance.on('agent_typing', (data: { agentId: string; isTyping: boolean }) => {
            setTypingAgents(prev => {
                if (data.isTyping) {
                    return [...prev, data.agentId];
                } else {
                    return prev.filter(id => id !== data.agentId);
                }
            });
        });

        socketInstance.on('coalition_formed', (coalition: Coalition) => {
            setDebateState(prev => {
                if (!prev) return null;
                return { ...prev, coalitions: [...prev.coalitions, coalition] };
            });
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, debateState, typingAgents }}>
            {children}
        </SocketContext.Provider>
    );
};
