import { Notice } from 'obsidian';
import { StyleType, WritingAssistantOptions, WritingAssistantResult } from './index';
import { ConceptExplorerSettings } from '../../models';

/**
 * Class for handling style changes in text
 */
export class StyleChanger {
  private settings: ConceptExplorerSettings;

  constructor(settings: ConceptExplorerSettings) {
    this.settings = settings;
  }

  /**
   * Change the style of the provided text
   * @param text - Text to be styled
   * @param style - Style to apply
   * @param options - Additional options for the operation
   * @returns Promise with the result of the operation
   */
  async changeStyle(
    text: string, 
    style: StyleType, 
    options?: WritingAssistantOptions
  ): Promise<WritingAssistantResult> {
    try {
      if (!text || text.trim().length === 0) {
        return {
          originalText: text,
          transformedText: '',
          operation: `Style change to ${style}`,
          successful: false,
          error: 'No text provided'
        };
      }

      const prompt = this.createStylePrompt(text, style);
      const styledText = await this.getStyleChangeFromLLM(prompt, options);
      const cleanedText = this.cleanStyledText(styledText);

      return {
        originalText: text,
        transformedText: cleanedText,
        operation: `Style change to ${style}`,
        successful: true
      };
    } catch (error) {
      console.error('Style change failed:', error);
      new Notice(`Failed to change style: ${error.message || 'Unknown error'}`);
      
      return {
        originalText: text,
        transformedText: '',
        operation: `Style change to ${style}`,
        successful: false,
        error: error.message || 'Failed to change style'
      };
    }
  }

  /**
   * Create a prompt for style change
   * @param text - Original text
   * @param style - Target style
   * @returns Formatted prompt for the LLM
   */
  private createStylePrompt(text: string, style: StyleType): string {
    let styleDescription = '';
    
    switch (style) {
      case 'academic':
        styleDescription = 'formal, scholarly with proper citations, precise terminology, and objective tone';
        break;
      case 'casual':
        styleDescription = 'conversational, relaxed, using contractions and occasional slang';
        break;
      case 'professional':
        styleDescription = 'business-appropriate, clear, concise, and using industry-standard terminology';
        break;
      case 'poetic':
        styleDescription = 'expressive, using metaphors, imagery, and rhythmic language';
        break;
      case 'technical':
        styleDescription = 'precise, detailed, using specific terminology and logical structure';
        break;
      case 'storytelling':
        styleDescription = 'narrative, engaging, with descriptive language and character/setting development';
        break;
      default:
        styleDescription = 'clear, well-structured, and engaging';
    }

    return `Rewrite the following text in a ${style} style (${styleDescription}). 
Keep the same meaning and information, but change the style and tone.
Only return the rewritten text without any additional explanation or comments.

TEXT TO REWRITE:
${text}`;
  }

  /**
   * Process the style change through appropriate LLM
   * @param prompt - Formatted prompt
   * @param options - LLM options
   * @returns Raw LLM response
   */
  private async getStyleChangeFromLLM(
    prompt: string,
    options?: WritingAssistantOptions
  ): Promise<string> {
    const temperature = options?.temperature || 0.7;
    const maxTokens = options?.maxTokens || 2048;
    
    // Determine which LLM to use based on settings
    if (this.settings.llmService === 'ollama') {
      try {
        // Call Ollama API
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.settings.model || 'llama3',
            prompt: prompt,
            stream: false
          })
        });
        
        if (!response.ok) {
          // Try fallback to chat API
          const chatResponse = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: this.settings.model || 'llama3',
              messages: [{
                role: 'user',
                content: prompt
              }]
            })
          });
          
          if (!chatResponse.ok) {
            throw new Error(`Ollama API error: ${response.status}, Fallback chat API error: ${chatResponse.status}`);
          }
          
          const chatData = await chatResponse.json();
          return chatData.message?.content || '';
        }
        
        const data = await response.json();
        return data.response || '';
      } catch (error) {
        console.error('Ollama API call failed:', error);
        throw new Error(`Ollama API error: ${error.message}`);
      }
    } else if (this.settings.llmService === 'openai' && this.settings.openaiApiKey) {
      try {
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.settings.openaiApiKey}`
          },
          body: JSON.stringify({
            model: this.settings.model || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful writing style assistant.' },
              { role: 'user', content: prompt }
            ],
            temperature: temperature,
            max_tokens: maxTokens
          })
        });
        
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('OpenAI API call failed:', error);
        throw new Error(`OpenAI API error: ${error.message}`);
      }
    } else if (this.settings.llmService === 'claude' && this.settings.claudeApiKey) {
      try {
        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.settings.claudeApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: this.settings.model || 'claude-3-sonnet-20240229',
            messages: [
              { role: 'user', content: prompt }
            ],
            max_tokens: maxTokens,
            temperature: temperature
          })
        });
        
        if (!response.ok) {
          throw new Error(`Claude API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.content[0]?.text || '';
      } catch (error) {
        console.error('Claude API call failed:', error);
        throw new Error(`Claude API error: ${error.message}`);
      }
    } else if (this.settings.llmService === 'gemini' && this.settings.geminiApiKey) {
      try {
        // Call Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.settings.model || 'gemini-pro'}:generateContent?key=${this.settings.geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: temperature,
              maxOutputTokens: maxTokens
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
      } catch (error) {
        console.error('Gemini API call failed:', error);
        throw new Error(`Gemini API error: ${error.message}`);
      }
    } else {
      throw new Error('No valid LLM configuration found');
    }
  }

  /**
   * Clean the styled text returned from the LLM
   * @param text - Raw LLM response
   * @returns Cleaned text
   */
  private cleanStyledText(text: string): string {
    // Remove potential prefix like "Rewritten text:" or "Here's the text in [style] style:"
    const cleanedText = text
      .replace(/^(Here'?s? (is )?the (text|content) in .+?style:)/i, '')
      .replace(/^(Rewritten text:)/i, '')
      .trim();
      
    return cleanedText;
  }
} 