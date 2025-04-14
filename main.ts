import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, TFile, TFolder, DropdownComponent, MarkdownView, Editor, normalizePath } from 'obsidian';
import * as d3 from 'd3';
import { extractConceptsFromText } from './src/utils';

// 기본 프롬프트 템플릿 정의
const DEFAULT_PROMPT_TEMPLATE = `다음 개념과 관련된 개념 목록을 생성해주세요:
"{{concept}}"

요구사항:
1. 가능한 다양하고 흥미로운 관련 개념을 5-10개 생성하세요.
2. 개념들은 떠오르는 연상에 기반해야 합니다.
3. 응답은 JSON 배열 형식으로 반환해야 합니다.
4. 원래 개념을 반복해서 포함하지 마세요.
5. 다양성 지수({{diversity}})를 고려하세요. 높을수록 더 다양한 개념을 생성합니다.

형식:
["개념1", "개념2", "개념3", ...]`;

// 언어 설정
const LANGUAGE_LABELS: Record<string, any> = {
    'en': {
        relatedConcepts: "Related Concepts",
        conceptPath: "Concept Path",
        exploring: "Exploring...",
        completed: "Completed",
        depthLabel: "Depth",
        settings: "Settings",
        language: "Language",
        languageDesc: "Choose interface language",
        ollamaModel: "Ollama Model",
        ollamaModelDesc: "Select Ollama model",
        refreshModel: "Refresh Models",
        refreshModelDesc: "Refresh available Ollama models",
        diversity: "Diversity",
        diversityDesc: "Diversity of concept associations (higher = more diverse)",
        maxDepth: "Max Depth",
        maxDepthDesc: "Maximum depth to explore",
        maxConcepts: "Max Concepts",
        maxConceptsDesc: "Maximum concepts per level",
        customPrompt: "Custom Prompt",
        customPromptDesc: "Custom prompt template for concept generation",
        resetPrompt: "Reset to Default",
        outputFolder: "Output Folder",
        outputFolderDesc: "Folder to save generated concept notes",
        explorer: "Neural Network Explorer",
        rootConcept: "Root Concept",
        rootConceptDesc: "Starting concept for exploration",
        depthSetting: "Exploration Depth",
        depthSettingDesc: "How many levels to explore",
        start: "Start Exploration",
        cancel: "Cancel",
        cancelNotice: "Cancelling current exploration...",
        cancelComplete: "Exploration cancelled",
        selectText: "Select text to explore as a concept",
        errorExpanding: "Error expanding concept",
        connectionError: "Connection error",
        enterRoot: "Enter a root concept",
        modelsFound: "Found models: ",
        noModels: "No models found",
        expandTitle: "Expand Concept",
        selectedConcept: "Selected Concept",
        expandDepth: "Expansion Depth",
        expandDepthDesc: "How deep to expand this concept",
        startExpand: "Start Expansion",
        llmService: "LLM Service",
        llmServiceDesc: "Service to use for concept generation",
        openaiApiKey: "OpenAI API Key",
        openaiApiKeyDesc: "API key for OpenAI service",
        claudeApiKey: "Claude API Key", 
        claudeApiKeyDesc: "API key for Claude service",
        geminiApiKey: "Gemini API Key",
        geminiApiKeyDesc: "API key for Gemini service",
        openaiModel: "OpenAI Model",
        openaiModelDesc: "Select OpenAI model",
        claudeModel: "Claude Model",
        claudeModelDesc: "Select Claude model",
        enableGraphView: "Enable Graph View",
        enableGraphViewDesc: "Show graph visualization in editor",
        enablePageOutline: "Enable Page Outline",
        enablePageOutlineDesc: "Generate page outline for concepts",
        autoSaveNotes: "Auto-save Notes",
        autoSaveNotesDesc: "Automatically save concept notes",
        save: "Save",
        saveLocation: "Save Location",
        exploreDeeper: "Explore Deeper",
        close: "Close",
        noResults: "No Results",
        failed: "Failed",
        generating: "Generating...",
        // MCP 관련 레이블
        mcpType: "MCP Connection Type",
        mcpTypeDesc: "How to connect to LLM-Core (MCP)",
        stdioLocalServer: "Local Server (stdio)",
        sseRemoteServer: "Remote Server (SSE)",
        model: "Model",
        modelDesc: "Select model to use",
        custom: "Custom",
        mcpCommand: "MCP Server Command",
        mcpCommandDesc: "Command to start the local MCP server",
        mcpArgs: "MCP Arguments",
        mcpArgsDesc: "Arguments to pass to the MCP server",
        mcpHowToUse: "How to Use MCP",
        mcpObsidianLimitation: "Due to Obsidian's security limitations, you must run the server manually.",
        mcpRunServerFirst: "Run this command in your terminal first:",
        mcpCheckHttpEndpoint: "Then, let Obsidian connect to the local endpoint at:",
        mcpUrl: "MCP Server URL",
        mcpUrlDesc: "URL of the MCP server including port",
        mcpSseHowToUse: "How to Use Remote SSE Server",
        mcpSseEnterUrl: "Enter the full URL of your SSE server:",
        mcpSseCheckRunning: "Make sure your server is running and accessible.",
        mcpSseClaudeConfig: "For Claude Haiku model, use: https://your-server:port",
        mcpCopyCommand: "Copy Command",
        mcpCommandCopied: "Command copied to clipboard",
    },
    'ko': {
        relatedConcepts: "관련 개념",
        conceptPath: "개념 경로",
        exploring: "탐색 중...",
        completed: "완료됨",
        depthLabel: "깊이",
        settings: "설정",
        language: "언어",
        languageDesc: "인터페이스 언어 선택",
        ollamaModel: "Ollama 모델",
        ollamaModelDesc: "Ollama 모델 선택",
        refreshModel: "모델 새로고침",
        refreshModelDesc: "사용 가능한 Ollama 모델 새로고침",
        diversity: "다양성",
        diversityDesc: "개념 연관성의 다양성 (높을수록 더 다양함)",
        maxDepth: "최대 깊이",
        maxDepthDesc: "탐색할 최대 깊이",
        maxConcepts: "최대 개념 수",
        maxConceptsDesc: "각 레벨당 최대 개념 수",
        customPrompt: "사용자 정의 프롬프트",
        customPromptDesc: "개념 생성을 위한 사용자 정의 프롬프트 템플릿",
        resetPrompt: "기본값으로 재설정",
        outputFolder: "출력 폴더",
        outputFolderDesc: "생성된 개념 노트를 저장할 폴더",
        explorer: "신경망 탐색기",
        rootConcept: "루트 개념",
        rootConceptDesc: "탐색을 시작할 개념",
        depthSetting: "탐색 깊이",
        depthSettingDesc: "탐색할 레벨 수",
        start: "탐색 시작",
        cancel: "취소",
        cancelNotice: "현재 탐색을 취소 중...",
        cancelComplete: "탐색이 취소되었습니다",
        selectText: "개념으로 탐색할 텍스트를 선택하세요",
        errorExpanding: "개념 확장 중 오류 발생",
        connectionError: "연결 오류",
        enterRoot: "루트 개념을 입력하세요",
        modelsFound: "발견된 모델: ",
        noModels: "모델을 찾을 수 없습니다",
        expandTitle: "개념 확장",
        selectedConcept: "선택된 개념",
        expandDepth: "확장 깊이",
        expandDepthDesc: "이 개념을 얼마나 깊게 확장할지 설정",
        startExpand: "확장 시작",
        llmService: "LLM 서비스",
        llmServiceDesc: "개념 생성에 사용할 서비스",
        openaiApiKey: "OpenAI API 키",
        openaiApiKeyDesc: "OpenAI 서비스용 API 키",
        claudeApiKey: "Claude API 키",
        claudeApiKeyDesc: "Claude 서비스용 API 키",
        geminiApiKey: "Gemini API 키",
        geminiApiKeyDesc: "Gemini 서비스용 API 키",
        openaiModel: "OpenAI 모델",
        openaiModelDesc: "OpenAI 모델 선택",
        claudeModel: "Claude 모델",
        claudeModelDesc: "Claude 모델 선택",
        enableGraphView: "그래프 뷰 활성화",
        enableGraphViewDesc: "에디터에 그래프 시각화 표시",
        enablePageOutline: "페이지 개요 활성화",
        enablePageOutlineDesc: "개념에 대한 페이지 개요 생성",
        autoSaveNotes: "노트 자동 저장",
        autoSaveNotesDesc: "개념 노트 자동 저장",
        save: "저장",
        saveLocation: "저장 위치",
        exploreDeeper: "더 깊게 탐색",
        close: "닫기",
        noResults: "결과 없음",
        failed: "실패",
        generating: "생성 중...",
        // MCP 관련 레이블
        mcpType: "MCP 연결 유형",
        mcpTypeDesc: "LLM-Core (MCP)에 연결하는 방법",
        stdioLocalServer: "로컬 서버 (stdio)",
        sseRemoteServer: "원격 서버 (SSE)",
        model: "모델",
        modelDesc: "사용할 모델 선택",
        custom: "사용자 정의",
        mcpCommand: "MCP 서버 명령어",
        mcpCommandDesc: "로컬 MCP 서버를 시작하는 명령어",
        mcpArgs: "MCP 인자",
        mcpArgsDesc: "MCP 서버에 전달할 인자",
        mcpHowToUse: "MCP 사용 방법",
        mcpObsidianLimitation: "Obsidian의 보안 제한으로 인해 서버를 수동으로 실행해야 합니다.",
        mcpRunServerFirst: "먼저 터미널에서 이 명령어를 실행하세요:",
        mcpCheckHttpEndpoint: "그런 다음 Obsidian이 다음 로컬 엔드포인트에 연결하도록 하세요:",
        mcpUrl: "MCP 서버 URL",
        mcpUrlDesc: "포트를 포함한 MCP 서버의 URL",
        mcpSseHowToUse: "원격 SSE 서버 사용 방법",
        mcpSseEnterUrl: "SSE 서버의 전체 URL을 입력하세요:",
        mcpSseCheckRunning: "서버가 실행 중이고 접근 가능한지 확인하세요.",
        mcpSseClaudeConfig: "Claude Haiku 모델의 경우 다음을 사용하세요: https://your-server:port",
        mcpCopyCommand: "명령어 복사",
        mcpCommandCopied: "명령어가 클립보드에 복사되었습니다",
    }
};

