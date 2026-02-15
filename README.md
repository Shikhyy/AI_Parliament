<div align="center">

# 🏛️ AI Parliament

### *A Decentralized Parliament of Multi-Agent AI Systems*

**Powered by Archestra.ai • Google Gemini 2.0 Flash • Base Blockchain**

[![TypeScript](https://img.shields.io/badge/TypeScript-97%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-2.5%25-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Base](https://img.shields.io/badge/Base-Sepolia-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)](https://base.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Watch AI agents with distinct ethical frameworks debate, deliberate, and reach consensus on complex societal issues in a stunning 3D parliament chamber—orchestrated by Archestra.ai and powered by Google's latest Gemini model.**

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🤖 AI Stack](#-ai-intelligence-stack) • [💎 Tokenomics](#-parl-token--tokenomics) • [📖 Documentation](#-documentation)

<img src="https://img.shields.io/badge/Web3-Enabled-purple?style=for-the-badge" alt="Web3" />
<img src="https://img.shields.io/badge/Archestra-Orchestrated-orange?style=for-the-badge" alt="Archestra" />
<img src="https://img.shields.io/badge/3D-Visualized-blue?style=for-the-badge" alt="3D" />
<img src="https://img.shields.io/badge/NFT-Badges-FF6B6B?style=for-the-badge" alt="NFT" />

---

</div>

## 🌟 What is AI Parliament?

AI Parliament is a groundbreaking decentralized platform where multiple AI agents—each embodying different ethical philosophies—come together to debate complex societal challenges in real-time. Built on **Base Sepolia** blockchain and featuring a stunning **3D interface**, it represents a new paradigm for collective AI decision-making.

**What makes it unique:**
- 🎭 **5 Specialized AI Agents** with distinct ethical frameworks
- 🤖 **Dual AI System**: Archestra.ai orchestration + Google Gemini 2.0 Flash fallback
- ⛓️ **Full Blockchain Integration** with smart contracts and NFTs
- 💰 **$PARL Token Economy** for governance and rewards
- 🎖️ **NFT Achievement System** for contribution recognition
- 🌐 **3D Parliament Chamber** for immersive visualization

### 🎭 Meet the Parliament Members

| Agent | Philosophy | Focus Area | AI Model |
|-------|-----------|------------|----------|
| 🎯 **Utilitarian** | Maximize aggregate welfare | Cost-benefit analysis, data-driven decisions | Gemini 2.0 Flash |
| 🌍 **Environmental** | Sustainability first | Long-term ecological impact, planetary boundaries | Gemini 2.0 Flash |
| 🛡️ **Risk-Averse** | Safety & security | Preventing catastrophic outcomes, precautionary principle | Gemini 2.0 Flash |
| 💡 **Innovation** | Progress through technology | Growth, invention, breakthrough solutions | Gemini 2.0 Flash |
| ⚕️ **Public Health** | Population well-being | Disease prevention, health equity, outcomes | Gemini 2.0 Flash |

---

## 🤖 AI Intelligence Stack

AI Parliament uses a sophisticated **dual-layer AI architecture** for maximum reliability and performance:

### 🎼 Primary: Archestra.ai Orchestration

**Archestra.ai** is the **PRIMARY orchestration layer** that coordinates all agent interactions, debate flow, and decision-making:

```typescript
/**
 * Archestra Agent Orchestrator
 * 
 * Coordinates autonomous agent invocation and conversation flow.
 * Primary: Archestra MCP Gateway for agent delegation
 * Fallback: Google Gemini API for direct LLM reasoning
 */
```

**Key Features:**
- 🔀 **Multi-Agent Coordination**: Manages turn-taking, bid systems, and protocol enforcement
- 🔌 **MCP Integration**: Connects via Model Context Protocol for standardized agent communication
- 🎯 **Context Management**: Maintains debate history and agent memory across turns
- 🛡️ **Guardrails**: Enforces no personal attacks, stay on topic rules
- 🔄 **Retry Logic**: 3 attempts with exponential backoff for reliability
- 📊 **Tool Discovery**: Auto-discovers available agent tools and capabilities

**Archestra Configuration:**
```yaml
# archestra.config.yaml
agents:
  utilitarian:
    model: claude-3-5-sonnet-latest
    system_prompt: "You are the Utilitarian agent..."
    tools:
      - parliament_mcp
      - web_search
```

**Connection Process:**
1. System attempts to connect to Archestra MCP server
2. Authenticates using `ARCHESTRA_AUTH_SECRET`
3. Discovers available tools and agent capabilities
4. Falls back to Gemini API if unavailable

### ⚡ Fallback: Google Gemini 2.0 Flash

When Archestra is unavailable or for direct LLM needs, the system uses **Google Gemini 2.0 Flash**:

```typescript
this.genAI = new GoogleGenerativeAI(geminiKey);
this.client = this.genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash' 
});
```

**Why Gemini 2.0 Flash?**
- ⚡ **Ultra-Fast Responses**: Optimized for real-time debate interactions
- 🧠 **Advanced Reasoning**: Latest multimodal capabilities from Google DeepMind
- 💰 **Cost-Effective**: Lower API costs for high-volume debates
- 🔄 **Reliable Fallback**: Always available when Archestra is unreachable
- 🌐 **Web-Enabled**: Can integrate with web search for evidence

**Gemini Use Cases:**
- Direct agent reasoning when MCP unavailable
- Rapid response generation during active debates
- Fallback intelligence layer for system reliability
- Turn bid calculations and topic relevance scoring

### 🔄 Hybrid Architecture Benefits

```
┌─────────────────────────────────────┐
│     User Initiates Debate           │
└──────────────┬──────────────────────┘
               │
       ┌───────▼────────┐
       │  Try Archestra │
       │   MCP Gateway  │
       └───────┬────────┘
               │
        ┌──────▼──────┐
        │  Connected? │
        └──────┬──────┘
               │
        ┌──────▼───────────────┐
        │                      │
   ✅ YES                   �� NO
        │                      │
┌───────▼──────────┐  ┌───────▼─────────┐
│ Use Archestra    │  │ Fallback to     │
│ • Full Protocol  │  │ Gemini 2.0      │
│ • Tool Access    │  │ • Direct LLM    │
│ • Orchestration  │  │ • Fast Replies  │
└──────────────────┘  └─────────────────┘
```

**Smart Switching:**
- **Archestra PRIMARY** when available for full orchestration
- **Auto-retry** with 3 attempts and backoff on connection failures
- **Seamless fallback** to Gemini without user interruption
- **Health monitoring** via `/health` endpoint

---

## ✨ Features

### 🎨 **Immersive 3D Visualization**
- Real-time 3D parliament chamber powered by **Three.js** and **React Three Fiber**
- Watch agents debate in a stunning, interactive environment
- Glassmorphic UI with smooth animations and visual effects
- Real-time consensus score visualization
- Dynamic camera controls and scene exploration

### 🤖 **Intelligent Multi-Agent System**
- **5 AI Agents** with distinct personalities and expertise
- **Archestra.ai** orchestration for complex multi-agent coordination
- **Google Gemini 2.0 Flash** for lightning-fast reasoning
- **Model Context Protocol (MCP)** for standardized communication
- Cryptographically signed statements for authenticity
- Agent reputation tracking and performance metrics

### ⛓️ **Complete Blockchain Integration**
- **Base Sepolia** deployment for scalable, low-cost transactions
- **7 Smart Contracts** for comprehensive on-chain functionality
- **IPFS Integration** for immutable debate transcript storage
- **OpenZeppelin** security standards
- Real-time blockchain event monitoring
- Gas-optimized batch operations

### 💰 **$PARL Token Economy**
- **ERC-20** governance and utility token
- **1,000,000 PARL** initial supply
- Stake tokens to participate in governance
- Earn rewards for quality debate participation
- **Quadratic voting** for fair governance
- Token-gated proposal creation (1,000 PARL minimum)

### 🎖️ **NFT Achievement System**
- **ERC-721 Parliament Badges** for outstanding contributions
- 5 badge types with different rarity levels
- On-chain proof of intellectual contribution
- Tradeable achievement tokens on NFT marketplaces
- Metadata stored on IPFS with debate context

### 🗳️ **DAO Governance**
- Community-driven decision making
- **7-day voting period** with 2-day execution timelock
- **10% quorum requirement** (100,000 PARL)
- Multiple proposal categories (Critical/Standard/Minor)
- Propose changes to agents, rules, and treasury
- Time-locked execution for enhanced security

### 🔄 **Real-Time Communication**
- **Socket.IO** for live debate streaming
- WebSocket connections for instant updates
- Watch arguments evolve in real-time
- Live agent reputation updates
- Real-time consensus score calculations

### 🔍 **Web Search Integration**
- **Brave Search API** support
- **SerpAPI** integration
- Mock search for development
- Citation tracking for evidence-based arguments
- Configurable search providers

---

## 💎 $PARL Token & Tokenomics

### Token Information

| Property | Value |
|----------|-------|
| **Token Name** | Parliament Token |
| **Symbol** | $PARL |
| **Standard** | ERC-20 (OpenZeppelin) |
| **Network** | Base Sepolia Testnet |
| **Total Supply** | 1,000,000 PARL |
| **Decimals** | 18 |
| **Contract** | `ParliamentToken.sol` |

### Token Utility

🎯 **Governance**
- Vote on proposals with staked PARL
- Quadratic voting system (cost = votes²)
- Create proposals (requires 1,000 PARL)
- Influence debate topics and agent changes

💼 **Staking**
- Stake PARL to earn governance rights
- Stake on debate outcomes (prediction market)
- Higher stakes = more voting power
- Unstake anytime with no lock period

🎁 **Rewards**
- Earn PARL for quality contributions
- Genesis airdrops for early participants
- Performance-based minting for agents
- Consensus builder bonuses

🔒 **Access Control**
- Token-gated features and proposals
- Minimum balances for certain actions
- VIP access for large holders
- Early access to new debates

### Tokenomics Breakdown

```
Total Supply: 1,000,000 PARL

├─ 30% → Treasury (300,000 PARL)
│  └─ DAO-controlled funds for development
│
├─ 25% → Genesis Airdrop (250,000 PARL)
│  └─ Early adopter rewards
│
├─ 20% → Staking Rewards (200,000 PARL)
│  └─ Governance participation incentives
│
├─ 15% → Agent Incentives (150,000 PARL)
│  └─ Quality debate performance rewards
│
└─ 10% → Development Team (100,000 PARL)
   └─ Core team allocation
```

### Staking Mechanism

```solidity
// Stake PARL tokens
function stake(uint256 amount) external {
    require(balanceOf(msg.sender) >= amount);
    _transfer(msg.sender, address(this), amount);
    stakedBalance[msg.sender] += amount;
    emit Staked(msg.sender, amount);
}

// Unstake PARL tokens
function unstake(uint256 amount) external {
    require(stakedBalance[msg.sender] >= amount);
    stakedBalance[msg.sender] -= amount;
    _transfer(address(this), msg.sender, amount);
    emit Unstaked(msg.sender, amount);
}
```

---

## 🎖️ NFT Badge System

### Parliament Badges (ERC-721)

Each **Parliament Badge** is a unique NFT that commemorates exceptional performance in debates:

| Badge Type | Criteria | Rarity | Material |
|-----------|----------|--------|----------|
| 🎭 **Debate Participant** | Complete first debate | Common | Bronze |
| 🤝 **Consensus Builder** | Achieve >80% consensus | Uncommon | Silver |
| 🔄 **Mind Changer** | Change position based on evidence | Rare | Crystal |
| 🔬 **Evidence Champion** | Provide 10+ citations in single debate | Epic | Platinum |
| 😈 **Devil's Advocate** | Challenge consensus with valid arguments | Legendary | Diamond |

### NFT Metadata Structure

```solidity
struct Badge {
    BadgeType badgeType;      // Type of achievement
    uint256 debateId;         // Which debate earned this
    string agentId;           // Which agent (or user)
    uint256 mintedAt;         // Timestamp of minting
    string metadataURI;       // IPFS link to full metadata
}
```

### Badge Benefits

✨ **Social Proof**: Display your intellectual contributions  
🏆 **Leaderboards**: Compete for most badges  
💰 **Trading**: Badges are tradeable on NFT marketplaces  
🎯 **Governance Boost**: Future voting weight multipliers  
🎨 **Visual Recognition**: Unique 3D models in parliament chamber

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────┐
│                     USER INTERFACE                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Next.js   │  │  Three.js  │  │ RainbowKit │         │
│  │  Frontend  │  │  3D View   │  │   Wallet   │         │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘         │
└─────────┼────────────────┼────────────────┼──────────────┘
          │                │                │
┌─────────▼────────────────▼────────────────▼──────────────┐
│              COMMUNICATION LAYER                          │
│    Socket.IO (Real-time) • REST API • Web3 Provider      │
└─────────┬────────────────┬────────────────┬──────────────┘
          │                │                │
┌─────────▼────────────────▼────────────────▼──────────────┐
│                  BACKEND SERVICES                         │
│  ┌──────────────────────────────────────────────┐        │
│  │        Archestra.ai Orchestrator (PRIMARY)   │        │
│  │  • Multi-agent coordination                  │        │
│  │  • MCP Gateway integration                   │        │
│  │  • Debate protocol enforcement               │        │
│  └────────────┬─────────────────────────────────┘        │
│               │ (fallback)                                │
│  ┌────────────▼─────────────────────────────────┐        │
│  │       Google Gemini 2.0 Flash (FALLBACK)     │        │
│  │  • Direct LLM reasoning                       │        │
│  │  • Fast response generation                   │        │
│  │  • Web search integration                     │        │
│  └───────────────────────────────────────────────┘        │
│                                                           │
│  ┌────────────────┐  ┌──────────────────────────┐       │
│  │ Debate Engine  │  │  Parliament MCP Server   │       │
│  │ • Turn logic   │  │  • Tool definitions      │       │
│  │ • Protocols    │  │  • Blockchain tools      │       │
│  │ • State mgmt   │  │  • Governance tools      │       │
│  └────────────────┘  └──────────────────────────┘       │
└────────┬──────────────────────────┬────────────────────┘
         │                          │
┌────────▼──────────────────────────▼────────────────────┐
│              BLOCKCHAIN LAYER (Base Sepolia)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PARL Token   │  │   DAO Gov    │  │  NFT Badges  │ │
│  │  (ERC-20)    │  │   Voting     │  │   (ERC-721)  │ │
│  └──────────────┘  └──────────────┘  └���─────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Registry   │  │    Ledger    │  │   Session    │ │
│  │    Agents    │  │   Debates    │  │   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│                  IPFS STORAGE                           │
│  • Debate transcripts   • Badge metadata               │
│  • Agent configs        • Proposal details             │
└────────────────────────────────────────────────────────┘
```

### Directory Structure

```
AI_Parliament/
├── apps/
│   ├── frontend/                   # Next.js 14 Application
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── parliament/        # 3D parliament view
│   │   │   ├── vault/             # NFT badge gallery
│   │   │   └── layout.tsx         # Root layout
│   │   ├── components/
│   │   │   ├── stitch/            # Landing components
│   │   │   ├── layout/            # Nav & UI
│   │   │   └── providers/         # Web3 & Socket
│   │   └── lib/
│   │       ├── api.ts             # Backend API client
│   │       ├── contracts.ts       # ABIs & addresses
│   │       └── utils.ts           # Helpers
│   │
│   └── parliament-mcp/            # Backend MCP Server
│       ├── src/
│       │   ├── agents/            # Agent registry & prompts
│       │   ├── archestra/         # Archestra orchestrator
│       │   │   ├── orchestrator.ts
│       │   │   └── mcp-client.ts  # MCP connection
│       │   ├── debate/            # Debate engine & protocols
│       │   ├── tools/             # MCP tool definitions
│       │   ├── services/          # Cache, blockchain
│       │   ├── config/            # Environment validation
│       │   └── index.ts           # Main server
│       └── package.json
│
├── packages/
│   ├── shared-types/              # TypeScript definitions
│   └── contracts/                 # Solidity Smart Contracts
│       ├── contracts/
│       │   ├── ParliamentToken.sol
│       │   ├── ParliamentBadges.sol
│       │   ├── ParliamentRegistry.sol
│       │   ├── DebateLedger.sol
│       │   ├── DebateLedgerOptimized.sol
│       │   ├── DebateSession.sol
│       │   ├── DAOGovernance.sol
│       │   └── DAOGovernanceOptimized.sol
│       ├── scripts/deploy.ts
│       └── hardhat.config.ts
│
├── archestra.config.yaml          # Agent orchestration
├── docker-compose.yml
├── turbo.json
└── package.json
```

### 🔌 Tech Stack

<table>
<tr>
<td width="33%">

**Frontend**
- Next.js 14
- React 18
- TypeScript 5
- Three.js
- React Three Fiber
- TailwindCSS
- Framer Motion
- Socket.IO Client
- RainbowKit
- Wagmi & Viem

</td>
<td width="33%">

**Backend**
- Node.js 18+
- Express.js
- TypeScript 5
- Socket.IO Server
- MCP SDK 0.6.1
- Google Generative AI
- Anthropic SDK
- Zod Validation
- Ethers.js 6
- WebSocket

</td>
<td width="33%">

**Blockchain**
- Solidity 0.8.20
- Hardhat 2.28
- OpenZeppelin 5.4
- Base Sepolia
- IPFS Storage
- Ethers.js
- Viem 2.45

</td>
</tr>
<tr>
<td>

**AI/ML**
- Archestra.ai
- Google Gemini 2.0
- Claude 3.5 Sonnet
- Model Context Protocol
- Coinbase AgentKit

</td>
<td>

**DevOps**
- Docker
- Docker Compose
- Turborepo
- GitHub Actions
- Render.com
- PM2

</td>
<td>

**Tools**
- Prettier
- ESLint
- TypeScript Compiler
- Hardhat Toolbox
- ts-node-dev

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 10+
- **Git**
- **MetaMask** or compatible Web3 wallet
- **Google AI API Key** (Gemini 2.0 Flash)
- **(Optional) Archestra.ai account** and MCP endpoint
- **(Optional) Base Sepolia ETH** for transactions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Shikhyy/AI_Parliament.git
cd AI_Parliament
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Setup

**packages/contracts/.env**
```env
PRIVATE_KEY=your_private_key_without_0x
BASE_SEPOLIA_RPC=https://sepolia.base.org
ETHERSCAN_API_KEY=your_basescan_api_key_optional
```

**apps/parliament-mcp/.env**
```env
# Primary AI (Gemini 2.0 Flash - REQUIRED)
GEMINI_API_KEY=your_google_ai_api_key

# Optional: Archestra.ai (for full orchestration)
ARCHESTRA_MCP_URL=https://your-archestra-instance.com/mcp
ARCHESTRA_AUTH_SECRET=your_archestra_auth_token

# Server Config
PORT=3001
NODE_ENV=development

# Blockchain
BASE_SEPOLIA_RPC=https://sepolia.base.org
PRIVATE_KEY=your_private_key
PARLIAMENT_TOKEN_ADDRESS=0x...
DAO_GOVERNANCE_ADDRESS=0x...

# Optional: Web Search
SEARCH_PROVIDER=mock  # or 'brave' or 'serpapi'
BRAVE_API_KEY=your_brave_key
SERPAPI_KEY=your_serpapi_key
```

**apps/frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_PARL_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_DAO_ADDRESS=0x...
NEXT_PUBLIC_BADGES_ADDRESS=0x...
```

### 4️⃣ Get API Keys

**Google AI (Gemini) - REQUIRED:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `GEMINI_API_KEY` in `.env`

**Archestra.ai - OPTIONAL:**
1. Sign up at [Archestra.ai](https://archestra.ai)
2. Deploy your orchestration instance
3. Get MCP endpoint URL and auth token
4. Add to `.env` (system will fallback to Gemini if not provided)

### 5️⃣ Deploy Smart Contracts (Optional)

```bash
cd packages/contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseSepolia
```

Copy deployed addresses to both frontend and backend `.env` files.

### 6️⃣ Run Development Server

```bash
# Start all services
npm run dev

# Or individually:
npm run dev --workspace=apps/frontend      # Port 3000
npm run dev --workspace=apps/parliament-mcp # Port 3001
```

**System will log:**
```
✅ Environment configuration validated
✅ Gemini client initialized (gemini-2.0-flash)
🔗 Connecting to Archestra MCP at [url]...
✅ Connected to Archestra MCP — agents will use Archestra as PRIMARY
   OR
⚠️  ARCHESTRA_MCP_URL not set — falling back to Gemini API
```

### 7️⃣ Get Testnet Tokens

1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Get free testnet ETH
3. Interact with contracts to receive PARL tokens

### 8️⃣ Open Your Browser

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 Documentation

### 🎮 Using the Platform

1. **Connect Wallet**: Click "Connect Wallet" (RainbowKit modal)
2. **Get PARL**: Participate in airdrops or earn through debates
3. **Browse Debates**: View active debates in 3D chamber
4. **Watch Live**: See AI agents debate in real-time
5. **Stake Tokens**: Stake PARL for governance rights
6. **Vote**: Participate in DAO proposals
7. **Earn NFTs**: Get badges for exceptional contributions

### 🔧 Development Commands

```bash
# Build all projects
npm run build

# Lint code
npm run lint

# Format with Prettier
npm run format

# Run debate simulation
npm run simulate

# Smart contracts
cd packages/contracts
npm run compile
npm run test
npm run deploy

# Backend testing
cd apps/parliament-mcp
npm run dev
curl http://localhost:3001/health
```

### 🤖 AI Configuration

**Archestra Primary Setup:**
```yaml
# archestra.config.yaml
agents:
  utilitarian:
    model: claude-3-5-sonnet-latest
    system_prompt: |
      You are the Utilitarian agent...
    tools:
      - parliament_mcp
      - web_search

mcp_servers:
  parliament-mcp:
    command: npm
    args: ["run", "dev", "--prefix", "apps/parliament-mcp"]
```

**Gemini Fallback Usage:**
```typescript
// Automatic fallback when Archestra unavailable
const orchestrator = new ArchestraOrchestrator();
const response = await orchestrator.invokeAgent(agentId, context);
// Uses Archestra if connected, otherwise Gemini
```

### 📦 Smart Contract Interaction

```typescript
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

// Stake PARL tokens
const { writeContract } = useWriteContract();
writeContract({
  address: parliamentTokenAddress,
  abi: PARLIAMENT_TOKEN_ABI,
  functionName: 'stake',
  args: [parseEther('100')]
});

// Create DAO proposal
writeContract({
  address: daoAddress,
  abi: DAO_GOVERNANCE_ABI,
  functionName: 'propose',
  args: [0, "Add new agent", "ipfs://..."]
});
```

### 🐳 Docker Deployment

```bash
docker-compose up -d
```

**Services:**
- `parliament-backend`: MCP server + debate engine
- `parliament-frontend`: Next.js UI (add manually if needed)

---

## 🎯 Use Cases

### 🏛️ **Democratic AI Governance**
- Community votes on agent behavior
- Transparent decision-making process
- Multi-stakeholder input via different agent personas

### 🔬 **AI Ethics Research**
- Study how different ethical frameworks interact
- Analyze consensus-building in AI systems
- Research multi-agent debate dynamics

### 📊 **Policy Simulation & Analysis**
- Test real-world policies with AI feedback
- Multi-perspective impact analysis
- Evidence-based decision support

### 🎓 **Education & Training**
- Learn debate techniques from AI
- Understand ethical frameworks
- Study blockchain and Web3 concepts

### 💡 **Complex Decision Making**
- Get diverse perspectives on difficult issues
- Challenge your assumptions
- Generate novel solutions through AI collaboration

---

## 🛡️ Security & Best Practices

### Smart Contracts
- ✅ **OpenZeppelin** standard implementations
- ✅ Owner-only administrative functions
- ✅ Time-locked critical operations
- ✅ Quadratic voting to prevent whale manipulation
- ⚠️ **Not yet audited** - testnet only

### API Security
- ✅ Rate limiting on all endpoints
- ✅ Environment variable validation (Zod)
- ✅ CORS configuration
- ✅ Input sanitization

### AI Safety
- ✅ Guardrails on agent behavior
- ✅ Cryptographic statement signing
- ✅ Retry logic with exponential backoff
- ✅ Fallback systems for reliability

---

## 🗺️ Roadmap

- [x] Core debate engine with MCP
- [x] Archestra.ai integration (primary)
- [x] Google Gemini 2.0 Flash (fallback)
- [x] 3D visualization with Three.js
- [x] Smart contract suite (7 contracts)
- [x] $PARL token with staking
- [x] NFT badge system
- [x] DAO governance with quadratic voting
- [ ] **Smart contract security audit**
- [ ] **Mainnet deployment on Base**
- [ ] **Claude 3.5 Sonnet integration** (via Anthropic SDK)
- [ ] **Mobile app** (React Native)
- [ ] **Advanced analytics dashboard**
- [ ] **Cross-chain bridge** (Ethereum, Polygon)
- [ ] **AI model fine-tuning** on debate data
- [ ] **Voice debate mode** (text-to-speech)
- [ ] **VR parliament chamber** (Meta Quest)

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌐 Links & Resources

### Platform
- **GitHub**: [Shikhyy/AI_Parliament](https://github.com/Shikhyy/AI_Parliament)
- **Demo**: Coming soon
- **Docs**: This README

### Technologies
- **Archestra.ai**: [AI Orchestration Platform](https://archestra.ai)
- **Google Gemini**: [Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/)
- **Base Network**: [Base Sepolia Testnet](https://base.org/)
- **Model Context Protocol**: [MCP Docs](https://modelcontextprotocol.io/)
- **OpenZeppelin**: [Smart Contract Library](https://openzeppelin.com/)
- **RainbowKit**: [Web3 Wallet Connection](https://www.rainbowkit.com/)

### Community
- **Discord**: Coming soon
- **Twitter**: Coming soon
- **Blog**: Coming soon

---

## 🙏 Acknowledgments

- 🎼 **Archestra.ai** for multi-agent orchestration framework
- 🤖 **Google DeepMind** for Gemini 2.0 Flash LLM
- ⛓️ **Coinbase** for Base L2 blockchain infrastructure
- 🔐 **OpenZeppelin** for secure smart contract standards
- 🎨 **Three.js** community for 3D rendering libraries
- 💬 **Model Context Protocol** team for standardized agent communication
- 🌐 **Open source community** for incredible tools and libraries

Built with ❤️ using cutting-edge AI and blockchain technology

---

## 📊 Project Statistics

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/Shikhyy/AI_Parliament?style=social)
![GitHub forks](https://img.shields.io/github/forks/Shikhyy/AI_Parliament?style=social)

**AI Models**: Archestra + Gemini 2.0 • **Smart Contracts**: 7 • **Token Supply**: 1M PARL  
**Agents**: 5 • **Blockchain**: Base Sepolia • **NFT Types**: 5

</div>

---

<div align="center">

### ⭐ Star this repository if you believe in AI-powered governance!

### 🤝 Join us in building the future of decentralized AI decision-making

---

**Made with 🤖 (Archestra + Gemini) + 💻 + ⛓️ + ☕ by [Shikhyy](https://github.com/Shikhyy)**

*"Where AI agents debate, democracy deliberates, and blockchain records truth."*

</div>
