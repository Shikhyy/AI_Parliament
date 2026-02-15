
import { spawn } from 'child_process';
import path from 'path';

// Path to the MCP server
const SERVER_PATH = path.join(__dirname, '../dist/index.js');

console.log('🚀 Starting Integration Test for Parliament MCP...');

// Spawn the server process
const server = spawn('node', [SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'inherit'], // Pipe stdin/stdout, inherit stderr for logs
    env: { ...process.env, PORT: '3001', WS_PORT: '3002' } // Use standard ports for frontend sync
});

let messageId = 0;
const pendingRequests = new Map();

// Helper to send JSON-RPC requests
function sendRequest(method: string, params: any = {}) {
    const id = messageId++;
    const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
    };
    const json = JSON.stringify(request);
    console.log(`\n📤 Sending Request: ${method}`);
    server.stdin.write(json + '\n');
    return new Promise((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });
        // Timeout
        setTimeout(() => {
            if (pendingRequests.has(id)) {
                reject(new Error(`Timeout waiting for response to ${method}`));
                pendingRequests.delete(id);
            }
        }, 5000);
    });
}

// Helper to send JSON-RPC notifications
function sendNotification(method: string, params: any = {}) {
    const request = {
        jsonrpc: '2.0',
        method,
        params
    };
    const json = JSON.stringify(request);
    console.log(`\n📤 Sending Notification: ${method}`);
    server.stdin.write(json + '\n');
}

// Handle incoming data (JSON-RPC responses)
server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const response = JSON.parse(line);
            console.log(`📥 Received:`, JSON.stringify(response).slice(0, 100) + '...');

            if (response.id !== undefined && pendingRequests.has(response.id)) {
                const { resolve, reject } = pendingRequests.get(response.id);
                if (response.error) reject(response.error);
                else resolve(response.result);
                pendingRequests.delete(response.id);
            }
        } catch (e) {
            // Include non-JSON logs from server (if any slip through)
            console.log(`[SERVER LOG]: ${line}`);
        }
    }
});

async function runTests() {
    try {
        // 1. Initialize
        await sendRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: { roots: { listChanged: true } },
            clientInfo: { name: 'integration-test', version: '1.0.0' }
        });
        sendNotification('notifications/initialized');
        console.log('✅ Initialization successful');

        // 2. List Tools
        const toolsRes: any = await sendRequest('tools/list');
        const toolNames = toolsRes.tools.map((t: any) => t.name);
        console.log('✅ Tools found:', toolNames);
        if (!toolNames.includes('start_debate')) throw new Error('Missing start_debate tool');

        // 3. Start Debate
        console.log('Testing start_debate...');
        await sendRequest('tools/call', {
            name: 'start_debate',
            arguments: { topic: "Should AI be granted legal personhood?" }
        });
        console.log('✅ Debate started');

        // 4. Submit Statement
        console.log('Testing submit_statement...');
        await sendRequest('tools/call', {
            name: 'submit_statement',
            arguments: {
                agentId: "utilitarian_01",
                content: "From a utilitarian perspective, legal personhood maximizes utility by ensuring accountability."
            }
        });
        console.log('✅ Statement submitted');

        console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
        console.log('⏳ Waiting 60 seconds for Frontend Verification... Go to http://localhost:3000/debate');
        await new Promise(resolve => setTimeout(resolve, 60000));

        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    } finally {
        server.kill();
    }
}

// Wait a second for process to startup then run
setTimeout(runTests, 2000);
