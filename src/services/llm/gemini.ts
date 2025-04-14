import { Notice } from 'obsidian';
import { ConceptExplorerSettings } from '../../models';
import { extractConceptsFromText } from '../../utils';

/**
 * Calls the Google Gemini API to get concepts.
 * 
 * @param settings The plugin settings containing the API key, model, etc.
 * @param prompt The prompt to send to the API.
 * @returns A promise that resolves to an array of concepts.
 */
export async function callGemini(settings: ConceptExplorerSettings, prompt: string): Promise<string[]> {
    if (!settings.geminiApiKey) {
        throw new Error("Gemini API key is not set.");
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `${prompt}\n\nGenerate a JSON array of related concepts. Return ONLY the JSON array and nothing else.`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500
                }
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text.trim();
        
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
        console.error('Error calling Gemini API:', error);
        throw error; // Propagate the error to be handled by the caller
    }
}

/**
 * Simulates streaming by calling the non-streaming Gemini endpoint
 * and parsing the result to deliver concepts one by one.
 * 
 * @param settings The plugin settings.
 * @param prompt The prompt to send to the API.
 * @param onConceptGenerated Callback for each generated concept.
 * @param signal AbortSignal to cancel the operation.
 * @returns The full response text.
 */
export async function callGeminiWithStreaming(
    settings: ConceptExplorerSettings,
    prompt: string, 
    onConceptGenerated: (concept: string) => void,
    signal?: AbortSignal
): Promise<string> {
    try {
        // Use the standard callGemini which handles errors
        const concepts = await callGemini(settings, prompt);
        
        if (signal?.aborted) {
            console.log('Gemini streaming aborted before processing concepts.');
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
        console.error('Error in callGeminiWithStreaming:', error);
        new Notice('Error during Gemini streaming simulation. Check console.');
        throw error;
    }
} 