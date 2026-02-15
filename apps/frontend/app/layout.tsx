import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { SocketProvider } from '@/components/providers/SocketProvider'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'AI Parliament',
    description: 'A 3D Parliament of AI Agents',
    icons: {
        icon: '/icon.svg',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={spaceGrotesk.className}>
                <Web3Provider>
                    <SocketProvider>
                        {children}
                    </SocketProvider>
                </Web3Provider>
            </body>
        </html>
    )
}
