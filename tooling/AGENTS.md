<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# tooling/ — Build, Release, and Sync Infrastructure

## Purpose

Development tooling, release automation, and sync engine that propagates canonical files to all downstream plugins. This directory defines the build scripts, ESLint config, and the machinery for keeping the plugin ecosystem in sync.

## Subdirectories

| Directory | Purpose | AI Agent |
|-----------|---------|----------|
| `shared/` | **CANONICAL** dev/release/lint config — synced to all plugins | qa |
| `sync/` | Sync engine — renders workflow, manages targets.json | qa |

## For AI Agents

### obsidian-qa
- Owns all build and release infrastructure validation
- Ensures `tooling/shared/` config is propagated correctly
- Runs sync checks to detect drift between canonical and downstream

### obsidian-developer
- Implements domain and UI logic only — does NOT modify tooling directly
- Uses tooling via npm scripts (`pnpm dev`, `pnpm build`, etc.)
- Reports tooling issues to qa

## Key Build Commands

```bash
pnpm dev              # vault selection + esbuild watch + hot reload
pnpm build            # tsc type-check + production esbuild
pnpm test             # Vitest unit tests
pnpm lint             # ESLint
pnpm run ci           # build + lint + test (required before release)
pnpm release:patch    # ci → patch version → auto-push tag
pnpm release:minor    # ci → minor version → auto-push tag
pnpm release:major    # ci → major version → auto-push tag
pnpm sync:plugins     # propagate canonical files to downstream plugins
pnpm sync:check       # fail if any plugin drifts from canonical
```

## Dependencies

- ESLint, TypeScript, esbuild, Vitest (dev dependencies)
- Obsidian API (peer dependency)
- All synced files are exported to `node_modules` during build
