# obsidian-boiler-template

Reference for every Obsidian plugin in this family. It is also the home of the shared CI/release infrastructure: plugins carry thin callers, never copies.

## Layers

1. **Infra** (this repo, `.github/workflows/plugin-*.yml`, `scripts/`): CI, release, release notes. Consumed by reference.
2. **Obsidian plugin** (`src/main.ts`, `src/ui/`, `styles.css`): lifecycle, UI, Obsidian APIs. Settings use `getSettingDefinitions()`.
3. **Domain** (`src/domain/`, `src/types/`, `src/utils/`): pure logic, must not import `obsidian` (lint-enforced).

Plugins share no code with each other. Dev-vault deployment (`.dev-vault`) is done by the root workspace tooling, not by plugins.

## Dev contract

| Command | Result |
|---|---|
| `bun run dev` | esbuild watch into `dist/` |
| `bun run build` | production build into `dist/` (`main.js`, `manifest.json`, `styles.css` if present) |
| `bun run ci` | build + typecheck + lint + test |
| `bun run release <patch\|minor\|major>` | opens a version-bump PR (see Release) |

## Naming

GitHub repo = local folder = `package.json` name = `obsidian-<slug>`. `manifest.json` id = `<slug>` (no "obsidian" in the id, per Obsidian guidelines). Published ids never change.

## What a plugin contains

`package.json` scripts (identical in every plugin):

```json
"dev": "bun esbuild.config.mjs",
"build": "bun esbuild.config.mjs production",
"typecheck": "tsc --noEmit --skipLibCheck",
"lint": "eslint .",
"test": "vitest run",
"ci": "bun run build && bun run typecheck && bun run lint && bun run test",
"release": "curl -fsSL https://raw.githubusercontent.com/GoBeromsu/obsidian-boiler-template/main/scripts/release.ts | bun run -"
```

Files: `bun.lock`, `esbuild.config.mjs`, `tsconfig.json`, `eslint.config.mts`, `vitest.config.ts`, `manifest.json`, `versions.json`, `styles.css` (optional), and the two callers below. Copy the config files from this repo once when porting. Delete: `pnpm-lock.yaml`, `.npmrc`, `packageManager`, `scripts/`, `boiler.config.mjs`, `src/shared/`, husky/commitlint/lint-staged, old workflows.

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  ci:
    uses: GoBeromsu/obsidian-boiler-template/.github/workflows/plugin-ci.yml@main
```

`.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  release:
    uses: GoBeromsu/obsidian-boiler-template/.github/workflows/plugin-release.yml@main
```

Required status check on `main`: **`ci / report`**.

## Release

`bun run release patch|minor|major` requires a clean, up-to-date `main`, bumps `package.json`, `manifest.json`, `versions.json`, pushes `chore/release-<version>`, opens a PR and enables auto-merge. It never tags. When the PR lands on `main`, the Release workflow reads `manifest.json`; if tag `<version>` (no `v` prefix) does not exist it builds and creates the tag and GitHub release with `main.js`, `manifest.json`, `styles.css`.

Release notes: `releases/<version>.md` if present, otherwise Conventional Commits since the previous tag grouped into Features / Fixes / Other.

Network access disclosure: the `release` script and release workflow fetch scripts from this public repo.
