# CLAUDE.md — Obsidian Boiler Template

> Git strategy, branch naming, commit convention, and release management are defined in the **root CLAUDE.md**. This file covers template-specific details only.

## Overview

Reference template for Obsidian plugins. Downstream plugins are not synced mechanically; agents read this repo as a reference when working on them.

## Build Commands

```bash
pnpm dev            # vault selection + esbuild watch + hot reload
pnpm dev:build      # esbuild build (no vault deploy)
pnpm build          # tsc type-check + production esbuild build
pnpm test           # Vitest unit tests
pnpm lint           # ESLint
pnpm lint:fix       # ESLint with auto-fix
pnpm run ci         # build + lint + test
pnpm release:patch  # ci → patch bump → auto-push tag
pnpm release:minor  # ci → minor bump → auto-push tag
pnpm release:major  # ci → major bump → auto-push tag
```

## Role

This repo serves as the reference template. The workflow is:
1. Prove a new pattern here first
2. Port it to downstream plugins by hand, adapting to each plugin as needed

## Project Layout

```
src/                  # Plugin source (entry: main.ts)
scripts/              # dev.mjs, version.mjs, release.mjs, release-notes.mjs
src/shared/           # Reference helpers (logger, notices, settings migration)
boiler.config.mjs     # Per-repo config (dev deploy, version staging, CI, release)
```

## Release

1. `pnpm run ci` — MUST pass (build + lint + test)
2. `pnpm release:patch|minor|major` — `pnpm run ci`, version bump, auto-push tag (via `postversion`)
3. GitHub Actions handles CI + Release workflows (`ci.yml`, `release.yml`)

**DENIED by settings.json:** `git tag`, `git push --tags`, `gh release` — only `pnpm release:*` is allowed.

## Gotchas

- Default branch is `main`
- Tab indentation, width 4 (enforced by `.editorconfig`)
- `boiler.config.mjs` defines per-repo values — each downstream plugin has its own copy
