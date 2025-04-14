import { Notice } from 'obsidian';
import { callOllama } from '../llm/ollama';
import { callOpenAI } from '../llm/openai';
import { callClaude } from '../llm/claude';
import { callGemini } from '../llm/gemini';
import { ConceptExplorerSettings } from '../../models';
import { TransformationType, WritingAssistantOptions, WritingAssistantResult } from './index';

/**
 * Handles text transformation operations such as expanding, summarizing, or improving text.
 */
export class TextTransformation {
  private settings: ConceptExplorerSettings;
  private options: WritingAssistantOptions;
  
  /**
   * Creates an instance of TextTransformation.
   * @param settings Plugin settings
   * @param options Optional configuration for text transformation
   */
  constructor(settings: ConceptExplorerSettings, options?: WritingAssistantOptions) {
    this.settings = settings;
    this.options = options || {
      temperature: 0.7,
      maxTokens: 500
    };
  }
  
  /**
   * Transforms the given text based on the specified transformation type.
   * 
   * @param text The text to transform
   * @param type The type of transformation to apply
   * @returns The transformation result
   */
  async transformText(text: string, type: TransformationType): Promise<WritingAssistantResult> {
    try {
      // Create prompt based on transformation type
      const prompt = this.createTransformationPrompt(text, type);
      
      // Get transformation from selected LLM
      const transformed = await this.getTransformationFromLLM(prompt);
      
      return {
        originalText: text,
        transformedText: transformed,
        operation: type,
        successful: true
      };
    } catch (error) {
      console.error(`Error during text ${type}:`, error);
      new Notice(`Failed to ${type} text. Check console for details.`);
      
      return {
        originalText: text,
        transformedText: text,
        operation: type,
        successful: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Creates a prompt for the specified transformation type.
   * 
   * @param text The text to transform
   * @param type The transformation type
   * @returns A formatted prompt for the LLM
   */
  private createTransformationPrompt(text: string, type: TransformationType): string {
    const language = this.settings.language === 'ko' ? '한국어' : 'English';
    
    switch (type) {
      case 'expand':
        return `다음 텍스트를 확장해주세요. 원래 내용의 의미를 유지하면서 더 상세한 설명, 예시, 또는 맥락을 추가하세요. ${language}로 응답해주세요:
        
${text}

확장된 텍스트:`;
        
      case 'summarize':
        return `다음 텍스트를 요약해주세요. 핵심 내용만을 간결하게 유지하면서 요점을 놓치지 않게 해주세요. ${language}로 응답해주세요:
        
${text}

요약된 텍스트:`;
        
      case 'improve':
        return `다음 텍스트를 개선해주세요. 문법, 어휘, 명확성, 흐름 등을 향상시키되, 원래 의미와 스타일은 유지해주세요. ${language}로 응답해주세요:
        
${text}

개선된 텍스트:`;
        
      case 'simplify':
        return `다음 텍스트를 단순화해주세요. 복잡한 용어나 문장 구조를 더 이해하기 쉬운 형태로 바꿔주세요. ${language}로 응답해주세요:
        
${text}

단순화된 텍스트:`;
        
      default:
        throw new Error(`Unknown transformation type: ${type}`);
    }
  }
  
  /**
   * Gets transformation result from the configured LLM service.
   * 
   * @param prompt The prompt to send to the LLM
   * @returns The generated transformation text
   */
  private async getTransformationFromLLM(prompt: string): Promise<string> {
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
      
      // Join results and clean up
      const transformedText = this.cleanTransformedText(result);
      return transformedText;
    } catch (error) {
      console.error("Error calling LLM for text transformation:", error);
      throw error;
    }
  }
  
  /**
   * Cleans up the transformed text from the LLM response.
   * 
   * @param result The raw LLM response
   * @returns The cleaned-up transformed text
   */
  private cleanTransformedText(result: string[]): string {
    if (!result || result.length === 0) {
      return "";
    }
    
    // Join all results
    const fullText = result.join("\n");
    
    // Remove any potential markdown code blocks or delimiters
    return fullText
      .replace(/^```[\w]*\n|```$/gm, '')
      .replace(/^(확장된 텍스트:|요약된 텍스트:|개선된 텍스트:|단순화된 텍스트:)/gm, '')
      .trim();
  }
} 