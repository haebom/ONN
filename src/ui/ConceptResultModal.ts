import { App, Modal, Notice } from 'obsidian';
import ConceptExplorerPlugin from '../../main'; // Adjust path if needed
import { LANGUAGE_LABELS } from '../constants';
import { LanguageCode, LanguageLabels } from '../models';

export class ConceptResultModal extends Modal {
	pluginInstance: ConceptExplorerPlugin;
	concept: string;
	promptTemplate: string;
	depth: number;
	path: string[];
	listEl: HTMLElement | null = null;
	generatedConcepts: string[] = [];
	itemCounter: number = 0;
	abortController: AbortController | null = null;
	progressBar: any;
	progressBarText: HTMLElement;
	exploreConcepts: string[] = [];
	maxConcepts: number;
	cancelExploreConcepts: boolean = false;

	constructor(app: App, plugin: ConceptExplorerPlugin, concept: string, promptTemplate: string, depth: number, path: string[] = []) {
		super(app);
		this.pluginInstance = plugin;
		this.concept = concept;
		this.promptTemplate = promptTemplate;
		this.depth = depth;
		this.path = path;
		this.maxConcepts = plugin.settings.maxConceptsPerLevel;
	}
	
	private displayProgressBar() {
		if (this.progressBar) {
			const percent = (this.exploreConcepts.length / this.maxConcepts) * 100;
			const progressText = `${this.exploreConcepts.length}/${this.maxConcepts} (${percent.toFixed(1)}%)`;
			this.progressBar.setValue(percent);
			this.progressBarText.textContent = progressText;
		}
	}

	async cancelExplore() {
		this.cancelExploreConcepts = true;
		
		// 취소 버튼이 눌려졌다는 알림
		const noticeTime = 5000; // 5초 동안 알림 표시
		const labels: LanguageLabels = LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode] || LANGUAGE_LABELS['en'];
		new Notice(labels.cancelNotice, noticeTime);
		
		// 3초 기다리기
		await new Promise((resolve) => setTimeout(resolve, 3000));
		
		// 취소 처리 후 후속 작업
		if (this.progressBar) {
			this.progressBar.setValue(100);
			this.progressBarText.textContent = labels.cancelComplete;
		}
		
		// 추가 대기 시간 후 모달 닫기
		await new Promise((resolve) => setTimeout(resolve, 1000));
		this.close();
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('concept-result-modal');

