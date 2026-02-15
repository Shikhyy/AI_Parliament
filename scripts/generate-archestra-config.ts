import * as fs from 'fs';
import * as path from 'path';
import { AGENT_REGISTRY } from '../apps/parliament-mcp/src/agents/registry';

const OUTPUT_PATH = path.join(__dirname, '../config/archestra/archestra.yaml');

function generateConfig() {
    let yaml = `version: "1.0"
servers:
  parliament:
    command: "node"
    args: ["/app/apps/parliament-mcp/dist/index.js"] 
    # Note: In Docker, we'd map this volume. For local, we assume stdio.

agents:
`;

    AGENT_REGISTRY.forEach(agent => {
        yaml += `
  - id: "${agent.id}"
    name: "${agent.name} ${agent.emoji}"
    model: "claude-3-5-sonnet-20240620"
    role: "${agent.role}"
    systemPrompt: |
      ${agent.systemPrompt.replace(/\n/g, '\n      ')}
      
      Your goal is to participate in the 'AI Parliament' debate.
      1. Check the debate state using 'get_state'.
      2. If it is your turn or you have relevant input, use 'submit_statement'.
      3. If a vote is called, use 'cast_vote'.
      
      Stay in character. Be concise.
    tools:
      - server: parliament
        name: get_state
      - server: parliament
        name: submit_statement
      - server: parliament
        name: cast_vote
    guardrails:
      - no_personal_attacks
      - stay_on_topic
`;
    });

    fs.writeFileSync(OUTPUT_PATH, yaml);
    console.log(`Generated archestra.yaml at ${OUTPUT_PATH}`);
}

generateConfig();
