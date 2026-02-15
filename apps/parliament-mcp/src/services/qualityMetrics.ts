import { DebateState, Statement } from '../debate/types';

export interface QualityMetrics {
  evidenceScore: number;        // 0-100: How many citations used
  diversityScore: number;        // 0-100: Viewpoint variety
  engagementScore: number;       // 0-100: Agent participation balance
  constructivenessScore: number; // 0-100: Substantive vs ad hominem
  timestamp: number;
}

export class QualityAnalyzer {

  calculateMetrics(state: DebateState): QualityMetrics {
    return {
      evidenceScore: this.calculateEvidenceScore(state.statements),
      diversityScore: this.calculateDiversityScore(state),
      engagementScore: this.calculateEngagementScore(state),
      constructivenessScore: this.calculateConstructivenessScore(state.statements),
      timestamp: Date.now(),
    };
  }

  private calculateEvidenceScore(statements: Statement[]): number {
    if (statements.length === 0) return 0;

    const totalCitations = statements.reduce((sum, s) => sum + (s.citations?.length || 0), 0);
    const avgCitations = totalCitations / statements.length;

    // Score: 0-100, where 2+ citations per statement = 100
    return Math.min(100, (avgCitations / 2) * 100);
  }

  private calculateDiversityScore(state: DebateState): number {
    if (state.statements.length === 0) return 0;

    // Check how many unique agents have spoken
    const uniqueSpeakers = new Set(state.statements.map(s => s.agentId));
    const speakerRatio = uniqueSpeakers.size / Math.max(1, state.activeAgents.length);

    // Check distribution of statements across agents
    const statementCounts = new Map<string, number>();
    state.statements.forEach(s => {
      statementCounts.set(s.agentId, (statementCounts.get(s.agentId) || 0) + 1);
    });

    // Calculate standard deviation of participation
    const counts = Array.from(statementCounts.values());
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    // Lower std dev = more balanced = higher score
    const balanceScore = Math.max(0, 100 - (stdDev * 10));

    return (speakerRatio * 50) + (balanceScore * 0.5);
  }

  private calculateEngagementScore(state: DebateState): number {
    if (state.statements.length === 0 || state.activeAgents.length === 0) return 0;

    const statementCounts = new Map<string, number>();
    state.statements.forEach(s => {
      statementCounts.set(s.agentId, (statementCounts.get(s.agentId) || 0) + 1);
    });

    const avgStatements = state.statements.length / state.activeAgents.length;
    const minExpected = 2; // Expect at least 2 statements per agent

    // How many agents have spoken at least minExpected times?
    let activeCount = 0;
    statementCounts.forEach(count => {
      if (count >= minExpected) activeCount++;
    });

    const activeRatio = activeCount / state.activeAgents.length;

    return activeRatio * 100;
  }

  private calculateConstructivenessScore(statements: Statement[]): number {
    if (statements.length === 0) return 100;

    // Heuristic: statements with tools/citations are more constructive
    let constructiveCount = 0;
    statements.forEach(s => {
      const hasEvidence = (s.citations?.length || 0) > 0 || (s.toolsUsed?.length || 0) > 0;
      const isReasonablyLong = s.content.length > 50;

      if (hasEvidence && isReasonablyLong) {
        constructiveCount++;
      }
    });

    return (constructiveCount / statements.length) * 100;
  }

  getQualityGrade(metrics: QualityMetrics): string {
    const overall = (
      metrics.evidenceScore +
      metrics.diversityScore +
      metrics.engagementScore +
      metrics.constructivenessScore
    ) / 4;

    if (overall >= 90) return 'A+ Exceptional';
    if (overall >= 80) return 'A Strong';
    if (overall >= 70) return 'B+ Good';
    if (overall >= 60) return 'B Fair';
    if (overall >= 50) return 'C Needs Improvement';
    return 'D Poor';
  }

  generateReport(state: DebateState): string {
    const metrics = this.calculateMetrics(state);
    const grade = this.getQualityGrade(metrics);

    return `
📊 Debate Quality Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Grade: ${grade}

Evidence Usage:      ${metrics.evidenceScore.toFixed(1)}/100
Viewpoint Diversity: ${metrics.diversityScore.toFixed(1)}/100
Agent Engagement:    ${metrics.engagementScore.toFixed(1)}/100
Constructiveness:    ${metrics.constructivenessScore.toFixed(1)}/100

Statements: ${state.statements.length}
Active Agents: ${state.activeAgents.length}
Consensus: ${state.consensusScore}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}
