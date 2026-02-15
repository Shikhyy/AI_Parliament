import React from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, if not I will just use standard class template literals or create it.

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassPanel = ({ children, className, hoverEffect = true, ...props }: GlassPanelProps) => {
    return (
        <div
            className={`glass-panel rounded-xl p-6 ${hoverEffect ? 'hover:border-primary/40 transition-colors' : ''} ${className || ''}`}
            {...props}
        >
            {children}
        </div>
    );
};
