'use client';

import React, { useState } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';

interface StatementReaction {
  statementId: string;
  agentId: string;
  type: '👍' | '🤔' | '❗' | '📊';
  timestamp: number;
}

const reactionTypes = ['👍', '🤔', '❗', '📊'] as const;

export const StatementReactions: React.FC<{ statementId: string }> = ({ statementId }) => {
  const { socket, debateState } = useSocket();
  const [showReactions, setShowReactions] = useState(false);

  const statement = debateState?.statements.find(s => s.id === statementId);
  const reactions = statement?.reactions || [];

  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleReact = (type: (typeof reactionTypes)[number]) => {
    if (!socket) return;
    
    socket.emit('add_reaction', {
      statementId,
      reactionType: type,
    });
    
    setShowReactions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="text-xs text-slate-600 hover:text-primary transition-colors flex items-center gap-1"
      >
        <span className="material-icons text-sm">add_reaction</span>
        {reactions.length > 0 && (
          <span className="text-[10px]">({reactions.length})</span>
        )}
      </button>

      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 bg-surface-dark border border-white/10 rounded-lg p-2 flex gap-2 z-10 shadow-xl">
          {reactionTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleReact(type)}
              className="hover:scale-125 transition-transform text-xl"
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {Object.keys(reactionCounts).length > 0 && (
        <div className="flex gap-2 mt-1">
          {Object.entries(reactionCounts).map(([type, count]) => (
            <span
              key={type}
              className="text-xs bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              <span>{type}</span>
              <span className="text-slate-500">{count as number}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
