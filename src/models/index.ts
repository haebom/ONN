// src/models/index.ts

// Type definitions for the plugin

export interface LanguageLabels {
	relatedConcepts: string;
	conceptPath: string;
	exploring: string;
	completed: string;
	depthLabel: string;
	settings: string;
	language: string;
	languageDesc: string;
	ollamaModel: string;
	ollamaModelDesc: string;
	refreshModel: string;
	refreshModelDesc: string;
	diversity: string;
	diversityDesc: string;
	maxDepth: string;
	maxDepthDesc: string;
	maxConcepts: string;
	maxConceptsDesc: string;
	customPrompt: string;
	customPromptDesc: string;
	resetPrompt: string;
	outputFolder: string;
	outputFolderDesc: string;
	explorer: string;
	rootConcept: string;
	rootConceptDesc: string;
	depthSetting: string;
	depthSettingDesc: string;
	start: string;
	cancel: string;
	cancelNotice: string;
	cancelComplete: string;
	selectText: string;
	errorExpanding: string;
	connectionError: string;
	enterRoot: string;
	modelsFound: string;
	noModels: string;
	expandTitle: string;
	selectedConcept: string;
	expandDepth: string;
	expandDepthDesc: string;
	startExpand: string;
	llmService: string;
	llmServiceDesc: string;
	openaiApiKey: string;
	openaiApiKeyDesc: string;
	claudeApiKey: string;
	claudeApiKeyDesc: string;
	geminiApiKey: string;
	geminiApiKeyDesc: string;
	openaiModel: string;
	openaiModelDesc: string;
	claudeModel: string;
	claudeModelDesc: string;
	enableGraphView: string;
	enableGraphViewDesc: string;
	enablePageOutline: string;
	enablePageOutlineDesc: string;
	autoSaveNotes: string;
	autoSaveNotesDesc: string;
	save: string;
	saveLocation: string;
	exploreDeeper: string;
	close: string;
	noResults: string;
	failed: string;
	generating: string;
	// MCP related labels
	mcpType: string;
	mcpTypeDesc: string;
	stdioLocalServer: string;
	sseRemoteServer: string;
	model: string;
	modelDesc: string;
	custom: string;
	mcpCommand: string;
	mcpCommandDesc: string;
	mcpArgs: string;
	mcpArgsDesc: string;
	mcpHowToUse: string;
	mcpObsidianLimitation: string;
	mcpRunServerFirst: string;
	mcpCheckHttpEndpoint: string;
	mcpUrl: string;
	mcpUrlDesc: string;
	mcpSseHowToUse: string;
	mcpSseEnterUrl: string;
	mcpSseCheckRunning: string;
	mcpSseClaudeConfig: string;
	mcpCopyCommand: string;
	mcpCommandCopied: string;
}

export type LanguageCode = 'ko' | 'en';

export interface ConceptExplorerSettings {
	language: LanguageCode;
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
	supportedFileTypes: string[];
}

export interface ConceptView {
    render(): void;
    update(): void;
}

export interface IConceptExplorerPlugin {
    settings: ConceptExplorerSettings;
    saveSettings(): Promise<void>;
    getAvailableModels(): Promise<string[]>;
    buildConceptWeb(rootConcept: string, maxDepth: number, currentDepth?: number, path?: string[]): Promise<void>;
    saveConceptNote(concept: string, relatedConcepts: string[], path?: string[]): Promise<string | null>;
    exploreNextLevel(concept: string, relatedConcepts: string[], depth: number, path?: string[]): Promise<void>;
    generateConcepts(concept: string, promptTemplate: string, maxConcepts?: number, diversity?: number): Promise<string[]>;
} 