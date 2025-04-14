// 언어별 레이블 정의
export type LanguageLabels = {
    relatedConcepts: string;
    conceptPath: string;
    exploring: string;
    completed: string;
    level: string;
    // 설정 탭 레이블
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
    // 모달 레이블
    explorer: string;
    rootConcept: string;
    rootConceptDesc: string;
    depthSetting: string;
    depthSettingDesc: string;
    start: string;
    cancel: string;
    // 알림 메시지
    selectText: string;
    errorExpanding: string;
    connectionError: string;
    enterRoot: string;
    modelsFound: string;
    noModels: string;
    // 개념 확장 모달
    expandTitle: string;
    selectedConcept: string;
    expandDepth: string;
    expandDepthDesc: string;
    startExpand: string;
    // LLM 서비스 선택
    llmService: string;
    llmServiceDesc: string;
    openaiApiKey: string;
    openaiApiKeyDesc: string;
    claudeApiKey: string;
    claudeApiKeyDesc: string;
    geminiApiKey: string;
    geminiApiKeyDesc: string;
    // 모델 설정
    openaiModel: string;
    openaiModelDesc: string;
    claudeModel: string;
    claudeModelDesc: string;
    // MCP 설정
    useMcp: string;
    useMcpDesc: string;
    mcpType: string; 
    mcpTypeDesc: string;
    mcpCommand: string;
    mcpCommandDesc: string;
    mcpArgs: string;
    mcpArgsDesc: string;
    mcpUrl: string;
    mcpUrlDesc: string;
    // MCP 사용법
    mcpHowToUse: string;
    mcpObsidianLimitation: string;
    mcpRunServerFirst: string;
    mcpCheckHttpEndpoint: string;
    mcpSaveCommandArgs: string;
    mcpSseHowToUse: string;
    mcpSseEnterUrl: string;
    mcpSseCheckRunning: string;
    mcpSseClaudeConfig: string;
    mcpCopyCommand: string;
    mcpCommandCopied: string;
    // 추가 국제화 레이블
    stdioLocalServer: string;
    sseRemoteServer: string;
    custom: string;
    modelDesc: string;
    // AI 앱 설정
    aiApp: string;
    aiAppDesc: string;
    aiAppObsidian: string;
    aiAppClaude: string;
    aiAppChatGPT: string;
    aiAppCustom: string;
    aiAppInstructions: string;
    clipboardCopied: string;
    resultPaste: string;
    conceptsAdded: string;
    // 외부 앱 연동 안내
    externalAppStep1: string;
    externalAppStep2: string;
    externalAppStep3: string;
    externalAppJsonRequirement: string;
    // 결과 모달
    externalAppResult: string;
    claudeResult: string;
    chatGPTResult: string;
    copiedPrompt: string;
    copyPromptAgain: string;
    resultInput: string;
    resultInputDesc: string;
    resultPlaceholder: string;
    pasteFromClipboard: string;
    clipboardAccessError: string;
    confirm: string;
    modalCancel: string;
    noResultError: string;
    // 연결 유형 설정 레이블 추가
    connectionType: string; 
    connectionTypeDesc: string;
    // 설정 탭 제목
    connectionTabTitle: string;
    generalTabTitle: string;
    inputTabTitle: string;
    outputTabTitle: string;
    // 파일 입력 설정
    enableFileInput: string;
    enableFileInputDesc: string;
    supportedFileTypes: string;
    supportedFileTypesDesc: string;
    enableClipboardMonitoring: string;
    enableClipboardMonitoringDesc: string;
    // 출력 설정
    enableGraphView: string;
    enableGraphViewDesc: string;
    enablePageOutline: string;
    enablePageOutlineDesc: string;
    // 파일 입력 모달
    fileInputTitle: string;
    dropFileHere: string;
    selectFile: string;
    pasteText: string;
    processingFile: string;
    fileProcessed: string;
    fileProcessError: string;
    unsupportedFileType: string;
    // 결과 라벨
    save: string;
    saveLocation: string;
    exploreDeeper: string;
    close: string;
    noResults: string;
    failed: string;
    generating: string;
};

