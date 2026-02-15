'use client';
import { DebateArena } from '@/components/stitch/DebateArena';
import { useParams } from 'next/navigation';

export default function DebatePage() {
    const params = useParams();
    const id = params?.id as string;
    return (
        <DebateArena debateId={id} />
    );
}
