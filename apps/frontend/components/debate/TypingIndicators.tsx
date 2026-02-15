'use client';

import React from 'react';

interface TypingIndicatorsProps {
  agents: string[];
}

export const TypingIndicators: React.FC<TypingIndicatorsProps> = ({ agents }) => {
  if (agents.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-l-2 border-primary/40 rounded-r animate-pulse">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
      </div>
      <span className="text-xs text-primary font-mono">
        {agents.join(', ')} {agents.length === 1 ? 'is' : 'are'} thinking...
      </span>
    </div>
  );
};