// 기본 설정 값
const DEFAULT_SETTINGS = {
	language: 'en' as const,
	llmService: 'ollama',
	model: 'llama3',
	maxDepth: 3,
	maxConcepts: 7,
	maxConceptsPerLevel: 5,
	diversity: 0.7,
	outputFolder: 'ONN',
	openaiApiKey: '',
	claudeApiKey: '',
	geminiApiKey: '',
	ollamaUrl: 'http://localhost:11434',
	mcpUrl: 'http://127.0.0.1:5004',
	mcpType: 'stdio',
	mcpCommand: 'python -m llm-core',
	mcpArgs: '--model=llama3 --mode=stdio',
	aiApp: '',
	customPrompt: DEFAULT_PROMPT_TEMPLATE,
	enableFileInput: true,
	enableClipboardMonitoring: false,
	enableGraphView: true,
	enablePageOutline: true,
	autoSaveNotes: true,
	promptTemplate: DEFAULT_PROMPT_TEMPLATE,
	supportedFileTypes: ['.md', '.txt']
};

// 플러그인 설정 인터페이스
interface ObsidianNeuralNetworkSettings {
	language: 'ko' | 'en';
	llmService: string;
	model: string;
	maxDepth: number;
	maxConcepts: number;
	maxConceptsPerLevel: number;
	diversity: number;
	outputFolder: string;
	openaiApiKey: string;
	claudeApiKey: string;
	geminiApiKey: string;
	ollamaUrl: string;
	mcpUrl: string;
	mcpType: string;
	mcpCommand: string;
	mcpArgs: string;
	aiApp: string;
	customPrompt: string;
	enableFileInput: boolean;
	enableClipboardMonitoring: boolean;
	enableGraphView: boolean;
	enablePageOutline: boolean;
	autoSaveNotes: boolean;
	promptTemplate: string;
	supportedFileTypes: string[];
}

