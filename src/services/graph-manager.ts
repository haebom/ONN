import { Plugin, TFile } from 'obsidian';
import * as d3 from 'd3';

/**
 * Manages graph visualizations and network structure for the Concept Explorer plugin.
 */
export class GraphManager {
    // 개념 데이터 저장소
    private conceptData: {
        nodes: Map<string, {
            name: string,
            description: string,
            related: string[],
            depth: number
        }>,
        connections: Set<string>
    } = {
        nodes: new Map(),
        connections: new Set()
    };

    /**
     * Creates a new GraphManager instance.
     * 
     * @param plugin The parent plugin instance.
     */
    constructor(private plugin: Plugin) {}
    
    /**
     * 개념 노드 추가
     */
    addNode(concept: string, description: string, related: string[], depth: number): void {
        this.conceptData.nodes.set(concept, {
            name: concept,
            description: description || `${concept}에 대한 설명입니다.`,
            related: related || [],
            depth: depth || 0
        });
    }
    
    /**
     * 두 개념 간 연결 추가 (양방향)
     */
    addConnection(source: string, target: string): void {
        if (source === target) return; // 자기 자신과의 연결 방지
        
        // 양방향 연결 추가
        this.conceptData.connections.add(`${source}||${target}`);
        this.conceptData.connections.add(`${target}||${source}`);
    }
    
    /**
     * 유사한 깊이의 노드들 간 관계 생성 (네트워크 복잡도 증가)
     */
    createNetworkConnections(): void {
        const nodes = Array.from(this.conceptData.nodes.keys());
        if (nodes.length < 4) return; // 최소 4개 이상의 노드가 있어야 의미 있는 네트워크
        
        // 노드 수에 비례하여 랜덤 연결 생성 - 더 많은 연결 추가 (20%)
        const numExtraConnections = Math.floor(nodes.length * 0.2);
        
        // 모든 노드의 깊이 수집
        const nodeDepthMap = new Map<string, number>();
        for (const [nodeName, nodeData] of this.conceptData.nodes.entries()) {
            nodeDepthMap.set(nodeName, nodeData.depth);
        }
        
        for (let i = 0; i < numExtraConnections; i++) {
            // 랜덤하게 두 개의 노드 선택 
            // 유사한 깊이의 노드를 우선적으로 연결 (더 자연스러운 네트워크 형성)
            const idx1 = Math.floor(Math.random() * nodes.length);
            const source = nodes[idx1];
            const sourceDepth = nodeDepthMap.get(source) || 0;
            
            // 유사한 깊이의 노드를 찾기
            const similarDepthNodes = nodes.filter((node, idx) => {
                if (idx === idx1) return false; // 같은 노드 제외
                const nodeDepth = nodeDepthMap.get(node) || 0;
                // 깊이 차이가 1 이하인 노드만 선택 (유사한 레벨의 노드들을 연결)
                return Math.abs(nodeDepth - sourceDepth) <= 1;
            });
            
            if (similarDepthNodes.length === 0) continue; // 유사 깊이 노드가 없으면 스킵
            
            // 유사 깊이 노드 중 하나 선택
            const target = this.shuffleArray(similarDepthNodes)[0];
            
            // 이미 연결되어 있지 않은 경우에만 추가
            const connectionKey = `${source}||${target}`;
            if (!this.conceptData.connections.has(connectionKey)) {
                this.addConnection(source, target);
                console.log(`[네트워크] 유사 레벨 랜덤 연결: ${source} <-> ${target}`);
            }
        }
        
        // 또한 의미론적으로 관련된 노드들을 추가 연결 (유사 이름 기반)
        this.createSemanticConnections();
    }
    
    /**
     * 의미론적 유사성에 기반한 연결 생성
     */
    private createSemanticConnections(): void {
        const nodes = Array.from(this.conceptData.nodes.keys());
        if (nodes.length < 5) return;
        
        // 각 노드에 대해 이름이 유사한 다른 노드와 연결 시도
        for (let i = 0; i < nodes.length; i++) {
            const nodeName = nodes[i];
            const words = nodeName.toLowerCase().split(/\s+/);
            
            // 노드 이름에 포함된 단어 중 하나라도 일치하는 다른 노드 찾기
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue; // 같은 노드 건너뛰기
                
                const otherName = nodes[j];
                const otherWords = otherName.toLowerCase().split(/\s+/);
                
                // 단어 교집합 찾기
                const commonWords = words.filter(word => 
                    word.length > 3 && otherWords.some(other => other.includes(word) || word.includes(other))
                );
                
                // 공통 단어가 있고 25% 확률로 연결
                if (commonWords.length > 0 && Math.random() < 0.25) {
                    const connectionKey = `${nodeName}||${otherName}`;
                    if (!this.conceptData.connections.has(connectionKey)) {
                        this.addConnection(nodeName, otherName);
                        console.log(`[네트워크] 의미론적 연결: ${nodeName} <-> ${otherName} (공통: ${commonWords.join(', ')})`);
                    }
                }
            }
        }
    }
    
    /**
     * 관련 개념들 간 상호 연결 생성
     */
    createInterConnections(parentConcept: string, relatedConcepts: string[]): void {
        // 모든 관련 개념을 부모와 연결
        for (const concept of relatedConcepts) {
            this.addConnection(parentConcept, concept);
        }
        
        // 관련 개념들 사이에도 더 많은 연결 생성 (네트워크 복잡도 크게 증가)
        if (relatedConcepts.length >= 2) {
            // 각 개념은 최소 1개, 최대 3개의 다른 관련 개념과 연결 (또는 가능한 모든 개념)
            const maxConnections = Math.min(3, relatedConcepts.length - 1);
            const minConnections = Math.min(1, relatedConcepts.length - 1);
            
            for (let i = 0; i < relatedConcepts.length; i++) {
                // 더 많은 연결 생성 (최소 minConnections개)
                const connections = minConnections + Math.floor(Math.random() * (maxConnections - minConnections + 1));
                const availableConcepts = relatedConcepts.filter((_, index) => index !== i);
                
                // 셔플하여 무작위 연결 선택
                const shuffled = this.shuffleArray([...availableConcepts]);
                const selected = shuffled.slice(0, Math.min(connections, shuffled.length));
                
                // 선택된 개념들과 연결
                for (const targetConcept of selected) {
                    this.addConnection(relatedConcepts[i], targetConcept);
                    console.log(`[네트워크] 개념 간 직접 연결: ${relatedConcepts[i]} <-> ${targetConcept}`);
                }
            }
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
    private shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    /**
     * 전체 개념 네트워크 데이터 가져오기
     */
    getConceptData() {
        return this.conceptData;
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
        this.conceptData.connections.forEach((conn) => {
            const [source, target] = conn.split('||');
            if (!connections[source]) {
                connections[source] = [];
            }
            connections[source].push({target});
        });
        
        return connections;
    }
    
    /**
     * 네트워크 데이터 초기화
     */
    resetConceptData(): void {
        this.conceptData = {
            nodes: new Map(),
            connections: new Set()
        };
    }
} 