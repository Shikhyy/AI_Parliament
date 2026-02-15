/**
 * Fixed Integration Test: AI Parliament Full Archestra Flow
 * 
 * This test verifies the complete system implementation including:
 * - Environment validation
 * - Agent orchestrator with error handling
 * - Memory management
 * - Quality metrics
 * - Debate pool management
 */

import { DebateEngine } from '../dist/debate/engine.js';
import { ArchestraOrchestrator } from '../dist/archestra/orchestrator.js';
import { AGENT_REGISTRY } from '../dist/agents/registry.js';
import { MemoryManager } from '../dist/services/agentMemory.js';
import { QualityAnalyzer } from '../dist/services/qualityMetrics.js';
import { DebatePool } from '../dist/services/debatePool.js';
import { validateEnv } from '../dist/config/env.js';
import { logger } from '../dist/utils/logger.js';

const TEST_TIMEOUT = 60000; // 60 seconds

async function runIntegrationTests() {
    console.log('\n=====================================');
    console.log('AI PARLIAMENT INTEGRATION TEST SUITE');
    console.log('=====================================\n');

    let passCount = 0;
    let failCount = 0;

    // Test 0: Environment Validation
    try {
        console.log('TEST 0: Environment Validation');
        validateEnv();
        console.log('  ✓ Environment configuration validated');
        passCount++;
    } catch (error: any) {
        console.error('  ✗ Failed:', error.message);
        failCount++;
    }

    // Test 1: Archestra Orchestrator Initialization
    try {
        console.log('\nTEST 1: Archestra Orchestrator Initialization');
        const orchestrator = new ArchestraOrchestrator();
        console.log('  ✓ Orchestrator created');
        console.log(`  ✓ Agent registry loaded with ${Object.keys(AGENT_REGISTRY).length} agents`);
        passCount++;
    } catch (error: any) {
        console.error('  ✗ Failed:', error.message);
        failCount++;
    }

    // Test 2: Debate Pool Management
    try {
        console.log('\nTEST 2: Debate Pool Management');
        const pool = new DebatePool();
        const debateId1 = pool.createDebate('AI Safety', 'Testing debate pool');
        const debateId2 = pool.createDebate('Climate Policy', 'Testing concurrent debates');
        
        console.log(`  ✓ Created debate 1: ${debateId1}`);
        console.log(`  ✓ Created debate 2: ${debateId2}`);
        console.log(`  ✓ Active debates: ${pool.getActiveDebateCount()}`);
        
        const debate1 = pool.getDebate(debateId1);
        if (!debate1) throw new Error('Debate 1 not found');
        
        console.log(`  ✓ Retrieved debate successfully`);
        passCount++;
    } catch (error: any) {
        console.error('  ✗ Failed:', error.message);
        failCount++;
    }

    // Test 3: Memory Management
    try {
        console.log('\nTEST 3: Agent Memory System');
        const memoryManager = new MemoryManager();
        const memory = memoryManager.getMemory('test_agent');
        
        console.log('  ✓ Memory manager initialized');
        console.log('  ✓ Agent memory created');
        
        const testStatement = {
            id: 'test_1',
            debateId: 'test_debate',
            agentId: 'test_agent',
            content: 'This is a test statement with important keywords about climate change and policy implementation.',
            timestamp: Date.now(),
            phase: 'initial_positions' as const,
            toolsUsed: [],
            citations: ['climate study', 'policy paper'],
        };
        
        memory.addStatement(testStatement);
        const stats = memory.getStats();
        
        console.log(`  ✓ Statement added to memory`);
        console.log(`  ✓ Memory stats: ${stats.totalStatements} statements, ${stats.keyPointsTracked} key points`);
        passCount++;
    } catch (error: any) {
        console.error('  ✗ Failed:', error.message);
        failCount++;
    }

    // Test 4: Quality Metrics
    try {
        console.log('\nTEST 4: Quality Metrics Calculation');
        const analyzer = new QualityAnalyzer();
        const engine = new DebateEngine('Test Topic');
        
        // Add some test statements
        engine.recordStatement('agent1', 'First position with evidence and citations', ['web_search']);
        engine.recordStatement('agent2', 'Second position with different perspective', []);
        engine.recordStatement('agent1', 'Response with more evidence', ['calculator']);
        
        const metrics = analyzer.calculateMetrics(engine.getState());
        const grade = analyzer.getQualityGrade(metrics);
        
        console.log('  ✓ Metrics calculated successfully');
        console.log(`  ✓ Evidence Score: ${metrics.evidenceScore.toFixed(1)}/100`);
        console.log(`  ✓ Diversity Score: ${metrics.diversityScore.toFixed(1)}/100`);
        console.log(`  ✓ Engagement Score: ${metrics.engagementScore.toFixed(1)}/100`);
        console.log(`  ✓ Constructiveness: ${metrics.constructivenessScore.toFixed(1)}/100`);
        console.log(`  ✓ Overall Grade: ${grade}`);
        passCount++;
    } catch (error: any) {
        console.error('  ✗ Failed:', error.message);
        failCount++;
    }

    // Test 5: Agent Response Generation (if API key available)
    try {
        console.log('\nTEST 5: Agent Response Generation');
        const engine = new DebateEngine('Should we implement universal basic income?');
        const agents = await engine.suggestAgents('universal basic income', 3);
        engine.setAgents(agents.map(a => a.id));

        console.log(`  ✓ Selected ${agents.length} agents: ${agents.map(a => a.name).join(', ')}`);

        if (!process.env.ANTHROPIC_API_KEY) {
            console.warn('  ⚠ ANTHROPIC_API_KEY not set - testing fallback mode');
            const statement = await engine.generateAgentResponse(agents[0].id);
            console.log(`  ✓ Fallback response generated: "${statement.content.substring(0, 60)}..."`);
        } else {
            console.log('  ℹ Invoking Claude API...');
            const statement = await engine.generateAgentResponse(agents[0].id);
            console.log(`  ✓ AI-generated response: "${statement.content.substring(0, 80)}..."`);
        }
        
        passCount++;
    } catch (error: any) {
        console.error('  ✗ Failed:', error.message);
        failCount++;
    }

    // Test 6: Coalition Formation
    try {
        console.log('\nTEST 6: Coalition Formation');
        const engine = new DebateEngine('Test Coalition');
        engine.setAgents(['utilitarian', 'environmental', 'ethical']);
        
        const coalition = engine.formCoalition(
            ['utilitarian', 'environmental'],
            'Both agree on long-term sustainability',
            'Shared concern for future welfare'
        );
        
        console.log(`  ✓ Coalition formed: ${coalition.agentIds.join(' + ')}`);
        console.log(`  ✓ Shared position: "${coalition.sharedPosition}"`);
        console.log(`  ✓ Coalition strength: ${coalition.strength * 100}%`);
        passCount++;
    } catch (error: any) {
        console.error('  ✗ Failed:', error.message);
        failCount++;
    }

    // Test Summary
    console.log('\n=====================================');
    console.log('TEST SUMMARY');
    console.log('=====================================');
    console.log(`✓ Passed: ${passCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`Total: ${passCount + failCount}`);
    console.log('=====================================\n');

    if (failCount > 0) {
        console.error('❌ Some tests failed. Please review the errors above.');
        process.exit(1);
    } else {
        console.log('✅ ALL TESTS PASSED!');
        console.log('🎉 AI Parliament system is fully operational!\n');
        process.exit(0);
    }
}

// Run tests
runIntegrationTests().catch((error) => {
    console.error('\n❌ CRITICAL ERROR:', error);
    process.exit(1);
});
