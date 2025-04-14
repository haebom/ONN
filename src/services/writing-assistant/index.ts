/**
 * Writing Assistant Services
 * 
 * This module provides writing assistance features using LLMs:
 * - Text completion (auto-complete sentences)
 * - Text transformation (expand, summarize)
 * - Style changing (change tone/style)
 * - Context analysis (analyze note context)
 */

import { ConceptExplorerSettings } from '../../models';

export * from './text-completion';
export * from './text-transformation';
export * from './style-changer';
export * from './context-analyzer';

/**
 * Options for writing assistant operations
 */
export interface WritingAssistantOptions {
  /**
   * Temperature for LLM calls
   */
  temperature?: number;
  
  /**
   * Max tokens to generate
   */
  maxTokens?: number;
}

/**
 * Type of text transformation
 */
export type TransformationType = 'expand' | 'summarize' | 'improve' | 'simplify';

/**
 * Type of text style
 */
export type StyleType = 'academic' | 'casual' | 'professional' | 'poetic' | 'technical' | 'storytelling';

/**
 * Result of a writing assistant operation
 */
export interface WritingAssistantResult {
  /**
   * Original text
   */
  originalText: string;
  
  /**
   * Transformed text
   */
  transformedText: string;
  
  /**
   * Type of operation performed
   */
  operation: string;
  
  /**
   * Whether the operation was successful
   */
  successful: boolean;
  
  /**
   * Error message if operation failed
   */
  error?: string;
}

// Re-export classes to provide a clean API
export { StyleChanger } from './style-changer';
export { TextTransformation } from './text-transformation'; 