export const LANGUAGE_LABELS: Record<string, LanguageLabels> = {
    'ko': {
        relatedConcepts: '관련 개념',
        conceptPath: '개념 경로',
        exploring: '개념 탐색 중',
        completed: '개념 웹 생성 완료!',
        level: '레벨',
        // 설정 탭 레이블
        settings: '개념 탐색기 설정',
        language: '언어 / Language',
        languageDesc: '노트 및 UI에 사용할 언어를 선택하세요 / Select language for notes and UI',
        ollamaModel: 'Ollama 모델',
        ollamaModelDesc: '사용할 로컬 LLM 모델 선택',
        refreshModel: '모델 목록 새로고침',
        refreshModelDesc: 'Ollama 서버에서 사용 가능한 모델 목록을 다시 로드합니다',
        diversity: '다양성 바이어스',
        diversityDesc: '높을수록 더 다양한 개념을 찾습니다 (0.0-1.0)',
        maxDepth: '기본 최대 깊이',
        maxDepthDesc: '기본 탐색 깊이 설정',
        maxConcepts: '개념 수 제한',
        maxConceptsDesc: '각 개념당 생성할 최대 관련 개념 수',
        customPrompt: '사용자 정의 프롬프트 템플릿',
        customPromptDesc: `<p>개념 생성에 사용할 프롬프트 템플릿을 직접 정의할 수 있습니다.</p>
<p>비워두면 기본 템플릿이 사용됩니다.</p>
<p>다음 변수를 사용할 수 있습니다:</p>
<ul>
    <li><code>{concept}</code> - 현재 개념</li>
    <li><code>{numConcepts}</code> - 생성할 개념 수</li>
    <li><code>{fullPath}</code> - 현재까지의 개념 경로</li>
    <li><code>{depth}</code> - 현재 깊이</li>
</ul>
<p>항상 JSON 형식의 배열로 반환되도록 프롬프트를 작성하세요.</p>`,
        resetPrompt: '기본값으로 초기화',
        outputFolder: '출력 폴더',
        outputFolderDesc: '생성된 노트를 저장할 폴더 경로',
        // 모달 레이블
        explorer: '개념 탐색기',
        rootConcept: '루트 개념',
        rootConceptDesc: '탐색을 시작할 개념을 입력하세요',
        depthSetting: '최대 깊이',
        depthSettingDesc: '개념 확장의 최대 깊이',
        start: '탐색 시작',
        cancel: '취소',
        // 알림 메시지
        selectText: '텍스트를 선택해주세요',
        errorExpanding: '개념 확장 중 오류가 발생했습니다',
        connectionError: '로컬 LLM 연결 오류. Ollama가 실행 중인지 확인해주세요.',
        enterRoot: '루트 개념을 입력해주세요',
        modelsFound: '개의 모델을 발견했습니다',
        noModels: '사용 가능한 모델이 없습니다. Ollama에서 모델을 먼저 다운로드하세요.',
        // 개념 확장 모달
        expandTitle: '개념 확장',
        selectedConcept: '선택된 개념',
        expandDepth: '확장 깊이',
        expandDepthDesc: '개념 확장의 깊이', 
        startExpand: '확장 시작',
        // LLM 서비스 선택
        llmService: 'LLM 서비스',
        llmServiceDesc: '개념 생성에 사용할 LLM 서비스 선택',
        openaiApiKey: 'OpenAI API 키',
        openaiApiKeyDesc: 'OpenAI API 키를 입력하세요',
        claudeApiKey: 'Claude API 키',
        claudeApiKeyDesc: 'Anthropic Claude API 키를 입력하세요',
        geminiApiKey: 'Gemini API 키',
        geminiApiKeyDesc: 'Google Gemini API 키를 입력하세요',
        // 모델 설정
        openaiModel: 'OpenAI 모델',
        openaiModelDesc: '사용할 OpenAI 모델 선택',
        claudeModel: 'Claude 모델',
        claudeModelDesc: '사용할 Claude 모델 선택',
        // MCP 설정
        useMcp: 'MCP 사용',
        useMcpDesc: 'Model Context Protocol을 사용하여 API 키 없이 LLM에 접근합니다',
        mcpType: 'MCP 서버 유형',
        mcpTypeDesc: 'stdio(로컬 실행) 또는 SSE(원격 연결) 중 선택',
        mcpCommand: 'MCP 실행 명령어',
        mcpCommandDesc: 'stdio 서버 실행 명령어 (예: npx)',
        mcpArgs: 'MCP 실행 인자',
        mcpArgsDesc: 'stdio 서버 실행 인자 (예: -y @modelcontextprotocol/server-openai)',
        mcpUrl: 'MCP 서버 URL',
        mcpUrlDesc: 'SSE 서버 URL (예: http://localhost:3030)',
        // 추가 국제화 레이블
        stdioLocalServer: 'Stdio (로컬 서버)',
        sseRemoteServer: 'SSE (원격 서버)',
        custom: '사용자 정의',
        modelDesc: '사용할 MCP 모델 선택',
        // MCP 사용법
        mcpHowToUse: 'MCP 사용 방법',
        mcpObsidianLimitation: '※ Obsidian은 브라우저 환경으로 인해 직접 외부 명령어를 실행할 수 없습니다.',
        mcpRunServerFirst: '1. 터미널에서 MCP 서버를 먼저 실행해주세요:',
        mcpCheckHttpEndpoint: '2. MCP 서버가 로컬 HTTP 엔드포인트를 제공하는지 확인하세요.',
        mcpSaveCommandArgs: '3. 위 설정에서 사용할 명령어와 인자만 저장하세요.',
        mcpSseHowToUse: 'MCP SSE 사용 방법',
        mcpSseEnterUrl: '1. MCP SSE 서버가 제공하는 URL을 입력하세요.',
        mcpSseCheckRunning: '2. 서버가 실행 중인지 확인하세요.',
        mcpSseClaudeConfig: '※ Claude 데스크톱 앱 연동 시 기본 설정을 확인하세요:',
        mcpCopyCommand: '명령어 복사',
        mcpCommandCopied: 'MCP 명령어가 클립보드에 복사되었습니다.',
        // AI 앱 설정
        aiApp: 'AI 앱 선택',
        aiAppDesc: '개념 탐색에 사용할 AI 앱을 선택하세요',
        aiAppObsidian: '옵시디언 내에서 처리 (Ollama)',
        aiAppClaude: 'Claude와 연동',
        aiAppChatGPT: 'ChatGPT와 연동',
        aiAppCustom: '사용자 정의 앱',
        aiAppInstructions: '외부 앱 사용 방법',
        clipboardCopied: '클립보드에 명령어가 복사되었습니다. 해당 앱에 붙여넣기하세요.',
        resultPaste: '결과를 받으면 다시 여기에 붙여넣으세요.',
        conceptsAdded: '개의 관련 개념을 추가했습니다.',
        // 외부 앱 연동 안내
        externalAppStep1: '프롬프트가 클립보드에 복사됩니다.',
        externalAppStep2: '앱에 붙여넣기하세요.',
        externalAppStep3: '결과를 복사하여 Obsidian으로 돌아오면 자동으로 처리됩니다.',
        externalAppJsonRequirement: '결과는 반드시 JSON 형식(["개념1", "개념2", ...])으로 받아야 합니다.',
        // 결과 모달
        externalAppResult: '외부 앱 결과',
        claudeResult: 'Claude 결과',
        chatGPTResult: 'ChatGPT 결과',
        copiedPrompt: '복사된 프롬프트:',
        copyPromptAgain: '프롬프트 다시 복사',
        resultInput: '결과 입력:',
        resultInputDesc: '외부 앱에서 받은 결과를 아래에 붙여넣거나 입력하세요.',
        resultPlaceholder: '여기에 결과를 붙여넣거나 직접 입력하세요...',
        pasteFromClipboard: '클립보드에서 붙여넣기',
        clipboardAccessError: '클립보드 접근 오류:',
        confirm: '확인',
        modalCancel: '취소',
        noResultError: '결과가 입력되지 않았습니다.',
        // 연결 유형 설정 레이블
        connectionType: '연결 방식',
        connectionTypeDesc: '개념 생성에 사용할 연결 방식을 선택하세요 (API 키 또는 MCP 서버)',
        // 설정 탭 제목
        connectionTabTitle: '연결 설정',
        generalTabTitle: '일반 설정',
        inputTabTitle: '입력 설정',
        outputTabTitle: '출력 설정',
        // 파일 입력 설정
        enableFileInput: '파일 입력 활성화',
        enableFileInputDesc: 'PDF, DOCX, TXT 등의 파일 업로드를 통한 개념 추출 활성화',
        supportedFileTypes: '지원 파일 형식',
        supportedFileTypesDesc: '쉼표로 구분된 지원 파일 확장자 목록',
        enableClipboardMonitoring: '클립보드 모니터링 활성화',
        enableClipboardMonitoringDesc: '클립보드에 복사된 텍스트를 자동으로 감지하여 분석',
        // 출력 설정
        enableGraphView: '그래프 뷰 활성화',
        enableGraphViewDesc: '개념 간의 관계를 그래프 형태로 시각화',
        enablePageOutline: '페이지 개요 생성 활성화',
        enablePageOutlineDesc: '각 페이지에 대한 개요를 자동으로 생성',
        // 파일 입력 모달
        fileInputTitle: '파일/텍스트 입력',
        dropFileHere: '여기에 파일을 드래그 앤 드롭하세요',
        selectFile: '파일 선택',
        pasteText: '텍스트 붙여넣기',
        processingFile: '파일 처리 중...',
        fileProcessed: '파일 처리 완료',
        fileProcessError: '파일 처리 중 오류가 발생했습니다',
        unsupportedFileType: '지원하지 않는 파일 형식입니다',
        // 결과 라벨
        save: '저장',
        saveLocation: '저장 위치',
        exploreDeeper: '더 깊이 탐색',
        close: '닫기',
        noResults: '결과가 없습니다',
        failed: '실패',
        generating: '생성 중',
    },
    'en': {
        relatedConcepts: 'Related Concepts',
        conceptPath: 'Concept Path',
        exploring: 'Exploring concept',
        completed: 'Concept web generation completed!',
        level: 'Level',
        // 설정 탭 레이블
        settings: 'Concept Explorer Settings',
        language: 'Language / 언어',
        languageDesc: 'Select language for notes and UI / 노트 및 UI에 사용할 언어를 선택하세요',
        ollamaModel: 'Ollama Model',
        ollamaModelDesc: 'Select local LLM model to use',
        refreshModel: 'Refresh Model List',
        refreshModelDesc: 'Reload available models from Ollama server',
        diversity: 'Diversity Bias',
        diversityDesc: 'Higher values find more diverse concepts (0.0-1.0)',
        maxDepth: 'Default Max Depth',
        maxDepthDesc: 'Set default exploration depth',
        maxConcepts: 'Concepts Limit',
        maxConceptsDesc: 'Maximum number of related concepts to generate per concept',
        customPrompt: 'Custom Prompt Template',
        customPromptDesc: `<p>Define your own prompt template for concept generation.</p>
<p>Leave empty to use the default template.</p>
<p>You can use the following variables:</p>
<ul>
    <li><code>{concept}</code> - current concept</li>
    <li><code>{numConcepts}</code> - number of concepts to generate</li>
    <li><code>{fullPath}</code> - full concept path so far</li>
    <li><code>{depth}</code> - current depth</li>
</ul>
<p>Make sure your prompt returns a JSON array of strings.</p>`,
        resetPrompt: 'Reset to Default',
        outputFolder: 'Output Folder',
        outputFolderDesc: 'Path for saving generated notes',
        // 모달 레이블
        explorer: 'Concept Explorer',
        rootConcept: 'Root Concept',
        rootConceptDesc: 'Enter a concept to start exploring',
        depthSetting: 'Maximum Depth',
        depthSettingDesc: 'Maximum depth of concept expansion',
        start: 'Start Exploration',
        cancel: 'Cancel',
        // 알림 메시지
        selectText: 'Please select some text',
        errorExpanding: 'Error occurred while expanding concepts',
        connectionError: 'Local LLM connection error. Please make sure Ollama is running.',
        enterRoot: 'Please enter a root concept',
        modelsFound: 'model(s) found',
        noModels: 'No available models. Please download models in Ollama first.',
        // 개념 확장 모달
        expandTitle: 'Expand Concept',
        selectedConcept: 'Selected concept',
        expandDepth: 'Expansion Depth',
        expandDepthDesc: 'Depth of concept expansion',
        startExpand: 'Start Expansion',
        // LLM 서비스 선택
        llmService: 'LLM Service',
        llmServiceDesc: 'Select the LLM service to use for concept generation',
        openaiApiKey: 'OpenAI API Key',
        openaiApiKeyDesc: 'Enter your OpenAI API key',
        claudeApiKey: 'Claude API Key',
        claudeApiKeyDesc: 'Enter your Anthropic Claude API key',
        geminiApiKey: 'Gemini API Key',
        geminiApiKeyDesc: 'Enter your Google Gemini API key',
        // 모델 설정
        openaiModel: 'OpenAI Model',
        openaiModelDesc: 'Select OpenAI model to use',
        claudeModel: 'Claude Model',
        claudeModelDesc: 'Select Claude model to use',
        // MCP 설정
        useMcp: 'Use MCP',
        useMcpDesc: 'Use Model Context Protocol to access LLMs without API keys',
        mcpType: 'MCP Server Type',
        mcpTypeDesc: 'Choose between stdio (local execution) or SSE (remote connection)',
        mcpCommand: 'MCP Command',
        mcpCommandDesc: 'Command to execute stdio server (e.g. npx)',
        mcpArgs: 'MCP Arguments',
        mcpArgsDesc: 'Arguments for stdio server (e.g. -y @modelcontextprotocol/server-openai)',
        mcpUrl: 'MCP Server URL',
        mcpUrlDesc: 'URL for SSE server (e.g. http://localhost:3030)',
        // 추가 국제화 레이블
        stdioLocalServer: 'Stdio (Local Server)',
        sseRemoteServer: 'SSE (Remote Server)',
        custom: 'Custom',
        modelDesc: 'Select MCP model to use',
        // MCP 사용법
        mcpHowToUse: 'How to Use MCP',
        mcpObsidianLimitation: '※ Obsidian cannot execute external commands directly due to browser environment restrictions.',
        mcpRunServerFirst: '1. Run the MCP server in your terminal first:',
        mcpCheckHttpEndpoint: '2. Make sure the MCP server provides a local HTTP endpoint.',
        mcpSaveCommandArgs: '3. Save only the command and arguments in the settings above.',
        mcpSseHowToUse: 'How to Use MCP SSE',
        mcpSseEnterUrl: '1. Enter the URL provided by the MCP SSE server.',
        mcpSseCheckRunning: '2. Make sure the server is running.',
        mcpSseClaudeConfig: '※ For Claude Desktop integration, check the default configuration:',
        mcpCopyCommand: 'Copy Command',
        mcpCommandCopied: 'MCP command copied to clipboard.',
        // AI 앱 설정
        aiApp: 'AI App Selection',
        aiAppDesc: 'Select AI app for concept exploration',
        aiAppObsidian: 'Process in Obsidian (Ollama)',
        aiAppClaude: 'Integrate with Claude',
        aiAppChatGPT: 'Integrate with ChatGPT',
        aiAppCustom: 'Custom app',
        aiAppInstructions: 'How to Use External App',
        clipboardCopied: 'Command copied to clipboard. Paste it in the app.',
        resultPaste: 'After getting results, paste them back here.',
        conceptsAdded: 'related concepts added.',
        // 외부 앱 연동 안내
        externalAppStep1: 'The prompt will be copied to clipboard.',
        externalAppStep2: 'Paste it into the app.',
        externalAppStep3: 'Copy the result and return to Obsidian - it will be processed automatically.',
        externalAppJsonRequirement: 'Results must be in JSON format (["concept1", "concept2", ...]).',
        // 결과 모달
        externalAppResult: 'External App Result',
        claudeResult: 'Claude Result',
        chatGPTResult: 'ChatGPT Result',
        copiedPrompt: 'Copied Prompt:',
        copyPromptAgain: 'Copy Prompt Again',
        resultInput: 'Result Input:',
        resultInputDesc: 'Paste or enter the result from the external app below.',
        resultPlaceholder: 'Paste or enter your result here...',
        pasteFromClipboard: 'Paste from Clipboard',
        clipboardAccessError: 'Clipboard access error:',
        confirm: 'Confirm',
        modalCancel: 'Cancel',
        noResultError: 'No result was entered.',
        // 연결 유형 설정 레이블
        connectionType: 'Connection Type',
        connectionTypeDesc: 'Select connection type for concept generation (API Keys or MCP Server)',
        // 설정 탭 제목
        connectionTabTitle: 'Connection Settings',
        generalTabTitle: 'General Settings',
        inputTabTitle: 'Input Settings',
        outputTabTitle: 'Output Settings',
        // 파일 입력 설정
        enableFileInput: 'Enable File Input',
        enableFileInputDesc: 'Enable concept extraction from PDF, DOCX, TXT, and other file formats',
        supportedFileTypes: 'Supported File Types',
        supportedFileTypesDesc: 'Comma-separated list of supported file extensions',
        enableClipboardMonitoring: 'Enable Clipboard Monitoring',
        enableClipboardMonitoringDesc: 'Automatically detect and analyze text copied to clipboard',
        // 출력 설정
        enableGraphView: 'Enable Graph View',
        enableGraphViewDesc: 'Visualize relationships between concepts as a graph',
        enablePageOutline: 'Enable Page Outline',
        enablePageOutlineDesc: 'Automatically generate outlines for each page',
        // 파일 입력 모달
        fileInputTitle: 'File/Text Input',
        dropFileHere: 'Drop file here',
        selectFile: 'Select File',
        pasteText: 'Paste Text',
        processingFile: 'Processing file...',
        fileProcessed: 'File processed successfully',
        fileProcessError: 'Error processing file',
        unsupportedFileType: 'Unsupported file type',
        // 결과 라벨
        save: 'Save',
        saveLocation: 'Save Location',
        exploreDeeper: 'Explore Deeper',
        close: 'Close',
        noResults: 'No Results',
        failed: 'Failed',
        generating: 'Generating',
    },
}; 