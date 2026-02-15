/**
 * Web Search Tool for Parliament Debates
 * 
 * Supports multiple search providers:
 * - Mock (default, no API key needed)
 * - Brave Search API (requires BRAVE_SEARCH_API_KEY env var)
 * - SerpAPI (requires SERPAPI_API_KEY env var)
 * 
 * Priority: Use SEARCH_PROVIDER env var to specify, or auto-detect based on API keys
 */

interface SearchResult {
    title: string;
    description: string;
    url: string;
    source: string;
}

export async function searchWeb(query: string): Promise<string> {
    const provider = process.env.SEARCH_PROVIDER || 'mock';

    try {
        if (provider === 'brave' && process.env.BRAVE_SEARCH_API_KEY) {
            return await searchWithBrave(query);
        } else if (provider === 'serpapi' && process.env.SERPAPI_API_KEY) {
            return await searchWithSerpAPI(query);
        }
    } catch (error) {
        console.warn(`Search provider ${provider} failed, falling back to mock:`, error);
    }

    // Default to mock search
    return searchMock(query);
}

/**
 * Mock search (always available)
 */
function searchMock(query: string): string {
    console.log(`[Mock Web Search] Searching for: ${query}`);
    return `[Mock Results] Found 3 articles relevant to "${query}":
    1. "Global Stance on ${query}" - Policy Brief
    2. "Economic Impact of ${query}" - Analysis  
    3. "Ethical Considerations of ${query}" - Research Paper
    
    Note: Using mock search. Configure BRAVE_SEARCH_API_KEY or SERPAPI_API_KEY for real results.`;
}

/**
 * Brave Search API integration
 * https://api.search.brave.com/
 */
async function searchWithBrave(query: string): Promise<string> {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) throw new Error('BRAVE_SEARCH_API_KEY not set');

    try {
        const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Subscription-Token': apiKey,
            },
            // @ts-ignore
            query: query,
        });

        if (!response.ok) {
            throw new Error(`Brave API error: ${response.status}`);
        }

        const data = await response.json() as any;
        const results = data.web?.slice(0, 3) || [];

        if (results.length === 0) {
            return `[Brave Search] No results for "${query}"`;
        }

        return `[Brave Search Results for "${query}"]:
${results.map((r: any, i: number) => `${i + 1}. "${r.title}" - ${r.description}\n   Source: ${r.url}`).join('\n\n')}`;
    } catch (error) {
        console.error('Brave search failed:', error);
        throw error;
    }
}

/**
 * SerpAPI integration
 * https://serpapi.com/
 */
async function searchWithSerpAPI(query: string): Promise<string> {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) throw new Error('SERPAPI_API_KEY not set');

    try {
        const params = new URLSearchParams({
            q: query,
            api_key: apiKey,
            engine: 'google',
            num: '3',
        });

        const response = await fetch(`https://serpapi.com/search?${params}`);

        if (!response.ok) {
            throw new Error(`SerpAPI error: ${response.status}`);
        }

        const data = await response.json() as any;
        const results = data.organic_results?.slice(0, 3) || [];

        if (results.length === 0) {
            return `[SerpAPI] No results for "${query}"`;
        }

        return `[SerpAPI Results for "${query}"]:
${results.map((r: any, i: number) => `${i + 1}. "${r.title}" - ${r.snippet}\n   Source: ${r.link}`).join('\n\n')}`;
    } catch (error) {
        console.error('SerpAPI search failed:', error);
        throw error;
    }
}
