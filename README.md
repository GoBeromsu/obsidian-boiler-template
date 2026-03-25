# Obsidian Plugin Boilerplate

Source-of-truth seed template for Obsidian plugin development. New patterns are proven here first, then propagated to all downstream plugins via the built-in sync engine.

## Features

- **Unified dev workflow** -- vault selection + esbuild watch + hot reload across all plugins
- **Version management** -- automated version bumping for `package.json`, `manifest.json`, and `versions.json`
- **Release pipeline** -- CI + GitHub Actions release workflows, generated from templates
- **Sync engine** -- propagate shared scripts and workflows to downstream plugin repos
- **Drift detection** -- check whether managed repos have diverged from the template

## Quick Start

### Fork and Clone

1. Fork this repository at `https://github.com/GoBeromsu/obsidian-boiler-template`
2. Clone your fork:

```bash
git clone https://github.com/your-username/obsidian-boiler-template.git
cd obsidian-boiler-template
pnpm install
```

3. Update personal details before publishing:
   - `LICENSE`
   - `package.json` (name, author, description)
   - `manifest.json` (id, name, author, description)

4. Start development:

```bash
pnpm dev
```

## Synced Artifacts

The sync engine copies or renders these files into each target plugin repo:

| File | Description |
|------|-------------|
| `scripts/dev.mjs` | Dev orchestrator (vault discovery + esbuild watch) |
| `scripts/version.mjs` | Version bump script |
| `scripts/release.mjs` | Release entrypoint |
| `scripts/release-notes.mjs` | Release notes reader |
| `.github/workflows/ci.yml` | CI workflow (rendered from template) |
| `.github/workflows/release.yml` | Release workflow (rendered from template) |

### Running the Sync

```bash
pnpm sync:plugins                                             # sync all targets
pnpm sync:check                                               # fail if any repo has drifted
node scripts/sync-to-plugins.mjs --dry-run                    # preview without writing
node scripts/sync-to-plugins.mjs --targets plugin-a,plugin-b  # sync specific targets
```

## Plugin Development Workflow

1. Make changes in `src/`
2. Run `pnpm dev` to build and sync plugin output into a target vault
3. Reload the plugin in Obsidian
4. Enable the plugin in Obsidian settings if needed

## Tech Stack

| Category | Technology |
|----------|------------|
| Platform | Obsidian Plugin API |
| Language | TypeScript 5 |
| Bundler | esbuild |
| Testing | Vitest |
| Linting | ESLint + Husky + lint-staged + commitlint |
| Sync | Custom Node.js sync engine |

## Project Structure

```
obsidian-boiler-template/
├── src/
│   ├── main.ts               # Plugin source (entry point)
│   └── shared/               # Shared utilities (plugin-logger, plugin-notices)
├── scripts/
│   ├── dev.mjs               # Dev orchestrator
│   ├── version.mjs           # Version bump
│   ├── release.mjs           # Release entrypoint
│   └── sync-to-plugins.mjs   # Sync engine CLI
├── tooling/
│   ├── shared/               # Canonical scripts (synced to downstream plugins)
│   └── sync/                 # Sync engine + workflow renderers
├── boiler.config.mjs         # Per-repo config (dev, version, CI, release)
└── manifest.json             # Obsidian plugin manifest
```

## Release Notes Format

GitHub Actions is the canonical publisher. Optional release notes live in `releases/<version>.md`:

```md
# Release 1.2.3

## Summary
- Short explanation of the release.

## Added
- Optional

## Changed
- Optional

## Fixed
- Optional
```

If the file does not exist, the workflow publishes a deterministic fallback body.

## Development

```bash
pnpm install
pnpm dev            # vault selection + esbuild watch + hot reload
pnpm build          # tsc type-check + production build
pnpm test           # Vitest unit tests
pnpm lint           # ESLint
pnpm run ci         # build + lint + test
pnpm sync:plugins   # propagate changes to downstream plugins
pnpm sync:check     # verify no drift in managed repos
```

## Pre-Community-Submission Checklist

Before submitting to [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases), run:

```bash
pnpm lint   # includes eslint-plugin-obsidianmd rules
```

Key ObsidianReviewBot rules enforced automatically:

- **No plugin name in command name** — `obsidianmd/commands/no-plugin-name-in-command-name`: Obsidian prepends the plugin name; don't repeat it.
- **No plugin ID in command ID** — `obsidianmd/commands/no-plugin-id-in-command-id`: command IDs must not contain the plugin ID as a prefix.
- **No "command" in command name** — `obsidianmd/commands/no-command-in-command-name`: redundant word in palette entries.
- **Sentence case UI text** — `obsidianmd/ui/sentence-case`: all user-facing strings must use sentence case (e.g. `'Open note'` not `'Open Note'`).
- **No manual HTML headings in settings** — `obsidianmd/settings-tab/no-manual-html-headings`: use `Setting.setHeading()` instead of raw `<h2>`/`<h3>`.
- **No hardcoded config path** — `obsidianmd/hardcoded-config-path`: never hardcode `.obsidian/` paths; use `app.vault.configDir`.

## Release Checklist

1. Publish an initial version
2. Ensure the repo root contains a `README.md`
3. Submit a pull request to [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
