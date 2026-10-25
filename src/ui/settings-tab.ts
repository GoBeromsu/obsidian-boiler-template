import { PluginSettingTab, type SettingDefinitionItem } from 'obsidian';

export class BoilerSettingTab extends PluginSettingTab {
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Example setting',
				desc: 'Stored example text for this plugin.',
				control: { type: 'text', key: 'mySetting', placeholder: 'Enter example text.' },
			},
		];
	}
}
