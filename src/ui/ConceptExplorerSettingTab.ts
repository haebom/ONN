import { App, Notice, PluginSettingTab, Setting, DropdownComponent } from 'obsidian';
import ConceptExplorerPlugin from '../../main'; // Adjust path if needed
import { DEFAULT_PROMPT_TEMPLATE, LANGUAGE_LABELS } from '../constants';
import { IConceptExplorerPlugin, LanguageCode, LanguageLabels } from '../models';

export class ConceptExplorerSettingTab extends PluginSettingTab {
	pluginInstance: IConceptExplorerPlugin;
	availableModels: string[] = [];
	modelDropdown: DropdownComponent | null = null;

	constructor(app: App, plugin: ConceptExplorerPlugin) {
		super(app, plugin);
		this.pluginInstance = plugin;
		this.loadAvailableModels();
	}
	
	async loadAvailableModels() {
		try {
			// 현재 선택된 서비스의 모델만 가져오기
			this.availableModels = await this.pluginInstance.getAvailableModels();
			
			// Ollama인 경우만 추가 필터링 적용
			if (this.pluginInstance.settings.llmService === 'ollama') {
				// 모델이 너무 많은 경우
				if (this.availableModels.length > 10) {
					// 현재 선택된 모델
					const currentModel = this.pluginInstance.settings.model;
					const filteredModels: string[] = [];
					
					// 현재 선택된 모델이 있으면 포함
					if (currentModel && this.availableModels.includes(currentModel)) {
							filteredModels.push(currentModel);
					}
					
					// 우선순위 모델 목록 (최신 또는 인기 모델)
					const priorityModels = ['llama3', 'llama3:8b', 'llama3:70b', 'mistral', 'gemma:7b', 'phi'];
					
					// 우선순위 모델 먼저 찾기
					for (const model of this.availableModels) {
						if (!filteredModels.includes(model)) {
							// 대소문자 구분 없이 포함 여부 확인
							if (priorityModels.some(pm => model.toLowerCase().includes(pm.toLowerCase()))) {
								filteredModels.push(model);
							}
						}
					}
					
					// 결과가 적으면 나머지 모델도 추가 (최대 10개)
					if (filteredModels.length < 5) {
						for (const model of this.availableModels) {
							if (!filteredModels.includes(model)) {
								filteredModels.push(model);
								if (filteredModels.length >= 10) break;
							}
						}
					}
					
					// 중복 제거
					this.availableModels = [...new Set(filteredModels)];
				}
			}
		} catch (error: any) {
			console.error('모델 목록 로드 실패:', error);
			this.availableModels = [];
		}
	}

	display(): void {
		const { containerEl } = this;
		const labels: LanguageLabels = LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode] || LANGUAGE_LABELS['en'];
		containerEl.empty();

		containerEl.createEl('h2', {text: labels.settings});

		// 언어 설정
		new Setting(containerEl)
			.setName(labels.language)
			.setDesc(labels.languageDesc)
			.addDropdown(dropdown => dropdown
				.addOption('ko', '한국어')
				.addOption('en', 'English')
				.setValue(this.pluginInstance.settings.language)
				.onChange(async (value) => {
					this.pluginInstance.settings.language = value as LanguageCode;
					await this.pluginInstance.saveSettings();
					this.display(); 
				})
			);
		
		// LLM 서비스 선택 설정
		new Setting(containerEl)
			.setName(labels.llmService)
			.setDesc(labels.llmServiceDesc)
			.addDropdown(dropdown => dropdown
				.addOption('openai', 'OpenAI')
				.addOption('claude', 'Claude')
				.addOption('gemini', 'Google Gemini')
				.addOption('ollama', 'Ollama')
				.addOption('mcp', 'Model Context Protocol')
				.setValue(this.pluginInstance.settings.llmService)
				.onChange(async (value) => {
					this.pluginInstance.settings.llmService = value;
					await this.pluginInstance.saveSettings();
					this.display();
				})
			);
		
		// API 키 설정 (선택된 LLM 서비스에 따라)
		if (this.pluginInstance.settings.llmService === 'openai') {
			this.displayAPISettings(containerEl, labels);
		} else if (this.pluginInstance.settings.llmService === 'claude') {
			this.displayAPISettings(containerEl, labels);
		} else if (this.pluginInstance.settings.llmService === 'gemini') {
			this.displayAPISettings(containerEl, labels);
		} else if (this.pluginInstance.settings.llmService === 'ollama') {
			this.displayOllamaSettings(containerEl);
		} else if (this.pluginInstance.settings.llmService === 'mcp') {
			this.displayMCPSettings(containerEl, labels);
		}
		
