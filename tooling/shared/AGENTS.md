<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# tooling/shared/ — CANONICAL Build & Release Config

## Purpose

Authoritative versions of dev scripts, ESLint config, and release automation. Every file here is synced to all downstream plugins. This is where the source of truth for build, lint, and release behavior lives.

## Key Files

| File | Purpose |
|------|---------|
| `eslint.base.js` | CANONICAL ESLint config — enforces layer boundaries and obsidian-md rules |
| `src-shared/` | Subdirectory containing CANONICAL boilerplate (.ts files) |

## Synced Files

All files in `tooling/shared/` (except `src-shared/`) are synced downstream:

| File | Synced To All Plugins |
|------|---|
| `eslint.base.js` | `eslint.config.mjs` |
| `dev.mjs` | `scripts/dev.mjs` |
| `release.mjs` | `scripts/release.mjs` |
| `release-notes.mjs` | `scripts/release-notes.mjs` |
| `version.mjs` | `scripts/version.mjs` |
| `commitlint.config.mjs` | `commitlint.config.mjs` |

**Note:** `src-shared/` files are synced to downstream plugins' `src/shared/` subdirectory.

## For AI Agents

### obsidian-qa
- OWNS validation that `tooling/shared/eslint.base.js` matches all plugins' ESLint configs
- Runs `pnpm sync:check` to detect drift
- Verifies ESLint rules are applied correctly during linting
- Validates that all synced files in downstream plugins are identical to canonical

### obsidian-developer
- **DO NOT** modify files in `tooling/shared/` directly
- If change needed, request via obsidian-qa with justification
- All dev scripts are abstracted; use npm aliases (`pnpm dev`, `pnpm build`, etc.)

## ESLint Config Highlights

The canonical `eslint.base.js` enforces:

1. **Layer boundary** — `src/domain/`, `src/types/`, `src/utils/` cannot import `obsidian`
2. **Obsidian plugin rules** via `eslint-plugin-obsidianmd`:
   - Commands must not have plugin name/ID in the name
   - Settings must use proper headings (not manual HTML)
   - No hardcoded config paths
   - No static style assignments
   - Platform checks required
   - `TFile`/`TFolder` must not be cast unsafely

3. **Code style** via TypeScript ESLint:
   - No unused variables (except function params marked with `_`)
   - Ban TS comments allowed (sometimes necessary)
   - No empty functions rule off (often needed in Obsidian plugins)

## Change Protocol

**Before modifying `eslint.base.js`:**
1. Test the rule change in this repo via `pnpm lint`
2. Ensure it doesn't break all downstream plugins
3. Sync via `pnpm sync:plugins`
4. Verify all targets accepted the change

**Before modifying release/dev scripts:**
1. Test locally with `pnpm run ci` and `pnpm release:patch`
2. Verify git operations and npm publish work correctly
3. Sync and spot-check one downstream plugin

## Subdirectories

See `src-shared/AGENTS.md` for boilerplate files (PluginLogger, etc.).
