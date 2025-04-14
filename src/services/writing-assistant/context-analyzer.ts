import { Editor, Notice, TFile } from 'obsidian';
import { ConceptExplorerSettings } from '../../models';
import { WritingAssistantOptions, WritingAssistantResult } from './index';

/**
 * Types of context analysis
 */
export type AnalysisType = 'key-concepts' | 'topic-suggestion' | 'related-notes' | 'improvement-suggestion';

/**
 * Result of context analysis with additional data
 */
export interface ContextAnalysisResult extends WritingAssistantResult {
  /**
   * Extracted key concepts
   */
  concepts?: string[];
  
  /**
   * Suggested topics for expansion
   */
  suggestedTopics?: string[];
  
  /**
   * Related note titles
   */
  relatedNotes?: string[];
  
  /**
   * Improvement suggestions
   */
  suggestions?: string[];
}

/**
 * Class for analyzing the context of a note
 */
export class ContextAnalyzer {
  private settings: ConceptExplorerSettings;
  private maxContextLength = 5000; // 최대 컨텍스트 길이 (문자 수)
  private app: any; // Obsidian 앱 인스턴스

  constructor(settings: ConceptExplorerSettings) {
    this.settings = settings;
    this.app = (window as any).app; // 전역 앱 객체 사용
  }

  /**
   * Analyze text context
   * @param text - Text to analyze
   * @param type - Type of analysis to perform
   * @param options - Additional options for the operation
   * @returns Promise with the analysis result
   */
  async analyzeContext(
    text: string,
    type: AnalysisType,
    options?: WritingAssistantOptions
  ): Promise<ContextAnalysisResult> {
    try {
      if (!text || text.trim().length === 0) {
        return {
          originalText: text,
          transformedText: '',
          operation: `Context analysis (${type})`,
          successful: false,
          error: 'No text provided'
        };
      }

      // 텍스트가 너무 길면 잘라내기 (최대 컨텍스트 길이)
      const contextText = text.length > this.maxContextLength 
        ? text.substring(0, this.maxContextLength) + "..." 
        : text;

      const prompt = this.createAnalysisPrompt(contextText, type);
      
      // LLM 서비스 호출 (로컬 모델 또는 MCP 사용)
      if (this.settings.llmService !== 'ollama' && this.settings.llmService !== 'mcp') {
        throw new Error('Context analysis only supports Ollama and MCP for cost efficiency');
      }
      
      const result = await this.callLLM(prompt, options);
      
      // 결과 처리 및 반환
      return this.processAnalysisResult(result, type, text);
    } catch (error) {
      console.error(`Context analysis (${type}) failed:`, error);
      new Notice(`Failed to analyze context: ${error.message || 'Unknown error'}`);
      
      return {
        originalText: text,
        transformedText: '',
        operation: `Context analysis (${type})`,
        successful: false,
        error: error.message || 'Analysis failed'
      };
    }
  }

  /**
   * Create a prompt for the specific analysis type
   */
  private createAnalysisPrompt(text: string, type: AnalysisType): string {
    const language = this.settings.language === 'ko' ? '한국어' : 'English';
    const outputFormat = '[{"item": "첫번째 항목"}, {"item": "두번째 항목"}, ...]';
    
    switch (type) {
      case 'key-concepts':
        return `다음 텍스트에서 주요 개념/키워드를 추출해주세요. ${language}로 응답해주세요.
        
응답은 다음과 같은 JSON 형식으로 작성해주세요: ${outputFormat}

분석할 텍스트:
${text}`;
      
      case 'topic-suggestion':
        return `다음 텍스트를 분석하고 작성자가 더 탐구하거나 추가할 수 있는 관련 주제를 제안해주세요. ${language}로 응답해주세요.
        
응답은 다음과 같은 JSON 형식으로 작성해주세요: ${outputFormat}

분석할 텍스트:
${text}`;
      
      case 'related-notes':
        return `다음 텍스트를 분석하고 관련된 노트의 제목이나 주제를 제안해주세요. 이 텍스트와 연결할 수 있는 다른 노트나 주제입니다. ${language}로 응답해주세요.
        
응답은 다음과 같은 JSON 형식으로 작성해주세요: ${outputFormat}

분석할 텍스트:
${text}`;
      
      case 'improvement-suggestion':
        return `다음 텍스트를 분석하고 개선할 수 있는 부분을 제안해주세요. 구조, 명확성, 논리 흐름 등에 초점을 맞춰주세요. ${language}로 응답해주세요.
        
응답은 다음과 같은 JSON 형식으로 작성해주세요: ${outputFormat}

분석할 텍스트:
${text}`;
      
      default:
        return `다음 텍스트를 분석하고 주요 개념과 관련 주제를 추출해주세요. ${language}로 응답해주세요.
        
분석할 텍스트:
${text}`;
    }
  }

