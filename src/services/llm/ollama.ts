import { Notice } from 'obsidian';
import { LANGUAGE_LABELS } from '../../constants';
import { ConceptExplorerSettings, LanguageCode } from '../../models';
import { extractConceptsFromText } from '../../utils'; // Corrected import path

/**
 * Calls the Ollama API (either /api/generate or /api/chat) to get concepts.
 * 
 * @param settings The plugin settings containing URL, model, etc.
 * @param prompt The prompt to send to the API.
 * @returns A promise that resolves to an array of concepts.
 */
export async function callOllama(settings: ConceptExplorerSettings, prompt: string): Promise<string[]> {
    const ollamaUrl = settings.ollamaUrl || 'http://localhost:11434'; // Default URL if not set
    const model = settings.model || 'llama3:latest'; // Default model if not set
    const generateUrl = `${ollamaUrl}/api/generate`;
    const chatUrl = `${ollamaUrl}/api/chat`;
    const language = settings.language === 'ko' ? '한국어' : 'English';

    console.log(`Attempting Ollama API Call - Model: ${model}, Language: ${language}`);

    // 언어 요청을 강화하기 위해 프롬프트에 언어 지정 추가
    let enhancedPrompt = prompt;
    if (!prompt.includes(language)) {
        enhancedPrompt = `${prompt}\n\n결과는 반드시 ${language}로 작성해주세요. 영어가 아닌 ${language}로만 응답하세요.`;
    }

    // Request body for /api/generate
    const generateRequestBody = {
        model: model,
        prompt: enhancedPrompt, 
        stream: false,
        options: {}
    };

    try {
        console.log('Trying Ollama /api/generate:', JSON.stringify(generateRequestBody));
        const response = await fetch(generateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(generateRequestBody)
        });

        if (!response.ok) {
            console.warn(`Ollama /api/generate failed: ${response.status} ${response.statusText}. Falling back to /api/chat.`);
            throw new Error('Generate endpoint failed');
        }

        const data = await response.json();
        const content = data.response?.trim() || '';
        console.log('Ollama /api/generate response:', content);
        return extractConceptsFromText(content);
    } catch (generateError) {
        console.error('Error calling Ollama /api/generate:', generateError);
        console.log('Attempting Ollama /api/chat as fallback...');

        // Request body for /api/chat
        const chatRequestBody = {
            model: model,
            messages: [
                {
                    role: 'user',
                    content: enhancedPrompt 
                }
            ],
            stream: false, // Explicitly false for chat fallback
            options: {}
        };

        try {
            console.log('Trying Ollama /api/chat:', JSON.stringify(chatRequestBody));
            const chatResponse = await fetch(chatUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chatRequestBody)
            });

            if (!chatResponse.ok) {
                console.error(`Ollama /api/chat also failed: ${chatResponse.status} ${chatResponse.statusText}`);
                new Notice(`Ollama API Error: ${chatResponse.statusText || 'Failed to connect'}. Check Ollama URL and ensure the model is running.`);
                throw new Error(`Ollama API Error after fallback: ${chatResponse.statusText}`);
            }

            const chatData = await chatResponse.json();
            // Handle potential variations in chat response structure
            const chatContent = chatData.message?.content || chatData.response || ''; 
            console.log('Ollama /api/chat response:', chatContent);
            return extractConceptsFromText(chatContent);

        } catch (chatError) {
            console.error('Error calling Ollama /api/chat:', chatError);
            new Notice('Failed to get response from Ollama API. Check console for details.');
            throw chatError; // Re-throw the chat error if fallback also fails
        }
    }
}

/**
 * Simulates streaming by calling the non-streaming Ollama endpoint 
 * and parsing the result line by line.
 * 
 * @param settings The plugin settings.
 * @param prompt The prompt.
 * @param onConceptGenerated Callback for each generated concept.
 * @param signal AbortSignal to cancel the operation.
 * @returns The full response text.
 */
export async function callOllamaWithStreaming(
    settings: ConceptExplorerSettings, 
    prompt: string, 
    onConceptGenerated: (concept: string) => void,
    signal?: AbortSignal
): Promise<string> {
    try {
        // Use the standard callOllama which handles generate/chat fallback
        const concepts = await callOllama(settings, prompt);
        
        if (signal?.aborted) {
            console.log('Ollama streaming aborted before processing concepts.');
            return '';
        }

        const joinedText = concepts.join('\n');
        
        // Simulate streaming by calling the callback for each concept
        concepts.forEach(concept => {
            if (!signal?.aborted) {
                onConceptGenerated(concept);
            } else {
                 console.log('Ollama streaming aborted during concept processing.');
                 // Optionally throw an error or handle differently
                 throw new Error('Operation aborted'); 
            }
        });

        return joinedText;
    } catch (error) {
        console.error('Error in callOllamaWithStreaming:', error);
        new Notice('Error during Ollama streaming simulation. Check console.');
        // Depending on requirements, might want to call onConceptGenerated with an error indicator
        // or just return an empty string/rethrow
        throw error;
    }
} 