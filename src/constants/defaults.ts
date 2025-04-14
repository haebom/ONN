import { ConceptExplorerSettings } from '../models/settings';
import { DEFAULT_PROMPT_TEMPLATE } from './prompts';

export const DEFAULT_SETTINGS: ConceptExplorerSettings = {
    language: 'ko',
    llmService: 'openai',
    model: 'gpt-4-turbo',
    maxDepth: 3,
    maxConcepts: 5,
    maxConceptsPerLevel: 5,
    diversity: 0.8,
    outputFolder: 'concepts',
    openaiApiKey: '',
    claudeApiKey: '',
    geminiApiKey: '',
    ollamaUrl: 'http://localhost:11434',
    mcpUrl: 'http://localhost:5000/api/generate',
    mcpType: 'stdio',
    mcpCommand: 'npx',
    mcpArgs: '-y @modelcontextprotocol/server-claude',
    aiApp: 'obsidian',
    customPrompt: DEFAULT_PROMPT_TEMPLATE,
    supportedFileTypes: ['pdf', 'docx', 'txt', 'xml'],
    enableFileInput: true,
    enableClipboardMonitoring: true,
    enableGraphView: true,
    enablePageOutline: true
}; 