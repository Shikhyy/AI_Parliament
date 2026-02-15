'use client';

import React, { useMemo } from 'react';
import { useSocket } from '../providers/SocketProvider';

interface QualityMetrics {
  evidenceScore: number;
  diversityScore: number;
  engagementScore: number;
  constructivenessScore: number;
  timestamp?: number;
}

interface QualityMeterProps {
  metrics: QualityMetrics;
}

export const QualityMeter: React.FC<QualityMeterProps> = ({ metrics }) => {

  const overallScore = (metrics.evidenceScore + metrics.diversityScore + metrics.engagementScore + metrics.constructivenessScore) / 4;

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  };

  const getColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!metrics) {
    return (
      <div className="bg-surface-dark border border-white/10 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quality Metrics</h3>
        <p className="text-xs text-slate-600">Calculating...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-dark border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Debate Quality</h3>
        <div className={`text-2xl font-bold ${getColor(overallScore)}`}>
          {getGrade(overallScore)}
        </div>
      </div>

      <div className="space-y-3">
        <MetricBar label="Evidence" score={metrics.evidenceScore} icon="📊" />
        <MetricBar label="Diversity" score={metrics.diversityScore} icon="🌈" />
        <MetricBar label="Engagement" score={metrics.engagementScore} icon="💬" />
        <MetricBar label="Constructive" score={metrics.constructivenessScore} icon="🏗️" />
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Overall Score</span>
          <span className={`font-bold ${getColor(overallScore)}`}>
            {overallScore.toFixed(1)}/100
          </span>
        </div>
      </div>
    </div>
  );
};

const MetricBar: React.FC<{ label: string; score: number; icon: string }> = ({ label, score, icon }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="text-xs font-mono text-slate-300">{score.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-yellow-500 transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
