import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PluginLogger } from '../../src/shared/plugin-logger';

describe('PluginLogger', () => {
	let debugSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('info()', () => {
		it('uses console.debug, not console.info', () => {
			const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
			const logger = new PluginLogger('test');
			logger.info('hello');

			expect(debugSpy).toHaveBeenCalled();
			expect(infoSpy).not.toHaveBeenCalled();
		});
	});

	describe('error()', () => {
		it('extracts message from Error object — not [object Object]', () => {
			const logger = new PluginLogger('test');
			logger.error('something went wrong', new Error('boom'));

			const logged = errorSpy.mock.calls[0]?.[0] as string;
			expect(logged).toContain('boom');
			expect(logged).not.toContain('[object Object]');
		});

		it('stringifies non-Error values with String() — not [object Object]', () => {
			const logger = new PluginLogger('test');
			logger.error('oops', { code: 42 });

			const logged = errorSpy.mock.calls[0]?.[0] as string;
			expect(logged).not.toContain('[object Object]');
		});

		it('handles Error with no extra arg', () => {
			const logger = new PluginLogger('test');
			logger.error('plain message');

			expect(errorSpy).toHaveBeenCalledOnce();
			const logged = errorSpy.mock.calls[0]?.[0] as string;
			expect(logged).toContain('plain message');
		});
	});
});