interface NeuralView {
	render(): void;
	update(): void;
}

// ObsidianNeuralNetworkPlugin과 함께 사용할 인터페이스 정의
interface IObsidianNeuralNetworkPlugin {
    settings: ObsidianNeuralNetworkSettings;
    saveSettings(): Promise<void>;
    getAvailableModels(): Promise<string[]>;
    buildNeuralNetwork(rootConcept: string, maxDepth: number): Promise<void>;
    saveNetworkNode(concept: string, relatedConcepts: string[], path?: string[]): Promise<string | null>;
    exploreNextLevel(concept: string, relatedConcepts: string[], depth: number, path?: string[]): Promise<void>;
    generateConcepts(concept: string, promptTemplate: string, maxConcepts?: number, diversity?: number): Promise<string[]>;
    queryMCP(prompt: string): Promise<string[]>;
    sanitize(concept: string): Promise<string>;
}

// 내부 GraphManager 클래스 정의 
class GraphManager {
    // 개념 데이터 저장소
    private nodes: Array<{id: string, type: string, depth: number}> = [];
    private connections: Array<{source: string, target: string}> = [];
    private plugin: ObsidianNeuralNetworkPlugin;
    private conceptData: {
        nodes: Map<string, any>,
        connections: Set<string>
    } = {
        nodes: new Map(),
        connections: new Set()
    };

    constructor(plugin: ObsidianNeuralNetworkPlugin) {
        this.plugin = plugin;
    }

    /**
     * 그래프 초기화
     */
    reset(): void {
        this.nodes = [];
        this.connections = [];
        this.conceptData = {
            nodes: new Map(),
            connections: new Set()
        };
    }

