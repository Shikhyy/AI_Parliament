'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Toaster, toast } from 'react-hot-toast';

import { PARLIAMENT_TOKEN_ABI } from '@/lib/contracts';

// System Artifacts
const CIVIC_HONORS = [
    {
        id: 1,
        name: "Consensus Medal",
        rarity: "Legendary",
        material: "Virtual Hammered Copper",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdnfA7S7VKqNAXFrDgzKSqs--QUTcwsk1Qud7RafSS_QSsXSU6wOv-WBlgbKQjv6mwedTLAC3p2UFGB06t_Othau7NoVyuWXmVKNKMCph0UrSqMr1iy8Lh8QKC3DITwwKR7dGezef0EcX89NGtgFIeAtMnBqVOdZlNk4HGRQVfUGUm0IvT11KDMNWDafX3Q2_WUG8hLBYQ0n02OPecY6KFb1neaCt_pUlGR9q7t6cYbgtJFRpZuDh4SQuucR8anteH-XfoIf-UoBA",
        description: "Awarded to parliament members who have successfully participated in 50 consecutive governance votes without abstaining.",
        mintDate: "12.04.24",
        contract: "0x8f3b...2a9c"
    },
    {
        id: 2,
        name: "The Auditor's Eye",
        rarity: "Rare",
        material: "Obsidian",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyeX30PseRZtt6xqPPbjoe03DjPC7BSi1ICOVOKHxuG_NjFXl7YsU64KWfAzBTX8iSlIDz-spoE4DobNgBIyAqw2VRUDVKfCJKid-F4pMyX7tCL_Gwap4RVPO-Z_2t2vnh3fNgGCgw0f4yQl607_8PyOa54PrHBScNZi9C0d9xjMFL9IbiINVz1z4PbgNksZ8ohocX9jdYStMetNKvwvbpAJd7nmJdnXs8WCdq8GPqxxsRXoSEtSd7n_GKbgBDY2OHy5DJtZbUUNM",
        description: "Granted to agents who detect critical vulnerabilities in proposed legislation.",
        mintDate: "11.15.24",
        contract: "0x7a2d...9b1f"
    },
    {
        id: 3,
        name: "Governance Key",
        rarity: "Common",
        material: "Gold",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCP4fLt2tfOf3ej8DrRzeKR_NKS-AxJmEUueG3m_pGyI9-77mxvmlzNWJz7Q90Q2zHQs3Au4CTRFqert8XDQXaUnjCnbZxiWYQ8JQ1TKhUNOMqllJA1_e8BOp1mQ9i2cCBA7-AH5FuLCG2M41xUboZNbB3BIhfDwp-p4YoMBaZn66btuilEOMe9hd6RB3RxJH3T1qtbLoaSLleyILOECKcXyUJ7hbTqIDRJTsHX3j4M5SgPiNhOp048is15asgqJKW12aTu7SXG5Ec",
        description: "Standard access token for high-level DAO voting chambers.",
        mintDate: "10.01.24",
        contract: "0x1c4e...8d3a"
    }
];

