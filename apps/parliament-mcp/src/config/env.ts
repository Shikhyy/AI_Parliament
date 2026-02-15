import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Required
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional but recommended
  GEMINI_API_KEY: z.string().optional(),

  // Search
  SEARCH_PROVIDER: z.enum(['brave', 'serpapi', 'mock']).default('mock'),
  BRAVE_API_KEY: z.string().optional(),
  SERPAPI_KEY: z.string().optional(),

  // Blockchain
  BLOCKCHAIN_RPC_URL: z.string().optional().or(z.literal("")), // Allow empty or map from BASE_SEPOLIA_RPC
  PRIVATE_KEY: z.string().optional(),

  // Contract Addresses
  GOVERNANCE_CONTRACT: z.string().optional(),
  DEBATE_LEDGER_CONTRACT: z.string().optional(),
  PARLIAMENT_TOKEN_CONTRACT: z.string().optional(),

  // Performance
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  CACHE_TTL_SECONDS: z.string().default('30'),
  REDIS_URL: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let config: Env;

export function validateEnv(): Env {
  try {
    config = envSchema.parse(process.env);

    // Warnings for missing optional keys
    if (!config.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not set - AI agents will use fallback mode');
    }

    // Map BASE_SEPOLIA_RPC to BLOCKCHAIN_RPC_URL if not set
    if (!config.BLOCKCHAIN_RPC_URL && process.env.BASE_SEPOLIA_RPC) {
      config.BLOCKCHAIN_RPC_URL = process.env.BASE_SEPOLIA_RPC;
    }

    if (!config.BLOCKCHAIN_RPC_URL) {
      console.warn('⚠️  BLOCKCHAIN_RPC_URL (or BASE_SEPOLIA_RPC) not set - blockchain features disabled');
    }

    console.log('✅ Environment configuration validated');
    return config;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

export function getConfig(): Env {
  if (!config) {
    return validateEnv();
  }
  return config;
}
