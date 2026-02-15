import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSocket } from '@/components/providers/SocketProvider';

export interface AgentProfile {
    id: string;
    name: string;
    emoji: string;
    role: string;
    color: string;
}

export interface Turn {
    id: string;
    agentId: string;
    agentName: string;
    content: string;
    timestamp: number;
    type: string;
}

export interface DebateState {
    debateId: string;
    topic: string;
    currentPhase: string;
    activeAgents: string[];
    statements: Array<{
        id: string;
        agentId: string;
        content: string;
        timestamp: number;
        phase: string;
    }>;
    turnCount: number;
    consensusScore: number;
    coalitions: any[];
}

/**
 * Hook to access debate socket and state from global provider
 * Replaces the old custom WebSocket connection with centralized Socket.io
 */
export function useDebateSocket() {
    const { socket, isConnected, debateState } = useSocket();
    const [lastTurn, setLastTurn] = useState<any>(null);

    useEffect(() => {
        if (!socket) return;

        // Listen for new statements
        socket.on('statement_added', (statement: any) => {
            setLastTurn(statement);
        });

        // Listen for phase changes
        socket.on('phase_changed', (newPhase: string) => {
            console.log('Phase changed to:', newPhase);
        });

        // Listen for agent speaking
        socket.on('agent_speaking', (agentId: string) => {
            console.log('Agent speaking:', agentId);
        });

        return () => {
            socket.off('statement_added');
            socket.off('phase_changed');
            socket.off('agent_speaking');
        };
    }, [socket]);

    /**
     * Submit a statement to the debate (alternative to REST API)
     */
    const submitStatement = (agentId: string, content: string) => {
        if (!socket) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('submit_statement', { agentId, content });
    };

    /**
     * Request turn for agent
     */
    const requestTurn = (agentId: string) => {
        if (!socket) return;
        socket.emit('request_turn', { agentId });
    };

    return {
        socket,
        isConnected,
        debateState: debateState as DebateState,
        lastTurn,
        submitStatement,
        requestTurn
    };
}
