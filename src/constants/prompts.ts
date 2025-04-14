// 기본 프롬프트 템플릿 정의
export const DEFAULT_PROMPT_TEMPLATE = `You are an idea generator. Your task is to take an input concept ("{concept}"), and generate {maxConcepts} related concepts.

1. Generate {maxConcepts} new, thought-provoking, or unexpected ideas that relate to the concept "{concept}" in interesting ways.
2. ALL results MUST be in {language} (not English).
3. For each concept, also provide a brief explanation of its relationship to "{concept}".
4. Output a JSON array where each element is a string formatted like "Concept - Explanation"
5. Generate at least {maxConcepts} distinct concepts.

Example output:
["Related concept 1 - Brief explanation of how this relates to {concept}", 
"Related concept 2 - Brief explanation of how this relates to {concept}"]`; 