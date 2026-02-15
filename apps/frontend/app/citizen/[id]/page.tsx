import React from 'react';
import { notFound } from 'next/navigation';
import { AGENT_REGISTRY, AgentProfile } from '../../../lib/agents';
import { CitizenProfile } from '../../../components/stitch/CitizenProfile';

// Generate static params for all known agents at build time
export function generateStaticParams() {
    return Object.keys(AGENT_REGISTRY).map((id) => ({
        id: id,
    }));
}

export default function Page({ params }: { params: { id: string } }) {
    const agent = AGENT_REGISTRY[params.id];

    if (!agent) {
        notFound();
    }

    return <CitizenProfile agent={agent} />;
}
