import { App, Modal, Notice, Setting } from 'obsidian';
import ConceptExplorerPlugin from '../../main'; // Use default import
import { LANGUAGE_LABELS } from '../constants';
import { LanguageCode, LanguageLabels } from '../models';

export class ConceptExplorerModal extends Modal {
	pluginInstance: ConceptExplorerPlugin;
	rootConcept: string = '';
	maxDepth: number = 3;
	inputType: string = 'keyword'; // 'keyword', 'file', 'text'

	constructor(app: App, plugin: ConceptExplorerPlugin) {
		super(app);
		this.pluginInstance = plugin;
        this.maxDepth = plugin.settings.maxDepth; // Load default depth from settings
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		
		contentEl.addClass('concept-explorer-modal');

		const labels: LanguageLabels = LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode] || LANGUAGE_LABELS['en'];
		
		contentEl.createEl('h2', { text: labels.explorer });
		
		// 루트 개념 입력 필드
		new Setting(contentEl)
			.setName(labels.rootConcept)
			.setDesc(labels.rootConceptDesc)
			.addText(text => text
				.setValue(this.rootConcept)
				.onChange(value => this.rootConcept = value)
			);
		
		// 최대 깊이 슬라이더
		new Setting(contentEl)
			.setName(labels.depthSetting)
			.setDesc(labels.depthSettingDesc)
			.addSlider(slider => slider
				.setLimits(1, 5, 1)
				.setValue(this.maxDepth)
				.setDynamicTooltip()
				.onChange(value => this.maxDepth = value)
			);
		
		// 버튼 행 추가
		const buttonDiv = contentEl.createDiv('button-container');
		
		// 탐색 시작 버튼
		const startButton = buttonDiv.createEl('button', { text: labels.start });
		startButton.addEventListener('click', async () => {
			if (!this.rootConcept) {
				new Notice(labels.enterRoot);
				return;
			}
			
			this.close();
			await this.pluginInstance.buildConceptWeb(this.rootConcept, this.maxDepth);
		});
		
		// 취소 버튼
		const cancelButton = buttonDiv.createEl('button', { text: labels.cancel });
		cancelButton.addEventListener('click', () => this.close());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
} 