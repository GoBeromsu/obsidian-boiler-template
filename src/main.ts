import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface BoilerPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: BoilerPluginSettings = {
	mySetting: 'default'
};

const UI_COPY = {
	ribbonLabel: 'Boiler template plugin',
	notice: 'Boiler template notice.',
	statusBar: 'Boiler template ready.',
	simpleCommand: 'Open example modal',
	editorCommand: 'Insert example text',
	editorInsertedText: 'Example editor command text.',
	complexCommand: 'Open example modal (active note only)',
	modalBody: 'Example modal content.',
	settingName: 'Example setting',
	settingDesc: 'Stored example text for this plugin.',
	settingPlaceholder: 'Enter example text.',
} as const;

export default class BoilerPlugin extends Plugin {
	settings!: BoilerPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', UI_COPY.ribbonLabel, (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice(UI_COPY.notice);
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText(UI_COPY.statusBar);

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: UI_COPY.simpleCommand,
			callback: () => {
				new BoilerModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor',
			name: UI_COPY.editorCommand,
			editorCallback: (editor: Editor) => {
				// Use PluginLogger: this.logger.debug('selection', { text: editor.getSelection() })
				editor.replaceSelection(UI_COPY.editorInsertedText);
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-conditional',
			name: UI_COPY.complexCommand,
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new BoilerModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BoilerSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (_evt: MouseEvent) => {
			// Use PluginLogger: this.logger.debug('click', { x: evt.clientX })
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => { /* Use PluginLogger for periodic logs */ }, 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- loadData() returns unknown-shaped JSON
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class BoilerModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText(UI_COPY.modalBody);
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class BoilerSettingTab extends PluginSettingTab {
	plugin: BoilerPlugin;

	constructor(app: App, plugin: BoilerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName(UI_COPY.settingName)
			.setDesc(UI_COPY.settingDesc)
			.addText(text => text
				.setPlaceholder(UI_COPY.settingPlaceholder)
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