		const labels: LanguageLabels = LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode] || LANGUAGE_LABELS['en'];
		
		// 제목 추가 (현재 개념)
		contentEl.createEl('h2', { text: this.concept });
		
		// 로딩 메시지 표시
		const loadingEl = contentEl.createDiv('loading');
		loadingEl.setText(labels.generating + '...');
		
		// 현재 경로 표시
		if (this.path.length > 0) {
			const pathEl = contentEl.createDiv('path');
			pathEl.setText(this.path.join(' > ') + ' > ' + this.concept);
		}
		
		// 진행 표시줄 추가
		const progressContainer = contentEl.createDiv('progress-container');
		const progressBarBg = progressContainer.createDiv('progress-bar-bg');
		const progressBarFill = progressBarBg.createDiv('progress-bar-fill');
		this.progressBarText = progressContainer.createDiv('progress-text');
		this.progressBarText.textContent = '0%';
		
		// 프로그레스바 객체 생성
		this.progressBar = {
			setValue: (value: number) => {
				progressBarFill.style.width = `${value}%`;
				this.progressBarText.textContent = `${value.toFixed(1)}%`;
			}
		};
		this.progressBar.setValue(0);
		
		// 관련 개념 생성을 위한 UI 준비 - 'level' 대신 'depthLabel' 사용
		contentEl.createEl('h3', { text: `${labels.depthLabel} ${this.depth + 1} (${this.concept} 관련)` });
		
		// 관련 개념 목록 생성 (빈 상태로 시작)
		this.listEl = contentEl.createEl('ul');
		this.listEl.addClass('concept-list');
		
		// 실시간 생성 상태 표시
		const statusEl = contentEl.createDiv('generation-status');
		statusEl.setText(labels.generating + '... (0)');
		
		// 버튼 컨테이너 미리 생성
		const buttonDiv = contentEl.createDiv('button-container');
		buttonDiv.style.display = 'none'; // 처음에는 숨김
		
		// 취소 버튼 추가 (생성 중에 보이게)
		const cancelButton = contentEl.createDiv('cancel-button-container').createEl('button', { text: labels.cancel });
		cancelButton.addEventListener('click', () => {
			if (this.abortController) {
				this.abortController.abort();
				this.cancelExplore();
			} else {
				// 현재까지 생성된 개념으로 결과 표시
				this.finishGeneration(buttonDiv, loadingEl, cancelButton, statusEl);
			}
		});
		
		try {
			// 개념 생성 시작 (비동기)
			this.abortController = new AbortController();
			
			// 최대 생성 개념 수 설정
			const maxConcepts = this.pluginInstance.settings.maxConcepts;
			this.maxConcepts = maxConcepts;
			this.exploreConcepts = [];
			
			// 개념 생성 (비동기)
			this.generatedConcepts = await this.generateConceptsWithUI(
				statusEl, 
				loadingEl,
				maxConcepts,
				this.abortController.signal
			);
			
			// 생성 완료 후 UI 업데이트
			this.finishGeneration(buttonDiv, loadingEl, cancelButton, statusEl);
		} catch (error) {
			// 오류 발생 시
			console.error('개념 생성 오류:', error);
			
			// AbortError는 사용자 취소이므로 별도 처리하지 않음
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				loadingEl.remove();
				cancelButton.remove();
				statusEl.remove();
				
				contentEl.createEl('p', { 
					text: labels.failed + ': ' + (error instanceof Error ? error.message : String(error)),
					cls: 'error-message'
				});
				
				// 현재까지 생성된 내용이 있으면 버튼 표시
				if (this.generatedConcepts.length > 0) {
					this.finishGeneration(buttonDiv, loadingEl, cancelButton, statusEl);
				} else {
					// 생성된 내용이 없으면 닫기 버튼만 표시
					const closeButton = contentEl.createEl('button', { text: labels.close });
					closeButton.addEventListener('click', () => this.close());
				}
			}
		}
	}
	
	async generateConceptsWithUI(statusEl: HTMLElement, loadingEl: HTMLElement, maxConcepts: number, signal: AbortSignal): Promise<string[]> {
		// 프롬프트 생성
		const prompt = this.promptTemplate
			.replace('{concept}', this.concept)
			.replace('{maxConcepts}', maxConcepts.toString())
			.replace('{fullPath}', this.path.join(' > '))
			.replace('{depth}', this.depth.toString())
			.replace('{diversity}', this.pluginInstance.settings.diversity.toString());
		
		// 개념 생성 시작 - 스트리밍 방식으로 변경
		try {
			// LLM 서비스 이름 가져오기
			const serviceName = this.pluginInstance.settings.llmService;
			console.log(`서비스 사용: ${serviceName}, 개념: ${this.concept}`);
			
			// 스트리밍 응답을 위한 콜백 함수
			const streamingCallback = (concept: string) => {
				console.log(`새 개념 받음: ${concept}`);
				// 중단 신호 확인
				if (!signal.aborted) {
					// 개념 추가
					this.addConceptToUI(concept);
					
					// 상태 업데이트
					statusEl.setText(`${LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode].generating}... (${this.itemCounter})`);
				}
			};
			
			// 스트리밍 모드로 개념 생성
			const result = await this.pluginInstance.generateConceptsWithStreaming(
				this.concept, 
				this.promptTemplate, 
				maxConcepts,
				this.pluginInstance.settings.diversity,
				streamingCallback,
				signal
			);
			
			return this.generatedConcepts;
		} catch (error) {
			console.error('스트리밍 응답 처리 중 오류:', error);
			
			// 스트리밍이 실패하면 기존 방식으로 폴백
			if (!signal.aborted) {
				console.log('기존 방식으로 폴백');
				const result = await this.pluginInstance.generateConcepts(
					this.concept, 
					this.promptTemplate, 
					maxConcepts,
					this.pluginInstance.settings.diversity
				);
				
				// 결과를 실시간으로 UI에 추가
				for (const concept of result) {
					// 중단 신호 확인
					if (signal.aborted) {
						break;
					}
					
					// 개념 추가
					this.addConceptToUI(concept);
					
					// 상태 업데이트
					statusEl.setText(`${LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode].generating}... (${this.itemCounter})`);
					
					// 인위적인 지연으로 생성 모습 보여주기 (100~300ms)
					await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
				}
				
				return this.generatedConcepts;
			}
			
			throw error;
		}
	}
	
	addConceptToUI(concept: string) {
		// 이미 추가된 개념이면 무시
		if (this.generatedConcepts.includes(concept)) {
			return;
		}
		
		// 개념 추가
		this.generatedConcepts.push(concept);
		this.exploreConcepts.push(concept);
		this.itemCounter++;
		
		// 리스트에 항목 추가
		if (this.listEl) {
			const li = this.listEl.createEl('li', { cls: 'concept-item fade-in' });
			const conceptButton = li.createEl('button', { text: concept });
			
			// 클릭 시 해당 개념으로 더 깊은 탐색
			conceptButton.addEventListener('click', async () => {
				this.close();
				await this.pluginInstance.buildConceptWeb(concept, this.depth + 1);
			});
		}
		
		// 진행률 업데이트
		this.displayProgressBar();
	}
	
	finishGeneration(buttonDiv: HTMLElement, loadingEl: HTMLElement, cancelButton: HTMLElement, statusEl: HTMLElement) {
		const labels: LanguageLabels = LANGUAGE_LABELS[this.pluginInstance.settings.language as LanguageCode] || LANGUAGE_LABELS['en'];
		
		// 로딩 및 취소 UI 제거
		loadingEl.remove();
		cancelButton.remove();
		
		// 상태 업데이트
		statusEl.setText(`${labels.completed}: ${this.generatedConcepts.length} ${labels.relatedConcepts}`);
		setTimeout(() => {
			statusEl.remove();
		}, 2000);
		
		// 버튼 표시
		buttonDiv.style.display = 'flex';
		
		// 노트 생성 버튼 추가
		const saveButton = buttonDiv.createEl('button', { text: labels.save });
		saveButton.addEventListener('click', async () => {
			// 노트 저장
			const notePath = await this.pluginInstance.saveConceptNote(
				this.concept, 
				this.generatedConcepts, 
				this.path
			);
			
			if (notePath) {
				new Notice(`${labels.saveLocation}: ${notePath}`);
				this.close();
			}
		});
		
		// 계속 탐색 버튼 (깊이가 충분한 경우)
		if (this.depth < this.pluginInstance.settings.maxDepth - 1) {
			const exploreButton = buttonDiv.createEl('button', { text: labels.exploreDeeper });
			exploreButton.addEventListener('click', async () => {
				this.close();
				await this.pluginInstance.exploreNextLevel(
					this.concept, 
					this.generatedConcepts, 
					this.depth + 1, 
					[...this.path, this.concept]
				);
			});
		}
		
		// 닫기 버튼
		const closeButton = buttonDiv.createEl('button', { text: labels.close });
		closeButton.addEventListener('click', () => this.close());
	}

	onClose() {
		const { contentEl } = this;
		
		// 생성 중단
		if (this.abortController) {
			this.abortController.abort();
		}
		
		contentEl.empty();
	}
} 