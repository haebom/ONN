import { App, Modal, Notice, Setting, TFile } from 'obsidian';
import ConceptExplorerPlugin from '../../main'; // Adjust path if needed
import { LANGUAGE_LABELS } from '../constants';
import { LanguageCode, LanguageLabels } from '../models';

export class ConceptExpandModal extends Modal {
	pluginInstance: ConceptExplorerPlugin;
	conceptText: string;
	file: TFile | null;
	maxDepth: number = 1;

	constructor(app: App, plugin: ConceptExplorerPlugin, conceptText: string, file: TFile | null) {
		super(app);
		this.pluginInstance = plugin;
		this.conceptText = conceptText;
		this.file = file;
        this.maxDepth = plugin.settings.maxDepth; // Use default depth from settings initially
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		
		contentEl.addClass('concept-expand-modal');

		const labels: LanguageLabels = LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode] || LANGUAGE_LABELS['en'];
		
		contentEl.createEl('h2', { text: labels.expandTitle });
		
		contentEl.createEl('p', { 
			text: labels.selectedConcept + ': "' + this.conceptText + '"'
		});
		
		// 최대 깊이 슬라이더
		new Setting(contentEl)
			.setName(labels.expandDepth)
			.setDesc(labels.expandDepthDesc)
			.addSlider(slider => slider
				.setLimits(1, 3, 1)
				.setValue(this.maxDepth)
				.setDynamicTooltip()
				.onChange(value => this.maxDepth = value)
			);
		
		// 버튼 행 추가
		const buttonDiv = contentEl.createDiv('button-container');
		
		// 확장 시작 버튼
		const expandButton = buttonDiv.createEl('button', { text: labels.startExpand });
		expandButton.addEventListener('click', async () => {
			this.close();
			await this.pluginInstance.buildConceptWeb(this.conceptText, this.maxDepth);
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