'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ParliamentSeating } from './Seating';
import { useDebateSocket, AgentProfile } from '@/hooks/useDebateSocket';
import { useMemo, useState, useEffect } from 'react';

// Function to generate consistent colors based on agent ID
// Uses primary color (#eca413) and generates variations for each agent
const generateAgentColor = (agentId: string, index: number, total: number): string => {
    const primaryHue = 43; // Gold/yellow hue (from #eca413)
    const saturation = 85;
    const baseLight = 60;

    // Generate evenly spaced hues around the color wheel starting from primary
    const hueOffset = (360 / Math.max(total, 1)) * index;
    const hue = (primaryHue + hueOffset) % 360;
    
    // Alternate lightness for contrast
    const lightness = baseLight + (index % 2 === 0 ? 0 : 10);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Agent profile with backend info + calculated color
interface EnrichedAgentProfile extends AgentProfile {
    color: string;
}

export function ParliamentScene() {
    const { debateState, lastTurn } = useDebateSocket();
    const [enrichedAgents, setEnrichedAgents] = useState<EnrichedAgentProfile[]>([]);

    // Enrich agent profiles with calculated colors
    const agentProfiles = useMemo(() => {
        if (!debateState || !debateState.activeAgents) return [];

        // Generate colors for each active agent based on their position
        const colored = debateState.activeAgents
            .map((agentId, index) => {
                // Create enriched profile with color
                // Find name/emoji from context if available, otherwise use ID
                return {
                    id: agentId,
                    name: agentId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    emoji: '🤖', // Default emoji; would be fetched from backend in real app
                    role: 'Participant',
                    color: generateAgentColor(agentId, index, debateState.activeAgents.length),
                } as EnrichedAgentProfile;
            })
            .filter(Boolean);

        setEnrichedAgents(colored);
        return colored;
    }, [debateState?.activeAgents, debateState]);

    return (
        <div className="w-full h-screen bg-black">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={60} />
                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={5}
                    maxDistance={25}
                />

                <ambientLight intensity={0.2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="city" />

                <EffectComposer>
                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
                </EffectComposer>

                {debateState && agentProfiles.length > 0 && (
                    <ParliamentSeating
                        agents={agentProfiles}
                        speakingAgentId={lastTurn && (Date.now() - lastTurn.timestamp < 5000) ? lastTurn.agentId : undefined}
                    />
                )}

                {!debateState && (
                    // Placeholder if no debate active
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#eca413" />
                    </mesh>
                )}
            </Canvas>
        </div>
    );
}
