import { MarkdownView, Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, type BoilerPluginSettings } from './domain/settings';
import { ExampleModal } from './ui/example-modal';
import { BoilerSettingTab } from './ui/settings-tab';

export default class BoilerPlugin extends Plugin {
	settings!: BoilerPluginSettings;

	async onload() {
		const saved = (await this.loadData()) as Partial<BoilerPluginSettings> | null;
		this.settings = { ...DEFAULT_SETTINGS, ...saved };

		this.addRibbonIcon('dice', 'Boiler template plugin', () => {
			new Notice('Boiler template notice.');
		});

		this.addCommand({
			id: 'open-example-modal',
			name: 'Open example modal',
			checkCallback: (checking) => {
				if (!this.app.workspace.getActiveViewOfType(MarkdownView)) return false;
				if (!checking) new ExampleModal(this.app).open();
				return true;
			},
		});

		this.addSettingTab(new BoilerSettingTab(this.app, this));
	}
}
