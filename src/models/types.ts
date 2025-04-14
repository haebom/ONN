import { App, TFile, TFolder, Plugin, WorkspaceLeaf } from 'obsidian';
import { ConceptExplorerSettings } from './settings';

export interface ConceptView {
    render(): void;
    update(): void;
}

// ConceptExplorerPlugin과 함께 사용할 인터페이스 정의
export interface IConceptExplorerPlugin {
    settings: ConceptExplorerSettings;
    saveSettings(): Promise<void>;
    getAvailableModels(): Promise<string[]>;
    buildConceptWeb(rootConcept: string, maxDepth: number): Promise<void>;
    saveConceptNote(concept: string, relatedConcepts: string[], path?: string[]): Promise<string | null>;
    exploreNextLevel(concept: string, relatedConcepts: string[], depth: number, path?: string[]): Promise<void>;
    generateConcepts(concept: string, promptTemplate: string, maxConcepts?: number, diversity?: number): Promise<string[]>;
    addConnection(source: string, target: string): void;
    createInterConnections(concepts: string[]): void;
    createRandomConnections(concepts: string[], maxConnections: number): void;
    shuffleArray<T>(array: T[]): T[];
}