import { baseConfig } from './eslint.base.js'

export default [
	...baseConfig,
	// Boiler-template has intentional sample placeholder code in src/main.ts.
	// Downstream plugins rename these — do not enforce sample-name rules here.
	{
		files: ['src/main.ts'],
		rules: {
			'obsidianmd/sample-names': 'off',
			'obsidianmd/commands/no-command-in-command-id': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
		},
	},
]
