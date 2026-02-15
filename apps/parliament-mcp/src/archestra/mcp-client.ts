
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage, JSONRPCMessageSchema } from "@modelcontextprotocol/sdk/types.js";
import { EventSource } from "eventsource";
import { getConfig } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Custom SSE Client Transport with Bearer token authentication.
 * The default SSEClientTransport in this SDK version does not support
 * custom headers for auth. This implementation adds Authorization headers
 * to both the EventSource (SSE) connection and POST requests.
 */
class AuthenticatedSSETransport implements Transport {
    private _eventSource?: EventSource;
    private _endpoint?: URL;
    private _abortController?: AbortController;
    private _url: URL;
    private _authHeaders: Record<string, string>;

    onclose?: () => void;
    onerror?: (error: Error) => void;
    onmessage?: (message: JSONRPCMessage) => void;

    constructor(url: URL, authSecret?: string) {
        this._url = url;
        this._authHeaders = authSecret
            ? { 'Authorization': `Bearer ${authSecret}` }
            : {};
    }

    start(): Promise<void> {
        if (this._eventSource) {
            throw new Error("SSEClientTransport already started!");
        }

        return new Promise((resolve, reject) => {
            // The `eventsource` npm package supports headers via init options
            this._eventSource = new EventSource(this._url.href, {
                headers: this._authHeaders,
            } as any);

            this._abortController = new AbortController();

            this._eventSource.onerror = (event: any) => {
                const error = new Error(`SSE error: ${JSON.stringify(event)}`);
                reject(error);
                this.onerror?.call(this, error);
            };

            this._eventSource.onopen = () => {
                // Wait for endpoint event
            };

            this._eventSource.addEventListener("endpoint", (event: any) => {
                try {
                    this._endpoint = new URL(event.data, this._url);
                    if (this._endpoint.origin !== this._url.origin) {
                        throw new Error(`Endpoint origin mismatch: ${this._endpoint.origin}`);
                    }
                } catch (error: any) {
                    reject(error);
                    this.onerror?.call(this, error);
                    void this.close();
                    return;
                }
                resolve();
            });

            this._eventSource.onmessage = (event: any) => {
                let message;
                try {
                    message = JSONRPCMessageSchema.parse(JSON.parse(event.data));
                } catch (error: any) {
                    this.onerror?.call(this, error);
                    return;
                }
                this.onmessage?.call(this, message);
            };
        });
    }

    async close(): Promise<void> {
        this._abortController?.abort();
        this._eventSource?.close();
        this.onclose?.call(this);
    }

    async send(message: JSONRPCMessage): Promise<void> {
        if (!this._endpoint) {
            throw new Error("Not connected");
        }

        try {
            const response = await fetch(this._endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...this._authHeaders,
                },
                body: JSON.stringify(message),
                signal: this._abortController?.signal,
            });

            if (!response.ok) {
                const text = await response.text().catch(() => null);
                throw new Error(`Error POSTing to endpoint (HTTP ${response.status}): ${text}`);
            }
        } catch (error: any) {
            this.onerror?.call(this, error);
            throw error;
        }
    }
}

export class ArchestraMCPClient {
    private client: Client | null = null;
    private transport: Transport | null = null;
    private isConnected: boolean = false;
    private availableTools: any[] = [];

    public get connected(): boolean {
        return this.isConnected;
    }

    constructor() {
    }

    async connect(): Promise<boolean> {
        const config = getConfig();
        const mcpUrl = process.env.ARCHESTRA_MCP_URL;
        const authSecret = process.env.ARCHESTRA_AUTH_SECRET;

        // Skip connection entirely if no MCP URL is configured
        if (!mcpUrl) {
            logger.info('Archestra MCP URL not configured — using direct Anthropic API (this is fine)');
            this.isConnected = false;
            return false;
        }

        try {
            logger.info(`Connecting to Archestra MCP at ${mcpUrl}...`);

            if (!authSecret) {
                logger.warn('No ARCHESTRA_AUTH_SECRET set — connection will likely fail with 401');
            }

            this.transport = new AuthenticatedSSETransport(new URL(mcpUrl), authSecret);

            this.client = new Client({
                name: "parliament-mcp-client",
                version: "1.0.0",
            }, {
                capabilities: {
                    prompts: {},
                    resources: {},
                    tools: {},
                }
            });

            await this.client.connect(this.transport);
            this.isConnected = true;
            logger.info("Connected to Archestra MCP!");

            // Discover tools
            const tools = await this.client.listTools();
            this.availableTools = tools.tools;
            logger.info(`Discovered ${this.availableTools.length} tools: ${this.availableTools.map(t => t.name).join(", ")}`);

            return true;
        } catch (error: any) {
            // Log as warning since we have fallbacks (Anthropic/Mock)
            logger.warn(`Archestra MCP not available (using fallback): ${error.message || 'Connection refused'}`);
            this.isConnected = false;
            return false;
        }
    }

    async callTool(name: string, args: any): Promise<any> {
        if (!this.client || !this.isConnected) {
            throw new Error("MCP Client not connected");
        }
        return await this.client.callTool({
            name,
            arguments: args
        });
    }

    getTools() {
        return this.availableTools;
    }
}

// Singleton
let instance: ArchestraMCPClient;
export function getMCPClient(): ArchestraMCPClient {
    if (!instance) {
        instance = new ArchestraMCPClient();
    }
    return instance;
}
