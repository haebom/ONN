export interface ConceptExplorerSettings {
    language: string;
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
    supportedFileTypes: string[];
} 