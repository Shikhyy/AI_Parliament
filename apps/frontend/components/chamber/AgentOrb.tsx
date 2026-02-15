'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

interface AgentOrbProps {
    position: [number, number, number];
    color: string;
    isSpeaking: boolean;
    name: string;
    emoji: string;
}

export function AgentOrb({ position, color, isSpeaking, name, emoji }: AgentOrbProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Idle bobbing
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;

        // Speaking pulse
        if (isSpeaking) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
            meshRef.current.scale.set(scale, scale, scale);
            if (glowRef.current) {
                glowRef.current.visible = true;
                glowRef.current.scale.set(scale * 1.5, scale * 1.5, scale * 1.5);
            }
        } else {
            meshRef.current.scale.set(1, 1, 1);
            if (glowRef.current) glowRef.current.visible = false;
        }
    });

    return (
        <group position={position}>
            {/* Label */}
            <Html position={[0, 1.5, 0]} center>
                <div className="flexflex-col items-center bg-black/50 backdrop-blur-md p-2 rounded-lg text-white text-xs border border-white/10 whitespace-nowrap">
                    <span className="text-xl">{emoji}</span>
                    <span className="mt-1 font-bold">{name}</span>
                </div>
            </Html>

            {/* Core Orb */}
            <Sphere ref={meshRef} args={[0.5, 32, 32]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isSpeaking ? 2 : 0.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>

            {/* Glow Aura (Simplified) */}
            <Sphere ref={glowRef} args={[0.6, 32, 32]} visible={false}>
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </Sphere>
        </group>
    );
}