    /**
     * 노드 추가
     */
    addNode(nodeId: string, nodeType: string, depth: number, connections: string[]): void {
        this.nodes.push({ id: nodeId, type: nodeType, depth: depth });
        
        this.conceptData.nodes.set(nodeId, {
            name: nodeId,
            description: '',
            related: connections,
            depth: depth
        });
        
        for (const connection of connections) {
            this.connections.push({ source: nodeId, target: connection });
            this.conceptData.connections.add(`${nodeId}||${connection}`);
        }
    }

    /**
     * 그래프 표시
     */
    showGraph(): void {
        console.log("표시할 노드:", this.nodes);
        console.log("표시할 연결:", this.connections);
    }

    /**
     * 두 개념 간 연결 추가
     */
    addConnection(source: string, target: string): void {
        if (source === target) return; // 자기 자신과의 연결 방지
        
        this.connections.push({ source, target });
        this.conceptData.connections.add(`${source}||${target}`);
        console.log(`연결 추가: ${source} -> ${target}`);
    }

    /**
     * 여러 개념 간 상호 연결 생성
     */
    createInterConnections(concepts: string[]): void {
        if (concepts.length < 2) return;
        
        for (let i = 0; i < concepts.length - 1; i++) {
            for (let j = i + 1; j < concepts.length; j++) {
                this.addConnection(concepts[i], concepts[j]);
            }
        }
    }

    /**
     * 랜덤 연결 생성 (네트워크 복잡도 증가)
     */
    createRandomConnections(concepts: string[], maxConnections: number): void {
        if (concepts.length < 3) return;
        
        const connectionCount = Math.min(maxConnections, Math.floor(concepts.length * (concepts.length - 1) / 2));
        
        for (let i = 0; i < connectionCount; i++) {
            const idx1 = Math.floor(Math.random() * concepts.length);
            let idx2 = Math.floor(Math.random() * concepts.length);
            
            // 같은 노드 선택 방지
            while (idx1 === idx2) {
                idx2 = Math.floor(Math.random() * concepts.length);
            }
            
            this.addConnection(concepts[idx1], concepts[idx2]);
        }
    }

    /**
     * 현재 개념과 연결된 모든 개념 찾기
     */
    getConnectedConcepts(concept: string): string[] {
        const connections: string[] = [];
        this.conceptData.connections.forEach((conn: string) => {
            const parts = conn.split('||');
            if (parts.length === 2) {
                const [source, target] = parts;
                if (source === concept && !connections.includes(target)) {
                    connections.push(target);
                } else if (target === concept && !connections.includes(source)) {
                    connections.push(source);
                }
            }
        });
        return connections;
    }

    /**
     * 배열을 무작위로 섞는 헬퍼 함수
     */
    shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    /**
     * 노드 데이터를 객체 형태로 반환
     */
    getNodes(): Record<string, any> {
        const nodes: Record<string, any> = {};
        this.conceptData.nodes.forEach((nodeData, nodeName) => {
            nodes[nodeName] = nodeData;
        });
        return nodes;
    }
    
    /**
     * 연결 데이터를 객체 형태로 반환
     */
    getConnections(): Record<string, any[]> {
        const connections: Record<string, any[]> = {};
        
        // 모든 연결을 소스별로 그룹화
        this.conceptData.connections.forEach((conn: string) => {
            const [source, target] = conn.split('||');
            if (!connections[source]) {
                connections[source] = [];
            }
            connections[source].push({target});
        });
        
        return connections;
    }
}

export default class ObsidianNeuralNetworkPlugin extends Plugin implements IObsidianNeuralNetworkPlugin {
    settings: ObsidianNeuralNetworkSettings;
    conceptView: NeuralView;
    ribbonIcon: HTMLElement;
    fileManager: FileManager;
    clipboardManager: ClipboardManager;
    graphManager: GraphManager;
    availableModels: string[] = [];
    exploredConcepts: Set<string> = new Set<string>();
    
    DEFAULT_SETTINGS: ObsidianNeuralNetworkSettings = DEFAULT_SETTINGS;
    
    // 플러그인 상태 관련 속성
    seenConcepts: Set<string> = new Set<string>();
    currentConcept: {name: string, depth: number, path: string[]} | null = null;
    lastAdded: string = '';
    conceptData: any = {};
    pendingConcept: string = '';
    pendingDepth: number = 0;
    pendingPath: string[] = [];
    clipboardCheckInterval: number | null = null;
    llmService: any = null;
    
