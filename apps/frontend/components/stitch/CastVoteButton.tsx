'use client';

import React from 'react';
import { useAccount, useWriteContract } from 'wagmi';

export function CastVoteButton() {
    const { writeContract, isPending, isSuccess } = useWriteContract();
    const { isConnected } = useAccount();

    const handleVote = () => {
        if (!isConnected) return;

        // Ensure address is present
        const governanceAddress = process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS;
        if (!governanceAddress) {
            console.error("DAO Governance Address not set");
            return;
        }

        writeContract({
            address: governanceAddress as `0x${string}`,
            abi: [{
                "inputs": [
                    { "internalType": "uint256", "name": "proposalId", "type": "uint256" },
                    { "internalType": "bool", "name": "support", "type": "bool" }
                ],
                "name": "vote",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }],
            functionName: 'vote',
            args: [BigInt(1), true], // Voting "Yes" on Proposal 1 for demo
        });
    };

    return (
        <button
            onClick={handleVote}
            disabled={!isConnected || isPending}
            className={`bg-primary text-black font-bold px-6 py-2 rounded text-xs uppercase tracking-wider hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(242,185,13,0.5)] transition-all flex items-center gap-2 ${(!isConnected || isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className="material-icons text-sm">gavel</span>
            {isPending ? 'Signing...' : isSuccess ? 'Voted!' : 'Cast Vote (Pro)'}
        </button>
    );
}
