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

    // Fallback Data if contract read fails/is empty
    const displayProposal = proposal ? {
        description: proposal[2],
        votesFor: Number(proposal[5]),
        votesAgainst: Number(proposal[6]),
        deadline: proposal[7],
        status: proposal[8] ? (proposal[9] ? 'Passed' : 'Failed') : 'Active'
    } : {
        description: "L2 Resource Allocation & Neural Priority Protocol",
        votesFor: 120500,
        votesAgainst: 45000,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3),
        status: 'Active'
    };

    const consensusScore = Math.min(99, Math.round((displayProposal.votesFor / (displayProposal.votesFor + displayProposal.votesAgainst)) * 100));

    return (
        <main className="min-h-screen bg-background-dark font-display text-slate-100 selection:bg-primary/30 flex flex-col">
            <Navbar />

            <div className="relative">
                <PolicyViewer
                    topic={displayProposal.description}
                    synopsis="This proposal outlines the transition to the Autonomous Allocation Protocol (AAP) to address unsustainable energy consumption in Sector 7."
                    conclusion="Immediate implementation of tiered bandwidth throttling and transfer of grid controls to 'Aether-4'."
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

