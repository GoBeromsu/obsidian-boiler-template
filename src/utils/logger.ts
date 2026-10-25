export function createLogger(prefix: string, isDebug: () => boolean = () => false) {
	return {
		debug: (message: string) => {
			if (isDebug()) console.debug(`[${prefix}] ${message}`);
		},
		warn: (message: string) => console.warn(`[${prefix}] ${message}`),
		error: (message: string, error?: unknown) => console.error(`[${prefix}] ${message}`, error),
	};
}
