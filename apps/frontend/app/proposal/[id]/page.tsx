'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { PolicyViewer } from '@/components/stitch/PolicyViewer';

const GOVERNANCE_ADDRESS = process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS as `0x${string}`;
const GOVERNANCE_ABI = parseAbi([
    'function proposals(uint256) view returns (uint256 proposalId, uint8 proposalType, string description, string ipfsDetailsHash, address proposer, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed, bool passed)',
    'function vote(uint256 proposalId, bool support)'
]);


export default function Proposal({ params }: { params: { id: string } }) {
    const { isConnected } = useAccount();
    const { writeContract, isPending } = useWriteContract();

    const { data: proposal } = useReadContract({
        address: GOVERNANCE_ADDRESS,
        abi: GOVERNANCE_ABI,
        functionName: 'proposals',
        args: [BigInt(params.id)],
    });

    const handleVote = (support: boolean) => {
        writeContract({
            address: GOVERNANCE_ADDRESS,
            abi: GOVERNANCE_ABI,
            functionName: 'vote',
            args: [BigInt(params.id), support],
        });
    };

    // Use Public Client for explicit fetching if needed, but readContract hook is fine if we handle loading/error.
    // The previous implementation had a hardcoded fallback that always overrode data if "proposal" was undefined, which happens during loading.

    // Derived state for display
    const [displayProposal, setDisplayProposal] = React.useState<any>(null);

    React.useEffect(() => {
        if (proposal) {
            // Contract returns: [id, type, description, hash, proposer, votesFor, votesAgainst, deadline, executed, passed]
            // Note: Wagmi readContract types can be tricky. Assuming array based on ABI.
            const p = proposal as unknown as any[];
            setDisplayProposal({
                description: p[2],
                votesFor: Number(p[5]),
                votesAgainst: Number(p[6]),
                deadline: p[7],
                status: p[8] ? (p[9] ? 'Passed' : 'Failed') : 'Active'
            });
        } else if (!isPending && !proposal) {
            // No fallback. If proposal is missing, state remains null or we could handle error.
        }
    }, [proposal, isPending]);

    if (!displayProposal) return <div className="min-h-screen bg-background-dark flex items-center justify-center text-primary animate-pulse">LOADING_PROPOSAL_DATA...</div>;

    const consensusScore = Math.min(99, Math.round((displayProposal.votesFor / (displayProposal.votesFor + displayProposal.votesAgainst)) * 100));

    const [debateSummary, setDebateSummary] = React.useState<{ synopsis: string, conclusion: string } | null>(null);

    React.useEffect(() => {
        const fetchDebateSummary = async () => {
            try {
                // Fetch all debates to find the one matching this proposal's topic
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/debates`);
                const debates = await res.json();

                // Find debate with matching topic (approximate match)
                if (displayProposal?.description) {
                    const match = Object.values(debates).find((d: any) =>
                        d.topic.toLowerCase().includes(displayProposal.description.toLowerCase()) ||
                        displayProposal.description.toLowerCase().includes(d.topic.toLowerCase())
                    );

                    if (match) {
                        setDebateSummary({
                            synopsis: (match as any).synopsis,
                            conclusion: (match as any).conclusion
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch debate summary", err);
            }
        };

        if (displayProposal?.description) {
            fetchDebateSummary();
        }
    }, [displayProposal?.description]);

    return (
        <main className="min-h-screen bg-background-dark font-display text-slate-100 selection:bg-primary/30 flex flex-col">
            <Navbar />

            <div className="relative">
                <PolicyViewer
                    topic={displayProposal.description}
                    synopsis={debateSummary?.synopsis || "Analysis indicates that current patterns are unsustainable. The Council recommends immediate implementation of new protocols to preserve stability. This policy aims to prioritize cognitive processing for public service nodes."}
                    conclusion={debateSummary?.conclusion || "Immediate transfer of controls to the decentralized consensus cluster. All manual override protocols are to be superseded by algorithmic consensus logic."}
                    consensusScore={consensusScore}
                    votesFor={displayProposal.votesFor}
                    votesAgainst={displayProposal.votesAgainst}
                />

                {/* Overlaid Voting Controls */}
                <div className="fixed bottom-8 right-8 z-50 flex gap-4">
                    <button
                        onClick={() => handleVote(true)}
                        disabled={!isConnected || isPending}
                        className="shadow-[0_0_20px_rgba(34,197,94,0.4)] bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <span className="material-icons">thumb_up</span>
                        Ratify
                    </button>
                    <button
                        onClick={() => handleVote(false)}
                        disabled={!isConnected || isPending}
                        className="shadow-[0_0_20px_rgba(239,68,68,0.4)] bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <span className="material-icons">thumb_down</span>
                        Reject
                    </button>
                </div>
            </div>
        </main>
    );
}