    // 플러그인 초기화
    async onload() {
        // 설정 로드
        await this.loadSettings();
        
        // 매니저 초기화
        this.fileManager = new FileManager(this);
        this.clipboardManager = new ClipboardManager(this);
        this.graphManager = new GraphManager(this);
        
        // 개념 데이터 초기화
        this.conceptData = {
            nodes: new Map(),
            connections: new Set()
        };
        
        // 언어 레이블
        const labels = LANGUAGE_LABELS[this.settings.language] || LANGUAGE_LABELS['en'];
        
        // 리본 아이콘 추가
        this.ribbonIcon = this.addRibbonIcon('brain', labels.explorer, () => {
            new ConceptExplorerModal(this.app, this).open();
        });
        
        // 설정 탭 추가
        this.addSettingTab(new ConceptExplorerSettingTab(this.app, this));
        
        // 개념 웹 생성 명령 추가
        this.addCommand({
            id: 'build-neural-network',
            name: labels.explorer,
            callback: () => {
                new ConceptExplorerModal(this.app, this).open();
            }
        });
        
        // 선택된 텍스트로 개념 확장 명령 추가
        this.addCommand({
            id: 'expand-selected-concept',
            name: labels.expandTitle,
            editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
                const selection = editor.getSelection();
                const hasSelection = !!selection;
                
                if (checking) {
                    return hasSelection;
                }
                
                if (hasSelection) {
                    this.expandConceptFromText(selection, view.file);
                } else {
                    new Notice(labels.selectText);
                }
            }
        });
        
        // 네트워크 내보내기 명령 추가
        this.addCommand({
            id: 'export-neural-network',
            name: '신경망 내보내기',
            callback: () => {
                this.exportNeuralNetwork();
            }
        });
        
        // 사용 가능한 모델 로드
        this.loadAvailableModels();
        
        // 클립보드 모니터링 설정 (활성화된 경우)
        if (this.settings.enableClipboardMonitoring) {
            this.startClipboardMonitoring();
        }
        
