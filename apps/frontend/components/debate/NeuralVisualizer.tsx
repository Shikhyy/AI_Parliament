'use client';

import React, { useRef, useEffect } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    id: string;
    activity: number; // 0 to 1, decays over time
}

interface NeuralVisualizerProps {
    activeAgents: string[];
}

export const NeuralVisualizer: React.FC<NeuralVisualizerProps> = ({ activeAgents }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<Node[]>([]);
    const animationRef = useRef<number>();
    const { debateState } = useSocket();
    const lastStatementRef = useRef<string | null>(null);

    // Initialize Nodes based on active agents
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        // Create nodes if they don't exist or update them
        if (nodesRef.current.length === 0 && activeAgents.length > 0) {
            nodesRef.current = activeAgents.map((agentId) => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 3 + Math.random() * 2,
                id: agentId,
                activity: 0
            }));
        } else if (nodesRef.current.length !== activeAgents.length) {
            // Re-sync nodes if agent count changes substantially (simple reset for now to avoid complexity)
            nodesRef.current = activeAgents.map((agentId) => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 3 + Math.random() * 2,
                id: agentId,
                activity: 0
            }));
        }

    }, [activeAgents.length]);

    // React to new statements
    useEffect(() => {
        if (debateState?.statements.length) {
            const lastStmt = debateState.statements[debateState.statements.length - 1];
            if (lastStmt.id !== lastStatementRef.current) {
                lastStatementRef.current = lastStmt.id;
                // Find node and boost activity
                const node = nodesRef.current.find(n => n.id === lastStmt.agentId);
                if (node) {
                    node.activity = 1.0; // Flash!
                    node.radius = 8; // Pulse expand
                }
            }
        }
    }, [debateState?.statements]);

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;

            // Clear with trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade out previous frame
            ctx.fillRect(0, 0, width, height);

            // Update and Draw Nodes
            nodesRef.current.forEach(node => {
                // Physics
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off walls
                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                // Decay activity
                node.activity *= 0.95;
                if (node.radius > 4) node.radius *= 0.98;

                // Draw Connections
                nodesRef.current.forEach(otherNode => {
                    const dx = node.x - otherNode.x;
                    const dy = node.y - otherNode.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(otherNode.x, otherNode.y);
                        // Opacity based on distance and activity
                        const opacity = (1 - dist / 100) * 0.2 + (node.activity * 0.5);
                        ctx.strokeStyle = `rgba(236, 164, 19, ${opacity})`; // Primary color
                        ctx.lineWidth = 1 + node.activity * 2;
                        ctx.stroke();
                    }
                });

                // Draw Node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                const blueVal = 255 * (1 - node.activity);
                ctx.fillStyle = `rgb(255, ${blueVal}, 0)`; // Yellow to Orange flash
                ctx.fill();

                // Glow
                if (node.activity > 0.1) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = 'rgba(236, 164, 19, 0.8)';
                } else {
                    ctx.shadowBlur = 0;
                }
            });

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-full object-cover"
        />
    );
};
