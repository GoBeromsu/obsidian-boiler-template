import { Modal } from 'obsidian';

export class ExampleModal extends Modal {
	onOpen() {
		this.contentEl.setText('Example modal content.');
	}

	onClose() {
		this.contentEl.empty();
	}
}
