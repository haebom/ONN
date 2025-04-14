import { Editor, EditorPosition, Notice } from 'obsidian';
import { callOllama } from '../llm/ollama';
import { callOpenAI } from '../llm/openai';
import { callClaude } from '../llm/claude';
import { callGemini } from '../llm/gemini';
import { ConceptExplorerSettings } from '../../models';
import { WritingAssistantOptions, WritingAssistantResult } from './index';

/**
 * Provides text completion functionality using LLM.
 * This can suggest completions for half-written sentences.
 */
export class TextCompletion {
  private settings: ConceptExplorerSettings;
  private options: WritingAssistantOptions;
  private contextLength = 500; // Number of characters to use as context

  /**
   * Creates an instance of TextCompletion.
   * @param settings Plugin settings
   * @param options Optional configuration for text completion
   */
  constructor(settings: ConceptExplorerSettings, options?: WritingAssistantOptions) {
    this.settings = settings;
    this.options = options || {
      temperature: 0.5,
      maxTokens: 100
    };
  }

  /**
   * Gets a completion suggestion for the current cursor position.
   * 
   * @param editor The Obsidian editor instance
   * @param position Current cursor position
   * @returns Promise with the completion text
   */
  async getCompletion(editor: Editor, position: EditorPosition): Promise<string> {
    try {
      // Get text before cursor for context
      const cursorOffset = editor.posToOffset(position);
      const text = editor.getValue();

      // Extract context around cursor
      const startOffset = Math.max(0, cursorOffset - this.contextLength);
      const context = text.substring(startOffset, cursorOffset);
      
      // Create prompt for LLM
      const prompt = this.createCompletionPrompt(context);
      
      // Get completion from selected LLM
      const completion = await this.getCompletionFromLLM(prompt);
      
      return completion;
    } catch (error) {
      console.error("Error getting completion:", error);
      new Notice("Failed to get text completion. Check console for details.");
      return "";
    }
  }
  
  /**
   * Applies a completion suggestion at the current cursor position.
   * 
   * @param editor The Obsidian editor instance
   * @param completion The completion to insert
   */
  applyCompletion(editor: Editor, completion: string): void {
    const cursor = editor.getCursor();
    editor.replaceRange(completion, cursor);
  }
  
  /**
   * Creates a prompt for text completion based on the current context.
   * 
   * @param context The text before the cursor
   * @returns A formatted prompt for the LLM
   */
  private createCompletionPrompt(context: string): string {
    return `다음 문장의 자연스러운 이어짐을 제안해주세요. 문맥에 맞게 2-3개의 단어나 짧은 구를 제안하세요:
    
${context}

계속해서...`; 
  }
  
  /**
   * Gets completion from the configured LLM service.
   * 
   * @param prompt The prompt to send to the LLM
   * @returns The generated completion
   */
  private async getCompletionFromLLM(prompt: string): Promise<string> {
    try {
      let result: string[] = [];
      
      switch (this.settings.llmService) {
        case 'ollama':
          result = await callOllama(this.settings, prompt);
          break;
        case 'openai':
          result = await callOpenAI(this.settings, prompt);
          break;
        case 'claude':
          result = await callClaude(this.settings, prompt);
          break;
        case 'gemini':
          result = await callGemini(this.settings, prompt);
          break;
        default:
          throw new Error("Unsupported LLM service");
      }
      
      // Extract the most relevant part of the response
      // Typically want the first sentence or phrase only
      const completion = this.extractCompletion(result);
      return completion;
    } catch (error) {
      console.error("Error calling LLM for completion:", error);
      throw error;
    }
  }

  /**
   * Extracts a usable completion from the LLM response.
   * 
   * @param result The raw LLM response
   * @returns A cleaned-up completion
   */
  private extractCompletion(result: string[]): string {
    if (!result || result.length === 0) {
      return "";
    }
    
    // Join all results
    const fullText = result.join(" ");
    
    // Extract the first sentence or first 50 characters, whichever is shorter
    const firstSentenceMatch = fullText.match(/^[^.!?]*[.!?]/);
    if (firstSentenceMatch) {
      return firstSentenceMatch[0].trim();
    }
    
    // If no sentence ending, return up to 50 chars
    return fullText.substring(0, Math.min(50, fullText.length)).trim();
  }
} 