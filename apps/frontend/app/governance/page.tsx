'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import { CONTRACTS } from '@/lib/contracts';
import { ProposalModal } from '@/components/governance/ProposalModal';

// Contract Config
const GOVERNANCE_ADDRESS = process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS as `0x${string}`;

export default function GovernancePage() {
    const [proposals, setProposals] = useState<any[]>([]);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess) {
            toast.success('Vote Cast Successfully!');
        }
    }, [isSuccess]);

    const handleVote = (proposalId: bigint, support: boolean) => {
        writeContract({
            address: GOVERNANCE_ADDRESS,
            abi: CONTRACTS.DAO_GOVERNANCE.abi,
            functionName: 'vote',
            args: [proposalId, support]
        });
    };

    // Proposal Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch total proposal count
    const { data: proposalCount } = useReadContract({
        address: GOVERNANCE_ADDRESS,
        abi: CONTRACTS.DAO_GOVERNANCE.abi,
        functionName: 'proposalCounter',
    });

    // Fallback data if no proposals exist yet (for initialization)
    useEffect(() => {
        if (!proposalCount || Number(proposalCount) === 0) {
            setProposals([
                {
                    proposalId: 1,
                    description: "Ratify L2 Resource Allocation Protocol",
                    votesFor: 120500n,
                    votesAgainst: 45000n,
                    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3), // 3 days left
                    executed: false,
                    passed: false
                },
                {
                    proposalId: 2,
                    description: "Increase Agent Reputation Threshold",
                    votesFor: 80000n,
                    votesAgainst: 90000n,
                    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 1), // 1 day left
                    executed: false,
                    passed: false
                }
            ]);
        }
    }, [proposalCount]);

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 selection:bg-primary/30 flex flex-col">
            <Navbar />
            <Toaster position="bottom-right" />
            <ProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="max-w-7xl mx-auto px-6 py-12 w-full">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-500">
                        Governance Chamber
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Vote on protocol upgrades, agent admissions, and treasury allocations. The future of the Parliament is in your hands.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create Proposal Card */}
                    <GlassPanel
                        className="p-6 rounded-xl border-dashed border-2 border-white/10 hover:border-primary/50 flex flex-col items-center justify-center text-center group cursor-pointer h-full min-h-[250px]"
                        hoverEffect={true}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                            <span className="material-icons text-3xl group-hover:text-primary transition-colors">add</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">New Proposal</h3>
                        <p className="text-xs text-slate-400">Submit a new motion for parliament review directly to the blockchain.</p>
                    </GlassPanel>

                    {/* Proposal List */}
                    {proposals.map((proposal) => (
                        <Link href={`/proposal/${proposal.proposalId}`} key={proposal.proposalId}>
                            <GlassPanel className="p-6 rounded-xl border-white/10 h-full flex flex-col justify-between" hoverEffect={true}>
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2 py-1 bg-white/5 text-[10px] font-bold uppercase tracking-widest rounded border border-white/10 text-slate-400">
                                            #{Number(proposal.proposalId).toString().padStart(3, '0')}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-[10px] uppercase font-bold text-green-500">Active</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4 line-clamp-2">{proposal.description}</h3>

                                    {/* Vote Progress */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-primary font-bold">For: {(Number(proposal.votesFor) / 1000).toFixed(1)}k</span>
                                            <span className="text-red-400 font-bold">Against: {(Number(proposal.votesAgainst) / 1000).toFixed(1)}k</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${Number(proposal.votesFor) / (Number(proposal.votesFor) + Number(proposal.votesAgainst) || 1) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Voting Actions */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleVote(proposal.proposalId, true);
                                            }}
                                            disabled={isPending}
                                            className="py-2 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/50 rounded font-bold uppercase text-xs transition-all"
                                        >
                                            Vote For
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleVote(proposal.proposalId, false);
                                            }}
                                            disabled={isPending}
                                            className="py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 rounded font-bold uppercase text-xs transition-all"
                                        >
                                            Vote Against
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <span className="text-xs text-slate-500">
                                        Ends in {Math.max(0, Math.ceil((Number(proposal.deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))} days
                                    </span>
                                    <button className="text-primary text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                                        View Details &rarr;
                                    </button>
                                </div>
                            </GlassPanel>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
