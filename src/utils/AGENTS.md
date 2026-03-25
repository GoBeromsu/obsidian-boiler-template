<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# src/utils/ — Pure Utility Functions

## Purpose

Placeholder for deterministic, side-effect-free utility functions. This layer has no state and no external dependencies. Each plugin populates this directory with helpers like string formatting, array operations, validation, and other pure utilities.

## Key Files

| File | Purpose |
|------|---------|
| `.gitkeep` | Placeholder — plugins add utility functions here |

## For AI Agents

### obsidian-developer
- Owns all implementations in this layer
- **MUST NOT** import from `obsidian` — ESLint will reject
- **MUST NOT** maintain state or have side effects
- Functions are pure: same input always produces same output
- May import from `types/` only

### obsidian-qa
- Verifies no `obsidian` imports via static checks
- Tests utilities with simple unit tests (no mocks needed)
- Validates pure behavior (no side effects)

## Dependencies

**Allowed imports:**
- `src/types/` — type definitions only

**Forbidden imports:**
- `obsidian` — violates purity
- `src/domain/`, `src/ui/`, `src/shared/` — utils are base layer

## Testing

Utils are the easiest layer to test:
- No mocks required
- No Obsidian API mocking
- Simple input/output assertions
- Unit tests run in Node.js environment directly

Example:
```typescript
// src/utils/string-helpers.ts (no obsidian import)
export function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

// test/utils/string-helpers.test.ts
import { capitalize } from '../../src/utils/string-helpers';
describe('capitalize', () => {
	it('capitalizes first letter', () => {
		expect(capitalize('hello')).toBe('Hello');
	});
});
```
