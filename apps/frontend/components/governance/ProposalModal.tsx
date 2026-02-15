'use client';

import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { toast } from 'react-hot-toast';

interface ProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProposalModal({ isOpen, onClose }: ProposalModalProps) {
    const [description, setDescription] = useState('');
    const [type, setType] = useState('0'); // 0 = AddAgent

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    React.useEffect(() => {
        if (isSuccess) {
            toast.success('Proposal Submitted!');
            setDescription('');
            onClose();
        }
    }, [isSuccess, onClose]);

    const handleSubmit = () => {
        if (!description) return;

        writeContract({
            address: process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS as `0x${string}`,
            abi: CONTRACTS.DAO_GOVERNANCE.abi,
            functionName: 'propose',
            args: [
                Number(type),
                description,
                "QmMockIpfsHash" + Date.now() // Mock IPFS hash for now
            ]
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background-dark border border-white/10 rounded-2xl p-8 max-w-lg w-full relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <span className="material-icons">close</span>
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide flex items-center gap-2">
                    <span className="material-icons text-primary">post_add</span>
                    New Proposal
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">Proposal Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary outline-none"
                        >
                            <option value="0">Add New Agent</option>
                            <option value="1">Remove Agent</option>
                            <option value="2">Change Protocol Rules</option>
                            <option value="3">Treasury Allocation</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary outline-none resize-none"
                            placeholder="Describe the motion..."
                        />
                    </div>

                    <div className="bg-primary/5 p-4 rounded border border-primary/20 text-xs text-primary/80">
                        <span className="font-bold block mb-1">Requirement:</span>
                        You must have at least 1000 vPARL staked to submit a proposal.
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isPending || isConfirming || !description}
                        className="w-full py-4 bg-primary hover:bg-yellow-500 text-black font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Signing...' : isConfirming ? 'Confirming...' : 'Submit Proposal'}
                    </button>

                    {hash && (
                        <div className="text-center text-xs text-yellow-500 font-mono break-all">
                            TX: {hash}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
