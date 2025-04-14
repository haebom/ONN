import { Notice } from 'obsidian';
import { ConceptExplorerSettings } from '../../models';
import { extractConceptsFromText } from '../../utils';

/**
 * Calls the Anthropic Claude API to get concepts.
 * 
 * @param settings The plugin settings containing the API key, model, etc.
 * @param prompt The prompt to send to the API.
 * @returns A promise that resolves to an array of concepts.
 */
export async function callClaude(settings: ConceptExplorerSettings, prompt: string): Promise<string[]> {
    if (!settings.claudeApiKey) {
        throw new Error("Claude API key is not set.");
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': settings.claudeApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    {
                        role: 'user',
                        content: `${prompt}\n\nGenerate a JSON array of related concepts. Return ONLY the JSON array and nothing else.`
                    }
                ],
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API Error: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.content[0].text.trim();
        
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
        console.error('Error calling Claude API:', error);
        throw error; // Propagate the error to be handled by the caller
    }
}

/**
 * Simulates streaming by calling the non-streaming Claude endpoint
 * and parsing the result to deliver concepts one by one.
 * 
 * @param settings The plugin settings.
 * @param prompt The prompt to send to the API.
 * @param onConceptGenerated Callback for each generated concept.
 * @param signal AbortSignal to cancel the operation.
 * @returns The full response text.
 */
export async function callClaudeWithStreaming(
    settings: ConceptExplorerSettings,
    prompt: string, 
    onConceptGenerated: (concept: string) => void,
    signal?: AbortSignal
): Promise<string> {
    try {
        // Use the standard callClaude which handles errors
        const concepts = await callClaude(settings, prompt);
        
        if (signal?.aborted) {
            console.log('Claude streaming aborted before processing concepts.');
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
        console.error('Error in callClaudeWithStreaming:', error);
        new Notice('Error during Claude streaming simulation. Check console.');
        throw error;
    }
} 