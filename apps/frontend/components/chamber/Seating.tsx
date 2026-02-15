import { AgentOrb } from './AgentOrb';
import { AgentProfile } from '@/hooks/useDebateSocket';

interface ParliamentSeatingProps {
    agents: AgentProfile[];
    speakingAgentId?: string;
}

export function ParliamentSeating({ agents, speakingAgentId }: ParliamentSeatingProps) {
    // Arrange agents in a semi-circle
    const radius = 8;

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <circleGeometry args={[15, 64]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
            </mesh>

            {/* Podium */}
            <mesh position={[0, -1, 0]} receiveShadow>
                <cylinderGeometry args={[2, 2.5, 2, 32]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {agents.map((agent, index) => {
                const totalAngle = Math.PI; // 180 degrees
                const angleStep = totalAngle / (agents.length + 1);
                const angle = -Math.PI / 2 + angleStep * (index + 1); // Start from left

                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * (radius * 0.8); // slight oval

                return (
                    <AgentOrb
                        key={agent.id}
                        position={[x, 0, -z]} // Invert Z for correct camera facing usually
                        color={agent.color || "#ffffff"}
                        name={agent.name}
                        emoji={agent.emoji}
                        isSpeaking={speakingAgentId === agent.id}
                    />
                );
            })}
        </group>
    );
}
