'use client';

import { LandingPage } from '@/components/stitch/LandingPage';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
    return (
        <main className="min-h-screen w-full">
            <Navbar />
            <LandingPage />
        </main>
    );
}

