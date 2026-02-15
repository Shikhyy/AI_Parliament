'use client';

import React, { useState } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';


interface Coalition {
  id: string;
  agentIds: string[];
  sharedPosition: string;
  strength: number;
  formationReason?: string;
}

interface CoalitionViewerProps {
  coalitions: Coalition[];
}

export const CoalitionViewer: React.FC<CoalitionViewerProps> = ({ coalitions }) => {
  const [selectedCoalition, setSelectedCoalition] = useState<string | null>(null);

  if (coalitions.length === 0) {
    return (
      <div className="bg-surface-dark border border-white/10 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">🤝</div>
        <h3 className="text-sm font-bold text-slate-400 mb-1">No Coalitions Formed</h3>
        <p className="text-xs text-slate-600">
          Alliances will appear as agents find common ground
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-dark border border-white/10 rounded-xl p-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Active Coalitions ({coalitions.length})
      </h3>

      <div className="space-y-3">
        {coalitions.map((coalition) => (
          <div
            key={coalition.id}
            className={`border rounded-lg p-3 cursor-pointer transition-all ${
              selectedCoalition === coalition.id
                ? 'border-primary bg-primary/5'
                : 'border-white/10 hover:border-white/20'
            }`}
            onClick={() => setSelectedCoalition(
              selectedCoalition === coalition.id ? null : coalition.id
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤝</span>
                <div>
                  <div className="text-xs font-bold text-white">
                    {coalition.agentIds.length} Members
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {coalition.id.substring(0, 8)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="text-xs text-primary font-bold">
                  {Math.round(coalition.strength * 100)}%
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-2 line-clamp-2">
              {coalition.sharedPosition}
            </p>

            {selectedCoalition === coalition.id && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                  Members
                </div>
                <div className="flex flex-wrap gap-2">
                  {coalition.agentIds.map((agentId) => (
                    <span
                      key={agentId}
                      className="px-2 py-1 bg-primary/10 border border-primary/30 rounded text-[10px] text-primary font-mono"
                    >
                      {agentId}
                    </span>
                  ))}
                </div>
                {coalition.formationReason && (
                  <div className="mt-2 text-xs text-slate-400 italic">
                    "{coalition.formationReason}"
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