export default function BadgeVault() {
    const [selectedBadge, setSelectedBadge] = useState(CIVIC_HONORS[0]);
    const { address, isConnected } = useAccount();
    const [stakeAmount, setStakeAmount] = useState('');
    const [activeTab, setActiveTab] = useState<'artifacts' | 'staking'>('staking');

    // Contract interactions
    const tokenAddress = process.env.NEXT_PUBLIC_PARLIAMENT_TOKEN_ADDRESS as `0x${string}`;
    const { writeContract, data: hash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Read Balance
    const { data: balanceData, refetch: refetchBalance } = useReadContract({
        address: tokenAddress,
        abi: PARLIAMENT_TOKEN_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // Read Staked Balance
    const { data: stakedData, refetch: refetchStaked } = useReadContract({
        address: tokenAddress,
        abi: PARLIAMENT_TOKEN_ABI,
        functionName: 'stakedBalance',
        args: address ? [address] : undefined,
    });

    const formattedBalance = balanceData ? parseFloat(formatEther(balanceData as bigint)).toFixed(2) : '0.00';
    const formattedStaked = stakedData ? parseFloat(formatEther(stakedData as bigint)).toFixed(2) : '0.00';

    // Effects for notifications
    useEffect(() => {
        if (isConfirmed) {
            toast.success('Transaction Confirmed!', {
                style: { background: '#1a1a1a', color: '#10b981', border: '1px solid #10b981' }
            });
            setStakeAmount('');
            refetchBalance();
            refetchStaked();
        }
    }, [isConfirmed, refetchBalance, refetchStaked]);

    const handleStake = async () => {
        if (!stakeAmount || isNaN(Number(stakeAmount))) return;
        try {
            writeContract({
                address: tokenAddress,
                abi: PARLIAMENT_TOKEN_ABI,
                functionName: 'stake',
                args: [parseEther(stakeAmount)]
            });
        } catch (e) {
            console.error(e);
            toast.error('Transaction Failed');
        }
    };

    const handleUnstake = async () => {
        if (!stakeAmount || isNaN(Number(stakeAmount))) return;
        try {
            writeContract({
                address: tokenAddress,
                abi: PARLIAMENT_TOKEN_ABI,
                functionName: 'unstake',
                args: [parseEther(stakeAmount)]
            });
        } catch (e) {
            console.error(e);
            toast.error('Transaction Failed');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col overflow-hidden relative selection:bg-primary selection:text-white">
            <Toaster position="bottom-right" />
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0 bg-radial-gradient(circle at 50% 0%, rgba(236, 164, 19, 0.15) 0%, rgba(19, 14, 11, 0) 70%) pointer-events-none"></div>

            {/* Top Navigation Bar */}
            <nav className="relative z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background-dark">
                            <span className="material-icons text-lg">gavel</span>
                        </div>
                        <span className="text-xl font-bold tracking-widest uppercase text-white">AI Parliament</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
                        <a className="text-gray-400 hover:text-primary transition-colors" href="/debate">CHAMBER</a>
                        <a className="text-primary relative after:absolute after:bottom-[-29px] after:left-0 after:w-full after:h-[2px] after:bg-primary" href="#">VAULT</a>
                        <a className="text-gray-400 hover:text-primary transition-colors" href="/governance">VOTES</a>
                        <a className="text-gray-400 hover:text-primary transition-colors" href="/citizens">CITIZENS</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono">
                            <span className="text-gray-400">BAL:</span> <span className="text-primary">{formattedBalance} PARL</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)]">

                {/* Left Column: Navigation/Filters */}
                <aside className="w-full lg:w-1/4 xl:w-1/5 bg-obsidian/50 border-r border-white/5 flex flex-col backdrop-blur-sm z-20">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4 font-bold">Access</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('staking')}
                                className={`w-full text-left px-4 py-3 rounded text-sm font-medium transition-all ${activeTab === 'staking' ? 'bg-primary text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-icons text-sm">lock_clock</span>
                                    <span>Staking Terminal</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('artifacts')}
                                className={`w-full text-left px-4 py-3 rounded text-sm font-medium transition-all ${activeTab === 'artifacts' ? 'bg-primary text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-icons text-sm">stars</span>
                                    <span>Badge Collection</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {activeTab === 'artifacts' && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <div className="px-2 pb-2 text-xs uppercase tracking-wider text-gray-500 font-bold">Owned Assets</div>
                            {CIVIC_HONORS.map(badge => (
                                <div
                                    key={badge.id}
                                    onClick={() => setSelectedBadge(badge)}
                                    className={`group relative p-3 rounded cursor-pointer transition-all ${selectedBadge.id === badge.id ? 'bg-white/5 border border-primary/30' : 'hover:bg-white/5 border border-transparent hover:border-white/10'}`}
                                >
                                    {selectedBadge.id === badge.id && (
                                        <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#eca413]"></div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <img className={`w-12 h-12 rounded object-cover border border-white/10 transition-all ${selectedBadge.id === badge.id ? '' : 'grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0'}`} src={badge.image} alt={badge.name} />
                                        <div>
                                            <h3 className={`text-sm font-medium transition-colors ${selectedBadge.id === badge.id ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>{badge.name}</h3>
                                            <p className="text-xs text-primary/70">{badge.rarity}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                {/* Center Stage */}
                <section className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-obsidian">
                    {activeTab === 'staking' ? (
                        <div className="w-full max-w-2xl px-6">
                            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>

                                <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight flex items-center gap-3">
                                    <span className="material-icons text-primary">token</span>
                                    Power Staking
                                </h1>
                                <p className="text-slate-400 mb-8 border-b border-white/5 pb-4">
                                    Lock PARL tokens to gain voting power in the Governance Chamber.
                                    <br /><span className="text-xs text-primary/70">1 Staked PARL = 1 Vote</span>
                                </p>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-1">Wallet Balance</label>
                                        <div className="text-2xl font-mono text-white flex items-baseline gap-2">
                                            {formattedBalance} <span className="text-xs text-gray-500">PARL</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                        <label className="text-xs uppercase tracking-wider text-primary/80 font-bold block mb-1">Staked (Voting Power)</label>
                                        <div className="text-2xl font-mono text-primary flex items-baseline gap-2">
                                            {formattedStaked} <span className="text-xs text-primary/60">vPARL</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={stakeAmount}
                                            onChange={(e) => setStakeAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-black/60 border border-white/20 rounded-lg py-4 pl-4 pr-16 text-xl text-white font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">PARL</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handleStake}
                                            disabled={isTxPending || isConfirming || !stakeAmount}
                                            className="py-4 bg-primary hover:bg-yellow-500 text-black font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(236,164,19,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isTxPending ? 'Signing...' : isConfirming ? 'Confirming...' : 'Stake Tokens'}
                                        </button>
                                        <button
                                            onClick={handleUnstake}
                                            disabled={isTxPending || isConfirming || !stakeAmount}
                                            className="py-4 bg-transparent border border-white/20 hover:border-white text-white font-bold uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Unstake
                                        </button>
                                    </div>

                                    {hash && (
                                        <div className="mt-4 p-3 bg-white/5 rounded border-l-2 border-yellow-500 text-xs font-mono text-yellow-500 break-all">
                                            Running: {hash}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Artifact Display (Previous 3D Logic)
                        <div className="relative w-full h-full flex flex-col items-center justify-center pt-10">
                            <div className="absolute top-8 left-0 right-0 text-center z-10 pointer-events-none">
                                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent tracking-tighter select-none">VAULT 01</h1>
                            </div>
                            <div className="relative w-64 h-64 md:w-96 md:h-96 group perspective-1000">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
                                <div className="w-full h-full relative z-10 transition-transform duration-[2000ms] ease-in-out transform hover:scale-105 hover:rotate-y-12">
                                    <img
                                        className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(236,164,19,0.25)]"
                                        src={selectedBadge.image}
                                        alt={selectedBadge.name}
                                    />
                                </div>
                            </div>
                            <div className="mt-[-40px] w-64 h-12 bg-gradient-to-t from-obsidian to-transparent border-t border-white/5 rounded-[100%] blur-sm opacity-80"></div>
                        </div>
                    )}
                </section>

                {/* Right Column: Info Panel */}
                {activeTab === 'artifacts' && (
                    <aside className="w-full lg:w-1/4 xl:w-1/5 bg-background-dark border-l border-white/5 p-8 flex flex-col justify-center z-20 shadow-2xl">
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="h-[1px] w-8 bg-primary"></span>
                                    <span className="text-primary text-xs uppercase tracking-widest font-bold">Details</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white leading-tight">{selectedBadge.name}</h2>
                                <p className="text-gray-400 text-sm mt-2 leading-relaxed">{selectedBadge.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-obsidian p-3 rounded border border-white/5">
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Rarity</span>
                                    <span className="text-white font-mono text-sm">{selectedBadge.rarity}</span>
                                </div>
                                <div className="bg-obsidian p-3 rounded border border-white/5">
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Minted</span>
                                    <span className="text-white font-mono text-sm">{selectedBadge.mintDate}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded bg-primary/5 border border-primary/20">
                                <span className="text-xs text-primary font-bold uppercase block mb-1">Contract</span>
                                <p className="font-mono text-xs text-primary/80 break-all">{selectedBadge.contract}</p>
                            </div>
                        </div>
                    </aside>
                )}
                {activeTab === 'staking' && (
                    <aside className="w-full lg:w-1/4 xl:w-1/5 bg-background-dark border-l border-white/5 p-8 flex flex-col justify-center z-20 shadow-2xl">
                        <div className="space-y-6">
                            <h3 className="text-xs uppercase tracking-widest text-primary font-bold">Staking Rules</h3>
                            <ul className="space-y-4 text-sm text-gray-400 leading-relaxed">
                                <li className="flex gap-3">
                                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                                    Staked tokens are locked but can be unstaked at any time (no cooldown).
                                </li>
                                <li className="flex gap-3">
                                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                                    Voting power is real-time and proportional to stake.
                                </li>
                                <li className="flex gap-3">
                                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                                    You need 1000 vPARL minimum to create new proposals.
                                </li>
                            </ul>
                            <div className="pt-6 border-t border-white/5">
                                <div className="bg-white/5 p-4 rounded text-center">
                                    <span className="block text-2xl font-bold text-white mb-1">4.2%</span>
                                    <span className="text-xs uppercase tracking-wider text-gray-500">Current APY</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}

            </main>

            <footer className="absolute bottom-0 w-full h-8 bg-black/60 backdrop-blur text-gray-600 text-[10px] uppercase tracking-widest flex items-center justify-between px-6 border-t border-white/5 z-30">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> System Online</span>
                    <span>Vault Security: Max</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Network: Base Sepolia</span>
                    <span>Block: #99239402</span>
                    {isConnected && (
                        <span className="text-primary font-bold">PARL Balance: {formattedBalance}</span>
                    )}
                </div>
            </footer>
        </div>
    );

}
