import { Notice } from 'obsidian';
import { ConceptExplorerSettings } from '../../models';
import { extractConceptsFromText } from '../../utils';

/**
 * Calls the MCP (Multi-Chain Protocol) API to get concepts.
 * 
 * @param settings The plugin settings containing the API url, model, etc.
 * @param prompt The prompt to send to the API.
 * @returns A promise that resolves to an array of concepts.
 */
export async function callMCP(settings: ConceptExplorerSettings, prompt: string): Promise<string[]> {
    try {
        if (!settings.mcpUrl) {
            throw new Error("MCP URL is not set.");
        }

        // Prevent URL path duplication
        let baseUrl = settings.mcpUrl;
        // Avoid duplicating /api/generate if it's already in the URL
        const apiEndpoint = baseUrl.endsWith('/api/generate') ? '' : '/api/generate';
        const url = `${baseUrl}${apiEndpoint}`;
        
        const headers = { 
            "Content-Type": "application/json",
            // Add CORS-related headers
            "Accept": "application/json"
        };
        
        const requestData = {
            "model": settings.model || "claude",
            "prompt": `${prompt}\n\nGenerate a JSON array of related concepts. Return ONLY the JSON array and nothing else.`,
            "max_tokens": 500,
            "temperature": 0.7
        };

        console.log(`MCP Request URL: ${url}`);
        
        // Explicitly set mode to 'cors'
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`MCP API Error: ${response.status} - ${response.statusText}`);
        }

        const responseData = await response.json();
        const content = responseData.response.trim();
        
        // Try to extract JSON array
        try {
            return JSON.parse(content);
        } catch (e) {
            // If not valid JSON, split by lines
            return content.split('\n')
                .map((line: string) => line.trim())
                .filter((line: string) => line.length > 0);
        }
    } catch (error) {
        console.error('Error calling MCP API:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Provide guidance for CORS issues
        if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
            new Notice(`CORS configuration required for MCP server. Please add Access-Control-Allow-Origin header to your server.`);
        }
        
        throw error; // Propagate the error to be handled by the caller
    }
}

/**
 * Simulates streaming by calling the non-streaming MCP endpoint
 * and parsing the result to deliver concepts one by one.
 * 
 * @param settings The plugin settings.
 * @param prompt The prompt to send to the API.
 * @param onConceptGenerated Callback for each generated concept.
 * @param signal AbortSignal to cancel the operation.
 * @returns The full response text.
 */
export async function callMCPWithStreaming(
    settings: ConceptExplorerSettings,
    prompt: string, 
    onConceptGenerated: (concept: string) => void,
    signal?: AbortSignal
): Promise<string> {
    try {
        // Use the standard callMCP which handles errors
        const concepts = await callMCP(settings, prompt);
        
        if (signal?.aborted) {
            console.log('MCP streaming aborted before processing concepts.');
            return '';
        }
        
        const joinedText = concepts.join('\n');
        
        // Simulate streaming by calling the callback for each concept with delay
        concepts.forEach((concept: string, index: number) => {
            setTimeout(() => {
                if (!signal?.aborted) {
                    onConceptGenerated(concept);
                }
            }, index * Math.random() * 300 + 100); // Random delay between 100-400ms
        });
        
        return joinedText;
    } catch (error) {
        console.error('Error in callMCPWithStreaming:', error);
        new Notice('Error during MCP streaming simulation. Check console.');
        throw error;
    }
} 