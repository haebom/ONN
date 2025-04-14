/**
 * Extracts concepts (typically quoted strings or lines) from raw text.
 * Now also extracts descriptions for each concept as "concept - description" format.
 */
export function extractConceptsFromText(text: string): string[] {
    // 먼저 JSON 배열 형식을 찾음 (정규식에서 's' 플래그를 사용하지 않음)
    const jsonMatch = text.replace(/\n/g, ' ').match(/\[(.*)\]/);
    if (jsonMatch) {
        try {
            const jsonStr = jsonMatch[0];
            const parsed = JSON.parse(jsonStr);
            
            // 객체 배열 형태 {concept, description}인 경우 "concept - description" 형식으로 변환
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                if (parsed.every(item => typeof item.concept === 'string')) {
                    return parsed.map(item => {
                        if (item.description && item.description.trim() !== '') {
                            return `${item.concept} - ${item.description}`;
                        }
                        return item.concept;
                    });
                }
            }
            
            // 문자열 배열 형태인 경우 그대로 반환
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                return parsed;
            }
        } catch (e) {
            console.error('JSON 파싱 오류:', e);
        }
    }
    
    // 정규식 및 라인 분리 방식으로 추출 시도 (기존 로직)
    const quotedRegex = /\"([^\"]+)\"/g;
    const quotedMatches = Array.from(text.matchAll(quotedRegex));
    const extractedQuotedWords = quotedMatches.map((match: RegExpMatchArray) => match[1]);

    console.log('기존 방식으로 추출된 개념:', extractedQuotedWords);

    // 메타데이터 키워드 필터링
    const metadataKeys = ['Concept', 'concept', 'fullPath', 'path', 'depth', 'Path', 'Depth'];
    let filteredWords = extractedQuotedWords;

    if (extractedQuotedWords.some(word => metadataKeys.includes(word))) {
        const metadataIndices: number[] = metadataKeys.flatMap(key => {
            const indices: number[] = [];
            extractedQuotedWords.forEach((word, index) => {
                if (word === key) indices.push(index, index + 1);
            });
            return indices;
        });

        filteredWords = extractedQuotedWords.filter((_, index) => !metadataIndices.includes(index));
    }

    // 기존 추출 방식으로 발견된 개념들
    if (filteredWords.length > 0) {
        return filteredWords;
    }

    // 마지막 대안: 라인 기반 추출
    const lineBasedConcepts = text.split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.includes(':') && !line.startsWith('[') && !line.endsWith(']'));
    
    return lineBasedConcepts;
}