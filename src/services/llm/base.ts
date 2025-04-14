import { ConceptExplorerSettings } from '../../models/settings';

/**
 * LLM 서비스의 기본 인터페이스를 정의합니다.
 * 모든 LLM 서비스(OpenAI, Claude, Gemini, Ollama, MCP)는 이 인터페이스를 구현해야 합니다.
 */
export interface LLMService {
    /**
     * 서비스 이름
     */
    readonly name: string;
    
    /**
     * 서비스가 현재 사용 가능한지 확인합니다.
     * @returns 서비스 사용 가능 여부
     */
    isAvailable(): boolean;
    
    /**
     * 사용 가능한 모델 목록을 가져옵니다.
     * @returns 모델 이름 목록
     */
    getAvailableModels(): Promise<string[]>;
    
    /**
     * 개념에 대한 관련 개념을 생성합니다.
     * @param concept 개념
     * @param numConcepts 생성할 개념 수
     * @param fullPath 전체 개념 경로
     * @param depth 현재 깊이
     * @param customPrompt 사용자 정의 프롬프트
     * @returns 생성된 관련 개념 목록
     */
    generateConcepts(
        concept: string,
        numConcepts: number,
        fullPath: string,
        depth: number,
        customPrompt?: string
    ): Promise<string[]>;
}

/**
 * 모든 LLM 서비스의 기본 추상 클래스입니다.
 * 공통 기능과 설정을 제공합니다.
 */
export abstract class BaseLLMService implements LLMService {
    abstract readonly name: string;
    protected settings: ConceptExplorerSettings;
    
    constructor(settings: ConceptExplorerSettings) {
        this.settings = settings;
    }
    
    abstract isAvailable(): boolean;
    abstract getAvailableModels(): Promise<string[]>;
    abstract generateConcepts(
        concept: string,
        numConcepts: number,
        fullPath: string,
        depth: number,
        customPrompt?: string
    ): Promise<string[]>;
    
    /**
     * 프롬프트 템플릿을 구성합니다.
     * @param concept 개념
     * @param numConcepts 생성할 개념 수
     * @param fullPath 전체 개념 경로
     * @param depth 현재 깊이
     * @param customPrompt 사용자 정의 프롬프트
     * @returns 완성된 프롬프트
     */
    protected buildPrompt(
        concept: string,
        numConcepts: number,
        fullPath: string,
        depth: number,
        customPrompt?: string
    ): string {
        if (!customPrompt) {
            customPrompt = this.settings.customPrompt;
        }
        
        // 기본 프롬프트 템플릿 사용
        if (!customPrompt) {
            return this.getDefaultPromptTemplate()
                .replace('{concept}', concept)
                .replace('{numConcepts}', numConcepts.toString())
                .replace('{fullPath}', fullPath)
                .replace('{depth}', depth.toString());
        }
        
        // 사용자 정의 프롬프트 템플릿 사용
        return customPrompt
            .replace('{concept}', concept)
            .replace('{numConcepts}', numConcepts.toString())
            .replace('{fullPath}', fullPath)
            .replace('{depth}', depth.toString());
    }
    
    /**
     * 기본 프롬프트 템플릿을 가져옵니다.
     * @returns 기본 프롬프트 템플릿
     */
    protected getDefaultPromptTemplate(): string {
        return `I'm researching about {concept}. Generate {numConcepts} related concepts or ideas that are most relevant to explore.

The concept path so far is: {fullPath}

Output format: Return ONLY a valid JSON array of strings (related concepts), without any additional formatting, explanations, or commentary.

Example output:
["Related Concept 1", "Related Concept 2", "Related Concept 3"]`;
    }
    
    /**
     * API 응답에서 JSON 배열을 추출합니다.
     * @param text API 응답 텍스트
     * @returns 추출된 문자열 배열 또는 오류 시 빈 배열
     */
    protected extractJsonArray(text: string): string[] {
        try {
            // 텍스트에서 JSON 배열 찾기 - 's' 플래그 없이 개행 문자도 처리
            const match = text.replace(/\n/g, ' ').match(/\[(.*?)\]/);
            if (match) {
                const jsonStr = match[0];
                const concepts = JSON.parse(jsonStr);
                
                // 배열이고 모든 요소가 문자열인지 확인
                if (Array.isArray(concepts) && concepts.every(item => typeof item === 'string')) {
                    return concepts;
                }
            }
            
            // 전체 텍스트가 JSON 배열인지 시도
            const concepts = JSON.parse(text);
            if (Array.isArray(concepts) && concepts.every(item => typeof item === 'string')) {
                return concepts;
            }
        } catch (e) {
            console.error('JSON 파싱 오류:', e);
        }
        
        return [];
    }
} 