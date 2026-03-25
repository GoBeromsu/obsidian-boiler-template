<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# obsidian-boiler-template

## Purpose
Source-of-truth seed template for all downstream Obsidian plugins in this monorepo. Patterns proven here are propagated to `obsidian-eagle-plugin`, `open-connections`, `obsidian-qmd`, `youtube-note-playlist` via `pnpm sync:plugins`. Default branch is `master`.

## Key Files

| File | Description |
|------|-------------|
| `src/main.ts` | Template plugin entry point — BoilerPlugin class |
| `src/domain/config.ts` | DEFAULT_SETTINGS, NOTICE_CATALOG template |
| `src/shared/plugin-logger.ts` | PluginLogger — use `console.debug/warn/error` only |
| `src/shared/plugin-notices.ts` | PluginNotices catalog system |
| `src/shared/settings-migration.ts` | Settings version migration helper |
| `src/shared/styles.base.css` | Base CSS shared across all plugins |
| `boiler.config.mjs` | Per-repo config (dev deploy targets, CI, release) |
| `tooling/shared/eslint.base.js` | **Canonical ESLint config** — synced to all plugins |
| `tooling/shared/dev.mjs` | Dev orchestrator (vault selection + esbuild watch) |
| `tooling/shared/release.mjs` | Release script (CI → version bump → auto-push tag) |
| `tooling/shared/.husky/pre-commit` | lint-staged hook — uses `pnpm exec`, not `npx` |
| `tooling/shared/.husky/commit-msg` | commitlint hook — uses `pnpm exec`, not `npx` |
| `scripts/sync-to-plugins.mjs` | Sync engine: propagates files to downstream plugins |
| `tooling/sync/targets.json` | List of downstream plugin paths for sync |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Template plugin source (same 4-layer structure as all plugins) |
| `src/shared/` | Files synced verbatim to all downstream plugins |
| `tooling/shared/` | Dev/release/lint tooling synced to all downstream plugins |
| `tooling/sync/` | Sync engine internals (targets.json, index.mjs) |
| `scripts/` | Local-only scripts (not synced) |

## For AI Agents

### Working In This Directory
- **Prove patterns here first, then propagate** — never add a pattern directly to a downstream plugin without establishing it here
- After any change to `tooling/shared/` or `src/shared/`, run `pnpm sync:plugins` to propagate
- `eslint.base.js` must import `eslint-plugin-obsidianmd` AND have a rules block — package.json alone is not enough
- husky hooks MUST use `pnpm exec`, not `npx` — PATH is restricted in git hook context
- Default branch is `master`, not `main`

### Testing Requirements
```bash
pnpm run ci           # build + lint + test
pnpm sync:check       # fail if downstream plugins have drifted from template
pnpm sync:plugins     # propagate changes to all downstream plugins
```

### Common Patterns
```bash
# Sync specific targets only
node scripts/sync-to-plugins.mjs --targets obsidian-qmd,open-connections

# Dry-run preview
node scripts/sync-to-plugins.mjs --dry-run
```

## Dependencies

### External
- `obsidian` — Obsidian Plugin API
- `eslint-plugin-obsidianmd` — community plugin lint rules (enforced by ObsidianReviewBot)
- `typescript-eslint` — unified TS lint package (replaces deprecated `@typescript-eslint/*`)
