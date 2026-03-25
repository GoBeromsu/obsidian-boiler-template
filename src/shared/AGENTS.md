<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# src/shared/ — Synced Boilerplate (CANONICAL SOURCE)

## Purpose

The ORIGIN for all shared boilerplate across the plugin ecosystem. Every file here is synced to all downstream plugins via the `obsidian-propagate` skill or `pnpm sync:plugins`. This is the authoritative source — changes here propagate ecosystem-wide.

## Key Files

| File | Purpose |
|------|---------|
| `plugin-logger.ts` | Structured logging with debug mode, console/notice output |
| `plugin-notices.ts` | Managed notice system with muting, templates, interpolation |
| `settings-migration.ts` | Deterministic settings schema migrations |
| `debounce-controller.ts` | Debounce with rerun tracking and cleanup (NOT synced yet) |

## For AI Agents

### obsidian-qa
- **OWNS** validation that files in `src/shared/` match canonical versions in `tooling/shared/src-shared/`
- Runs `pnpm sync:check` to detect drift
- Alerts if downstream plugins diverge from these canonical files

### obsidian-developer
- **MAY MODIFY** files here only with strong justification
- After modifying: run `pnpm sync:plugins` to propagate to all downstream plugins
- Coordinate with team lead before making changes (impacts 6+ plugins)

### All plugins (downstream)
- Import these files freely
- **DO NOT EDIT** — files are synced from canonical source
- If customization needed, request change to canonical source

## Sync Engine

Every file in `src/shared/` corresponds to `tooling/shared/src-shared/`:

| src/shared/ | tooling/shared/src-shared/ | Synced To |
|-------------|----------------------------|-----------|
| `plugin-logger.ts` | `plugin-logger.ts` | All plugins' `src/shared/` |
| `plugin-notices.ts` | `plugin-notices.ts` | All plugins' `src/shared/` |
| `settings-migration.ts` | `settings-migration.ts` | All plugins' `src/shared/` |
| `debounce-controller.ts` | `debounce-controller.ts` | All plugins' `src/shared/` |

**Workflow:**
1. Make changes in `tooling/shared/src-shared/` (canonical)
2. Run `pnpm sync:plugins` to propagate
3. Each downstream plugin's `src/shared/` is updated automatically
4. All sync'd files carry a comment: "Synced from obsidian-boiler-template/tooling/shared/src-shared/..."

## Deterministic Code vs Patterns

| Aspect | Deterministic (here) | Patterns (elsewhere) |
|--------|---|---|
| **Rule** | Every plugin needs it | A plugin may or may not need it |
| **Adoption** | Automatic via sync engine | Manual — read and adapt |
| **Examples** | PluginLogger, PluginNotices | Debounce strategies, adapter patterns |
| **Location** | `src/shared/` | `.claude/knowledge/patterns/` |

## Change Protocol

**Before modifying any file here:**
1. Verify the change benefits all downstream plugins
2. Test thoroughly in this repo
3. Document rationale in commit (use git trailers)
4. Run `pnpm sync:plugins` and verify all targets updated
5. Notify team: "Propagated changes to [plugin-a, plugin-b, ...]"

**Breaking changes** (e.g., API signature changes) require:
- Deprecation period OR
- Coordinated update across all plugins simultaneously OR
- Explicit OK from Beomsu

## No Obsidian Imports (Usually)

Most files here CAN import `obsidian` (they're used in `ui/` after all), but prefer injecting Obsidian dependencies instead:

**Good:**
```typescript
export class PluginLogger {
	constructor(private prefix: string, private isDebug: () => boolean = () => false) {}
	// Uses console, which is universal
}
```

**Also OK (for notice-specific code):**
```typescript
import { Notice } from 'obsidian';
// PluginNotices needs Notice — it's UI-specific
```

**Avoid:**
```typescript
import { App, Vault } from 'obsidian';
// If possible, inject these via constructor or parameters
```