        console.log('Obsidian Neural Network plugin loaded.');
    }

    onunload() {
        console.log('Unloading Obsidian Neural Network plugin');
    }

    async loadSettings() {
        this.settings = Object.assign({}, this.DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // 텍스트에서 개념 추출 메서드
    private extractConceptsFromText(text: string): string[] {
        // 텍스트에서 개념 추출 로직
        return extractConceptsFromText(text);
    }

    // 텍스트에서 선택된 개념 확장 메서드
    async expandConceptFromText(conceptText: string, file: TFile | null) {
        try {
            // 텍스트에서 개념 추출
            const concepts = this.extractConceptsFromText(conceptText);
            
            if (concepts.length === 0) {
                new Notice("텍스트에서 개념을 추출할 수 없습니다. 직접 입력해주세요.");
                // 모달 열기 - 사용자가 직접 입력할 수 있도록
                new ConceptExpandModal(this.app, this, conceptText, file).open();
                return;
            }

            // 추출된 개념이 하나인 경우 바로 처리
            if (concepts.length === 1) {
                new ConceptResultModal(this.app, this, concepts[0], this.settings.promptTemplate || DEFAULT_PROMPT_TEMPLATE, 1).open();
                return;
            }

            // 여러 개념이 추출된 경우 모달로 선택 옵션 표시
            new ConceptExpandModal(this.app, this, conceptText, file).open();

        } catch (error) {
            console.error("개념 확장 중 오류:", error);
            new Notice(`개념 확장 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    // 그래프 네트워크 생성 메서드
    async buildNeuralNetwork(rootConcept: string, maxDepth: number): Promise<void> {
        if (!rootConcept) {
            console.error("루트 개념이 비어 있습니다.");
            return;
        }

        // 그래프 매니저 초기화
        this.graphManager.reset();
        this.exploredConcepts = new Set<string>();
        this.exploredConcepts.add(rootConcept);

        try {
            // 시작 노드 추가
            this.graphManager.addNode(rootConcept, "ROOT", 0, []);
            
            // 재귀적으로 개념 확장
            await this.exploreNextLevel(rootConcept, [], 0);

            // 최대 깊이까지 도달한 후 그래프 표시
            this.graphManager.showGraph();

            new Notice(`신경망 생성 완료: ${rootConcept}`);
        } catch (error) {
            console.error("신경망 생성 중 오류:", error);
            new Notice(`오류 발생: ${error.message}`);
        }
    }

    // 다음 레벨 탐색
    async exploreNextLevel(concept: string, relatedConcepts: string[], depth: number, path: string[] = []): Promise<void> {
        // 깊이 초과 확인
        if (depth >= this.settings.maxDepth) {
            return;
        }

        // 현재 경로에 현재 개념 추가
        const currentPath = [...path, concept];

        // 관련 개념 생성
        const conceptsToExplore = await this.generateConcepts(
            concept, 
            this.settings.promptTemplate || DEFAULT_PROMPT_TEMPLATE, 
            this.settings.maxConcepts || 5, 
            this.settings.diversity || 0.7
        );

        if (conceptsToExplore.length === 0) {
            console.log(`개념 '${concept}'에 대한 관련 개념을 찾을 수 없습니다.`);
            return;
        }

        // 그래프에 노드와 연결 추가
        if (depth > 0) { // 루트 노드는 이미 추가되어 있음
            this.graphManager.addNode(concept, "CONCEPT", depth, conceptsToExplore);
        } else {
            // 루트 노드에 연결 추가
            for (const relatedConcept of conceptsToExplore) {
                this.graphManager.addConnection(concept, relatedConcept);
            }
        }

        // 노트 저장 (설정에 따라)
        if (this.settings.autoSaveNotes) {
            await this.saveNetworkNode(concept, conceptsToExplore, currentPath);
        }

        // 재귀적으로 다음 레벨 탐색
        for (const relatedConcept of conceptsToExplore) {
            if (!this.exploredConcepts.has(relatedConcept)) {
                this.exploredConcepts.add(relatedConcept);
                await this.exploreNextLevel(relatedConcept, conceptsToExplore, depth + 1, currentPath);
            }
        }
    }

    // 개념 노트 저장 메서드
    async saveNetworkNode(concept: string, relatedConcepts: string[], path: string[] = []): Promise<string | null> {
        try {
            // 계층 관계와 연결 정보를 포함한 노트 생성
            const sanitizedConcept = await this.sanitize(concept);
            if (!sanitizedConcept) return null;

            // 출력 폴더 확인 및 생성
            const outputFolder = this.settings.outputFolder || "ONN";
            const folderPath = normalizePath(outputFolder);
            
            if (!await this.app.vault.adapter.exists(folderPath)) {
                await this.app.vault.createFolder(folderPath);
            }

            // 파일 경로 구성
            const fileName = `${sanitizedConcept}.md`;
            const filePath = normalizePath(`${folderPath}/${fileName}`);

            // 개념에 대한 설명 생성
            const description = await this.generateConceptDescription(concept);

            // 모든 연결 및 직접 부모 추적
            const allConnections = new Set<string>();
            const directParents = new Set<string>();
            
            // 경로의 마지막 항목이 직접 부모
            if (path.length > 0) {
                const parent = path[path.length - 1];
                directParents.add(parent);
            }
            
            // 모든 관련 개념 추가
            for (const related of relatedConcepts) {
                allConnections.add(related);
            }

            // 네트워크 구조를 표현하는 내용 생성
            let content = `# ${concept}\n\n`;
            content += `## 설명\n${description}\n\n`;
            
            // 네트워크 연결 섹션 추가
            content += `## 네트워크 연결\n\n`;
            
            // 부모 개념 섹션 추가
            if (directParents.size > 0) {
                content += `### 부모 개념\n`;
                for (const parent of directParents) {
                    content += `- [[${parent}]]\n`;
                }
                content += `\n`;
            }
            
            // 주요 관련 개념 섹션 (처음 5개)
            if (allConnections.size > 0) {
                const topConnections = [...allConnections].slice(0, 5);
                content += `### 주요 관련 개념\n`;
                for (const related of topConnections) {
                    content += `- [[${related}]]\n`;
                }
                content += `\n`;
            }
            
            // 기타 연결된 개념들 (나머지)
            if (allConnections.size > 5) {
                const otherConnections = [...allConnections].slice(5);
                content += `### 기타 연결된 개념\n`;
                for (const related of otherConnections) {
                    content += `- [[${related}]]\n`;
                }
                content += `\n`;
            }
            
            // 메타데이터 섹션 추가
            content += `## 메타데이터\n`;
            content += `- 태그: #신경망 #${sanitizedConcept}\n`;
            content += `- 깊이: ${path.length}\n`;
            content += `- 연결 수: ${allConnections.size}\n`;
            content += `- 경로: ${path.join(' > ')}\n`;
            
            // 파일 존재 여부 확인 후 생성 또는 업데이트
            if (await this.app.vault.adapter.exists(filePath)) {
                const file = this.app.vault.getAbstractFileByPath(filePath);
                if (file instanceof TFile) {
                    await this.app.vault.modify(file, content);
                }
            } else {
                await this.app.vault.create(filePath, content);
            }
            
            return filePath;
        } catch (error) {
            console.error(`노드 저장 중 오류: ${error.message}`);
            return null;
        }
    }

    // 개념 설명 생성 메소드
    async generateConceptDescription(concept: string): Promise<string> {
        try {
            const prompt = `다음 개념에 대한 2-3문장의 간결한 설명을 작성해주세요: "${concept}"`;
            
            const descriptions = await this.callLLM(prompt);
            
            if (descriptions && descriptions.length > 0) {
                return descriptions.join(' ');
            }
            
            return `${concept}에 대한 설명입니다.`;
        } catch (error) {
            console.error(`설명 생성 중 오류: ${error.message}`);
            return `${concept}에 대한 설명입니다.`;
        }
    }

    // 개념 생성 메소드
    async generateConcepts(
        concept: string, 
        promptTemplate: string, 
        maxConcepts: number = 5, 
        diversity: number = 0.7
    ): Promise<string[]> {
        try {
            // 프롬프트 생성
            const prompt = promptTemplate
                .replace(/{{concept}}/g, concept)
                .replace(/{{diversity}}/g, diversity.toString())
                .replace(/{{maxConcepts}}/g, maxConcepts.toString());
            
            console.log("생성 프롬프트:", prompt);
            
            // LLM 호출하여 개념 생성 
            const result = await this.callLLM(prompt);
            
            // 결과 처리
            return this.parseConceptsFromResponse(result);
        } catch (error) {
            console.error(`개념 생성 중 오류: ${error.message}`);
            return [];
        }
    }

    // 문자열 정규화 (파일 이름에 사용 가능하도록)
    async sanitize(concept: string): Promise<string> {
        return concept.replace(/[\/\\:*?"<>|]/g, '_').trim();
    }

    // MCP API 쿼리 메서드
    async queryMCP(prompt: string): Promise<string[]> {
        try {
            return await this.callMCP(prompt);
        } catch (error) {
            console.error("MCP 쿼리 오류:", error);
            return [];
        }
    }

    // 신경망 내보내기 기능
    async exportNeuralNetwork() {
        try {
            // 현재 신경망 데이터 가져오기
            const nodes = this.graphManager.getNodes();
            const connections = this.graphManager.getConnections();
            
            if (Object.keys(nodes).length === 0) {
                new Notice("내보낼 신경망이 없습니다. 먼저 신경망을 생성해주세요.");
                return;
            }
            
            // JSON 형식으로 변환
            const networkData = {
                nodes: nodes,
                connections: connections,
                meta: {
                    createdAt: new Date().toISOString(),
                    pluginVersion: "1.0.0",
                    nodeCount: Object.keys(nodes).length,
                    connectionCount: Object.keys(connections).length
                }
            };
            
            // 파일 저장 경로 설정
            const exportFolder = this.settings.outputFolder || 'ONN';
            const fileName = `neural-network-${Date.now()}.json`;
            const fullPath = normalizePath(`${exportFolder}/${fileName}`);
            
            // 폴더 확인 및 생성
            if (!await this.app.vault.adapter.exists(exportFolder)) {
                await this.app.vault.createFolder(exportFolder);
            }
            
            // 파일 생성
            await this.app.vault.create(fullPath, JSON.stringify(networkData, null, 2));
            
            new Notice(`신경망을 성공적으로 내보냈습니다: ${fileName}`);
        } catch (error) {
            console.error("신경망 내보내기 오류:", error);
            new Notice("신경망 내보내기 중 오류가 발생했습니다.");
        }
    }

    // LLM 서비스를 통해 질의하는 메서드 (현재 선택된 서비스 사용)
    private async callLLM(prompt: string): Promise<string[]> {
        try {
            console.log(`Using ${this.settings.llmService} to generate concepts`);
            
            switch (this.settings.llmService) {
                case 'ollama':
                    return await this.callOllama(prompt);
                case 'openai':
                    return await this.callOpenAI(prompt);
                case 'claude':
                    return await this.callClaude(prompt);
                case 'gemini':
                    return await this.callGemini(prompt);
                case 'mcp':
                    return await this.callMCP(prompt);
                default:
                    throw new Error(`Unsupported LLM service: ${this.settings.llmService}`);
            }
        } catch (error) {
            console.error("LLM 호출 오류:", error);
            throw error;
        }
    }

    // MCP 호출 메서드 (LLM Core Protocol)
    private async callMCP(prompt: string): Promise<string[]> {
        try {
            const mcpType = this.settings.mcpType || 'stdio';
            
            if (mcpType === 'sse') {
                // SSE 모드 (원격 서버)
                const url = this.settings.mcpUrl || 'http://127.0.0.1:5004';
                
                const response = await fetch(`${url}/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        model: this.settings.model || 'llama3'
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`SSE Server error: ${response.status} ${response.statusText}`);
                }
                
                const result = await response.json();
                
                if (result && result.content) {
                    return [result.content];
                }
                
                return [];
            } else {
                // 아직 구현되지 않음
                throw new Error("MCP stdio 모드는 아직 구현되지 않았습니다. SSE 모드를 사용해주세요.");
            }
        } catch (error) {
            console.error("MCP 호출 오류:", error);
            throw error;
        }
    }

    // 사용 가능한 모델 로드
    async getAvailableModels(): Promise<string[]> {
        const modelList: string[] = [];
        
        try {
            // 현재 선택된 LLM 서비스에 맞는 모델만 가져오기
            const currentService = this.settings.llmService;
            console.log(`현재 선택된 LLM 서비스: ${currentService}`);
            
            if (currentService === 'ollama' && this.settings.ollamaUrl) {
                // Ollama 서버에서 모델 목록 가져오기
                try {
                    console.log(`Ollama 서버 URL: ${this.settings.ollamaUrl}`);
                    const response = await fetch(`${this.settings.ollamaUrl}/api/tags`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log("Ollama API 응답:", data);
                        if (data.models) {
                            console.log(`발견된 모델 수: ${data.models.length}`);
                            data.models.forEach((model: any) => {
                                console.log(`모델 추가: ${model.name}`);
                                modelList.push(model.name);
                            });
                        } else {
                            console.log("Ollama API 응답에 models 속성이 없습니다.");
                        }
                    } else {
                        console.error(`Ollama API 에러 응답: ${response.status} - ${response.statusText}`);
                    }
                } catch (error) {
                    console.error('Ollama 서버 연결 오류:', error);
                    // 기본 Ollama 모델 추가 (서버 연결 실패 시)
                    console.log("기본 Ollama 모델 목록 사용");
                    modelList.push(
                        'llama3', 
                        'llama3:8b', 
                        'llama3:70b', 
                        'mistral', 
                        'gemma:7b'
                    );
                }
            } else if (currentService === 'openai') {
                // OpenAI 모델 리스트 (고정)
                modelList.push(
                    'gpt-3.5-turbo',
                    'gpt-3.5-turbo-16k',
                    'gpt-4',
                    'gpt-4-turbo',
                    'gpt-4-1106-preview',
                    'gpt-4-vision-preview'
                );
            } else if (currentService === 'claude') {
                // Claude 모델 리스트 (고정)
                modelList.push(
                    'claude-instant-1',
                    'claude-2',
                    'claude-3-opus-20240229',
                    'claude-3-sonnet-20240229',
                    'claude-3-haiku-20240307'
                );
            } else if (currentService === 'gemini') {
                // Gemini 모델 리스트 (고정)
                modelList.push(
                    'gemini-pro',
                    'gemini-pro-vision',
                    'gemini-ultra'
                );
            } else if (currentService === 'mcp') {
                // MCP 모델은 사용자 정의 모델을 사용
                modelList.push(
                    'llama3',
                    'claude-3-haiku',
                    'gpt-3.5-turbo',
                    'gemini-pro',
                    'custom'
                );
            }
            
            // 모델 목록 업데이트
            this.availableModels = modelList;
            return modelList;
        } catch (error) {
            console.error("모델 목록 가져오기 오류:", error);
            return modelList;
        }
    }

    // 응답에서 개념 파싱
    private parseConceptsFromResponse(response: string[]): string[] {
        try {
            if (!response || response.length === 0) {
                return [];
            }
            
            const fullResponse = response.join('\n');
            
            // JSON 배열을 찾기 위한 정규식
            const jsonMatch = fullResponse.match(/\[.*\]/s);
            
            if (jsonMatch) {
                try {
                    // JSON 배열 파싱 시도
                    const jsonString = jsonMatch[0];
                    const parsed = JSON.parse(jsonString);
                    
                    if (Array.isArray(parsed)) {
                        // 문자열 배열인 경우 그대로 반환
                        if (parsed.every(item => typeof item === 'string')) {
                            return parsed;
                        }
                        
                        // 객체 배열인 경우 'concept' 속성 추출
                        if (parsed.every(item => typeof item === 'object' && item.concept)) {
                            return parsed.map(item => item.concept);
                        }
                    }
                } catch (parseError) {
                    console.error("JSON 파싱 오류:", parseError);
                }
            }
            
            // JSON 파싱에 실패한 경우, 줄 단위로 처리
            return fullResponse
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && line.length > 0 
                    && !line.startsWith('[') 
                    && !line.endsWith(']')
                    && !line.includes('```')
                );
            
        } catch (error) {
            console.error("응답 파싱 오류:", error);
            return [];
        }
    }

    // Ollama API 호출
    private async callOllama(prompt: string): Promise<string[]> {
        // Ollama API 호출 구현
        return [];
    }

    // OpenAI API 호출
    private async callOpenAI(prompt: string): Promise<string[]> {
        // OpenAI API 호출 구현
        return [];
    }

    // Claude API 호출
    private async callClaude(prompt: string): Promise<string[]> {
        // Claude API 호출 구현
        return [];
    }

    // Gemini API 호출
    private async callGemini(prompt: string): Promise<string[]> {
        // Gemini API 호출 구현
        return [];
    }

    // 클립보드 모니터링 시작
    private startClipboardMonitoring() {
        // 클립보드 모니터링 구현
    }

    // 사용 가능한 모델 로드
    private async loadAvailableModels() {
        this.availableModels = await this.getAvailableModels();
    }
}