		// 기타 설정 추가 (Moved from plugin)
		new Setting(containerEl)
            .setName(labels.maxDepth)
            .setDesc(labels.maxDepthDesc)
            .addSlider(slider => slider
                .setLimits(1, 5, 1)
                .setValue(this.pluginInstance.settings.maxDepth)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.pluginInstance.settings.maxDepth = value;
                    await this.pluginInstance.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName(labels.maxConcepts)
            .setDesc(labels.maxConceptsDesc)
            .addSlider(slider => slider
                .setLimits(1, 10, 1) 
                .setValue(this.pluginInstance.settings.maxConceptsPerLevel)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.pluginInstance.settings.maxConceptsPerLevel = value;
                    await this.pluginInstance.saveSettings();
                }));

        new Setting(containerEl)
            .setName(labels.diversity)
            .setDesc(labels.diversityDesc)
            .addSlider(slider => slider
                .setLimits(0, 1, 0.1)
                .setValue(this.pluginInstance.settings.diversity)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.pluginInstance.settings.diversity = value;
                    await this.pluginInstance.saveSettings();
                }));
        
        // 사용자 정의 프롬프트 설정
        const customPromptSetting = new Setting(containerEl)
            .setName(labels.customPrompt)
            .setDesc(createFragment(el => {
                const desc = document.createElement('div');
                desc.innerHTML = labels.customPromptDesc;
                el.appendChild(desc);
            }));
        
        // 텍스트 영역 추가 (여러 줄 입력 가능)
        const textArea = createEl('textarea');
        // 저장된 사용자 정의 프롬프트 또는 기본 프롬프트 로드
        textArea.value = this.pluginInstance.settings.customPrompt || DEFAULT_PROMPT_TEMPLATE;
        textArea.rows = 10;
        textArea.style.width = '100%';
        textArea.style.marginBottom = '8px';
        textArea.addEventListener('change', async () => {
            this.pluginInstance.settings.customPrompt = textArea.value;
            await this.pluginInstance.saveSettings();
        });
        
        // 텍스트 영역을 설정에 추가
        customPromptSetting.settingEl.appendChild(textArea);
        
        // 기본값으로 리셋 버튼 추가
        const resetButton = createEl('button');
        resetButton.textContent = labels.resetPrompt;
        resetButton.style.marginTop = '8px';
        resetButton.addEventListener('click', async () => {
            textArea.value = DEFAULT_PROMPT_TEMPLATE;
            this.pluginInstance.settings.customPrompt = DEFAULT_PROMPT_TEMPLATE;
            await this.pluginInstance.saveSettings();
        });
        
        customPromptSetting.settingEl.appendChild(resetButton);
        
        new Setting(containerEl)
            .setName(labels.outputFolder)
            .setDesc(labels.outputFolderDesc)
            .addText(text => text
                .setValue(this.pluginInstance.settings.outputFolder)
                .onChange(async (value) => {
                    this.pluginInstance.settings.outputFolder = value;
                    await this.pluginInstance.saveSettings();
                }))
            
        // 자동 저장 설정
        new Setting(containerEl)
            .setName(labels.autoSaveNotes)
            .setDesc(labels.autoSaveNotesDesc)
            .addToggle(toggle => toggle
                .setValue(this.pluginInstance.settings.autoSaveNotes)
                .onChange(async (value) => {
                    this.pluginInstance.settings.autoSaveNotes = value;
                    await this.pluginInstance.saveSettings();
                }));
	}

	// API 키 설정 표시 메서드
	displayAPISettings(containerEl: HTMLElement, labels: LanguageLabels) {
		// Claude API 키 설정
		new Setting(containerEl)
			.setName(labels.claudeApiKey || 'Claude API Key') 
			.setDesc(labels.claudeApiKeyDesc || 'Enter your Anthropic Claude API key') 
			.addText(text => text
				.setPlaceholder('sk-ant-...')
				.setValue(this.pluginInstance.settings.claudeApiKey || '')
				.onChange(async (value) => {
					this.pluginInstance.settings.claudeApiKey = value;
					if (value) {
						// Cannot directly set model here as it depends on plugin logic
					}
					await this.pluginInstance.saveSettings();
				})
			);

		// OpenAI API 키 설정
		new Setting(containerEl)
			.setName(labels.openaiApiKey || 'OpenAI API Key') 
			.setDesc(labels.openaiApiKeyDesc || 'Enter your OpenAI API key') 
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.pluginInstance.settings.openaiApiKey || '')
				.onChange(async (value) => {
					this.pluginInstance.settings.openaiApiKey = value;
					if (value && !this.pluginInstance.settings.claudeApiKey) {
						// Cannot directly set model here
					}
					await this.pluginInstance.saveSettings();
				})
			);
	}

	// MCP 관련 설정 표시
	displayMCPSettings(containerEl: HTMLElement, currentLabels: LanguageLabels) {
		new Setting(containerEl)
			.setName(currentLabels.mcpType || 'MCP Server Type')
			.setDesc(currentLabels.mcpTypeDesc || 'Choose between stdio (local execution) or SSE (remote connection)')
			.addDropdown(dropdown => dropdown
				.addOption('stdio', currentLabels.stdioLocalServer || 'Stdio (Local Server)')
				.addOption('sse', currentLabels.sseRemoteServer || 'SSE (Remote Server)')
				.setValue(this.pluginInstance.settings.mcpType)
				.onChange(async (value) => {
					this.pluginInstance.settings.mcpType = value;
					await this.pluginInstance.saveSettings();
					this.display();
				})
			);
			
		new Setting(containerEl)
			.setName(currentLabels.model || 'MCP Model') 
			.setDesc(currentLabels.modelDesc || 'Select MCP model to use') 
			.addDropdown(dropdown => dropdown
				.addOption('claude', 'Claude')
				.addOption('openai', 'OpenAI')
				.addOption('custom', currentLabels.custom || 'Custom')
				.setValue(this.pluginInstance.settings.model || 'claude')
				.onChange(async (value) => {
					this.pluginInstance.settings.model = value;
					
					if (value === 'claude') {
						this.pluginInstance.settings.mcpArgs = '-y @modelcontextprotocol/server-claude';
					} else if (value === 'openai') {
						this.pluginInstance.settings.mcpArgs = '-y @modelcontextprotocol/server-openai';
					}
					
					await this.pluginInstance.saveSettings();
					this.display();
				})
			);
			
		if (this.pluginInstance.settings.mcpType === 'stdio') {
			new Setting(containerEl)
				.setName(currentLabels.mcpCommand || 'MCP Command')
				.setDesc(currentLabels.mcpCommandDesc || 'Command to execute stdio server (e.g. npx)')
				.addText(text => text
					.setPlaceholder('npx')
					.setValue(this.pluginInstance.settings.mcpCommand)
					.onChange(async (value) => {
						this.pluginInstance.settings.mcpCommand = value;
						await this.pluginInstance.saveSettings();
					})
				);
				
			const mcpArgsPlaceholder = this.pluginInstance.settings.model === 'claude' ?
				'-y @modelcontextprotocol/server-claude' : 
				(this.pluginInstance.settings.model === 'openai' ?
					'-y @modelcontextprotocol/server-openai' : 
					'-y @modelcontextprotocol/server-custom');
				
			new Setting(containerEl)
				.setName(currentLabels.mcpArgs || 'MCP Arguments')
				.setDesc(currentLabels.mcpArgsDesc || 'Arguments for stdio server')
				.addText(text => text
					.setPlaceholder(mcpArgsPlaceholder)
					.setValue(this.pluginInstance.settings.mcpArgs)
					.onChange(async (value) => {
						this.pluginInstance.settings.mcpArgs = value;
						await this.pluginInstance.saveSettings();
					})
				);
				
			const infoDiv = containerEl.createDiv('mcp-info');
			infoDiv.createEl('h3', { text: currentLabels.mcpHowToUse || 'How to Use MCP' });
			const infoBox = infoDiv.createDiv('info-box');
			infoBox.createEl('p', { text: currentLabels.mcpObsidianLimitation || 'Obsidian cannot execute external commands directly due to browser environment restrictions.' });
			infoBox.createEl('p', { text: currentLabels.mcpRunServerFirst || 'Run the MCP server in your terminal first:' });
			infoBox.createEl('pre', { 
				text: `${this.pluginInstance.settings.mcpCommand} ${this.pluginInstance.settings.mcpArgs}`,
				cls: 'command-box'
			});
			infoBox.createEl('p', { text: currentLabels.mcpCheckHttpEndpoint || 'Make sure the MCP server provides a local HTTP endpoint.' });
			
		} else if (this.pluginInstance.settings.mcpType === 'sse') {
			new Setting(containerEl)
				.setName(currentLabels.mcpUrl || 'MCP Server URL')
				.setDesc(currentLabels.mcpUrlDesc || 'URL for SSE server (e.g. http://localhost:3030)')
				.addText(text => text
					.setPlaceholder('http://localhost:3030')
					.setValue(this.pluginInstance.settings.mcpUrl)
					.onChange(async (value) => {
						this.pluginInstance.settings.mcpUrl = value;
						await this.pluginInstance.saveSettings();
					})
				);
				
			const infoDiv = containerEl.createDiv('mcp-info');
			infoDiv.createEl('h3', { text: currentLabels.mcpSseHowToUse || 'How to Use MCP SSE' });
			const infoBox = infoDiv.createDiv('info-box');
			infoBox.createEl('p', { text: currentLabels.mcpSseEnterUrl || 'Enter the URL provided by the MCP SSE server.' });
			infoBox.createEl('p', { text: currentLabels.mcpSseCheckRunning || 'Make sure the server is running.' });
			infoBox.createEl('p', { text: currentLabels.mcpSseClaudeConfig || 'For Claude Desktop integration, check the default configuration:' });
			infoBox.createEl('code', { text: '~/claude_desktop_config.json' });
		}
		
		if (this.pluginInstance.settings.mcpType === 'stdio') {
			const commandText = `${this.pluginInstance.settings.mcpCommand} ${this.pluginInstance.settings.mcpArgs}`;
			const copyButtonContainer = containerEl.createEl('div', { cls: 'copy-button-container' });
			const copyButton = copyButtonContainer.createEl('button', { text: currentLabels.mcpCopyCommand || 'Copy Command' });
			copyButton.addEventListener('click', async () => {
				await navigator.clipboard.writeText(commandText);
				new Notice(currentLabels.mcpCommandCopied || 'MCP command copied to clipboard.');
			});
		}
	}

	// Ollama 관련 설정 표시
	displayOllamaSettings(containerEl: HTMLElement) {
		const labels: LanguageLabels = LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode] || LANGUAGE_LABELS['en'];
		
		const modelSetting = new Setting(containerEl)
			.setName(labels.ollamaModel)
			.setDesc(labels.ollamaModelDesc);

		if (this.availableModels.length > 0) {
			modelSetting.addDropdown(dropdown => {
				this.modelDropdown = dropdown;
				
				for (const model of this.availableModels) {
					dropdown.addOption(model, model);
				}
				
				if (this.availableModels.includes(this.pluginInstance.settings.model)) {
					dropdown.setValue(this.pluginInstance.settings.model);
				}
				
				dropdown.onChange(async (value) => {
					this.pluginInstance.settings.model = value;
					await this.pluginInstance.saveSettings();
				});
			});
		} else {
			modelSetting
				.setDesc('Ollama 서버에 연결할 수 없습니다. 모델 이름을 직접 입력하세요.')
				.addText(text => text
					.setPlaceholder('llama3')
					.setValue(this.pluginInstance.settings.model)
					.onChange(async (value) => {
						this.pluginInstance.settings.model = value;
					await this.pluginInstance.saveSettings();
					})
				);
		}
		
		new Setting(containerEl)
			.setName(labels.refreshModel)
			.setDesc(labels.refreshModelDesc)
			.addButton(button => button
				.setButtonText(labels.refreshModel)
				.onClick(async () => {
					try {
						const models = await this.pluginInstance.getAvailableModels();
						if (models.length > 0) {
							this.availableModels = models;
							this.display();
							new Notice(`${models.length} ${labels.modelsFound}`);
						} else {
							new Notice(labels.noModels);
						}
					} catch (error) {
						console.error('모델 목록 새로고침 실패:', error);
						new Notice(labels.connectionError);
					}
				})
			);
	}
} 