  /**
   * Call the appropriate LLM service (Ollama or MCP only)
   */
  private async callLLM(
    prompt: string, 
    options?: WritingAssistantOptions
  ): Promise<string> {
    const temperature = options?.temperature || 0.3; // 분석은 낮은 온도가 더 좋음
    const maxTokens = options?.maxTokens || 1000;
    
    if (this.settings.llmService === 'ollama') {
      try {
        // Ollama API 호출
        const url = this.settings.ollamaUrl || 'http://localhost:11434';
        const response = await fetch(`${url}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.settings.model || 'llama3',
            prompt: prompt,
            temperature: temperature,
            max_tokens: maxTokens,
            stream: false
          })
        });
        
        if (!response.ok) {
          // 채팅 API로 폴백 시도
          const chatResponse = await fetch(`${url}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.settings.model || 'llama3',
              messages: [{ role: 'user', content: prompt }],
              temperature: temperature,
              max_tokens: maxTokens
            })
          });
          
          if (!chatResponse.ok) {
            throw new Error(`Ollama API error: ${chatResponse.status}`);
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
    } else if (this.settings.llmService === 'mcp') {
      try {
        // MCP API 호출
        let baseUrl = this.settings.mcpUrl;
        if (!baseUrl) {
          throw new Error('MCP URL is not configured');
        }
        
        // URL이 이미 /api/generate로 끝나는 경우 중복 방지
        const apiEndpoint = baseUrl.endsWith('/api/generate') ? '' : '/api/generate';
        const url = `${baseUrl}${apiEndpoint}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            model: this.settings.model || 'claude',
            prompt: prompt,
            max_tokens: maxTokens,
            temperature: temperature
          }),
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`MCP API error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.response || '';
      } catch (error) {
        console.error('MCP API call failed:', error);
        throw new Error(`MCP API error: ${error.message}`);
      }
    } else {
      throw new Error('Only Ollama and MCP are supported for context analysis');
    }
  }

  /**
   * Process and structure the analysis result
   */
  private processAnalysisResult(
    result: string,
    type: AnalysisType,
    originalText: string
  ): ContextAnalysisResult {
    try {
      // JSON 형식의 결과 추출 시도
      const jsonMatch = result.match(/\[.*?\]/);
      let parsedResults: any[] = [];
      
      if (jsonMatch) {
        try {
          parsedResults = JSON.parse(jsonMatch[0]);
        } catch (error) {
          console.warn('Failed to parse JSON result:', error);
        }
      }
      
      // 텍스트에서 항목 추출 (JSON 파싱 실패 시 백업 방법)
      if (parsedResults.length === 0) {
        const lines = result.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && !line.startsWith('```'));
          
        parsedResults = lines.map(line => {
          // 번호나 불릿 제거
          const cleanLine = line.replace(/^[\d\-\*\•\.]+\s*/, '');
          return { item: cleanLine };
        });
      }
      
      // 분석 유형에 따른 결과 구조화
      const analysisResult: ContextAnalysisResult = {
        originalText,
        transformedText: result,
        operation: `Context analysis (${type})`,
        successful: true
      };
      
      // 분석 유형에 따라 다른 속성 설정
      switch (type) {
        case 'key-concepts':
          analysisResult.concepts = parsedResults.map(item => item.item || item.concept || item);
          break;
        case 'topic-suggestion':
          analysisResult.suggestedTopics = parsedResults.map(item => item.item || item.topic || item);
          break;
        case 'related-notes':
          analysisResult.relatedNotes = parsedResults.map(item => item.item || item.note || item);
          break;
        case 'improvement-suggestion':
          analysisResult.suggestions = parsedResults.map(item => item.item || item.suggestion || item);
          break;
      }
      
      return analysisResult;
    } catch (error) {
      console.error('Failed to process analysis result:', error);
      return {
        originalText,
        transformedText: result,
        operation: `Context analysis (${type})`,
        successful: false,
        error: 'Failed to process analysis result'
      };
    }
  }
  
  /**
   * Analyze a file in the vault
   */
  async analyzeFile(
    file: TFile,
    type: AnalysisType,
    options?: WritingAssistantOptions
  ): Promise<ContextAnalysisResult> {
    try {
      // app 대신 애플리케이션 컨텍스트를 사용
      const fileContent = await this.app.vault.read(file);
      return this.analyzeContext(fileContent, type, options);
    } catch (error) {
      console.error(`File analysis failed (${file.path}):`, error);
      return {
        originalText: file.path,
        transformedText: '',
        operation: `File analysis (${type})`,
        successful: false,
        error: `Failed to analyze file: ${error.message}`
      };
    }
  }
} 