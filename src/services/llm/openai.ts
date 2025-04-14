import { Notice } from 'obsidian';
import { ConceptExplorerSettings } from '../../models';
import { extractConceptsFromText } from '../../utils';

/**
 * Calls the OpenAI API to get concepts.
 * 
 * @param settings The plugin settings containing the API key, model, etc.
 * @param prompt The prompt to send to the API.
 * @returns A promise that resolves to an array of concepts.
 */
export async function callOpenAI(settings: ConceptExplorerSettings, prompt: string): Promise<string[]> {
    if (!settings.openaiApiKey) {
        throw new Error("OpenAI API key is not set.");
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.openaiApiKey}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a JSON array of related concepts. Return ONLY the JSON array and nothing else.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
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
        console.error('Error calling OpenAI API:', error);
        throw error; // Propagate the error to be handled by the caller
    }
}

/**
 * Simulates streaming by calling the non-streaming OpenAI endpoint
 * and parsing the result to deliver concepts one by one.
 * 
 * @param settings The plugin settings.
 * @param prompt The prompt to send to the API.
 * @param onConceptGenerated Callback for each generated concept.
 * @param signal AbortSignal to cancel the operation.
 * @returns The full response text.
 */
export async function callOpenAIWithStreaming(
    settings: ConceptExplorerSettings,
    prompt: string, 
    onConceptGenerated: (concept: string) => void,
    signal?: AbortSignal
): Promise<string> {
    try {
        // Use the standard callOpenAI which handles errors
        const concepts = await callOpenAI(settings, prompt);
        
        if (signal?.aborted) {
            console.log('OpenAI streaming aborted before processing concepts.');
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
        console.error('Error in callOpenAIWithStreaming:', error);
        new Notice('Error during OpenAI streaming simulation. Check console.');
        throw error;
    }
} 