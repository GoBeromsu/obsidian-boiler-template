# Obsidian Plugin Boilerplate

This boilerplate template is the source of truth for shared tooling patterns across the sibling Obsidian plugin repositories in this workspace.

## Getting Started

1. Fork this repository:
   Visit `https://github.com/GoBeromsu/obsidian-boiler-template` and create a fork in your account.
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/obsidian-boiler-template.git
   ```

3. Update personal details before publishing:
   - `LICENSE`
   - `package.json`
   - `manifest.json`
4. Install dependencies:

   ```bash
   cd your-plugin-name
   pnpm install
   ```

5. Start development:

   ```bash
   pnpm run dev
   ```

## Shared Tooling Workflow

Shared plugin tooling now lives under `tooling/` in this repository:
- `tooling/shared/` contains the canonical synced `dev.mjs` and `version.mjs` scripts.
- `tooling/sync/` contains the workflow renderers and sync engine.
- Each plugin repo declares repo-specific values in `boiler.config.mjs`.

To propagate shared tooling changes from this template to the configured plugin repos:

```bash
pnpm run sync:plugins
```

Useful variants:

```bash
node scripts/sync-to-plugins.mjs --dry-run
node scripts/sync-to-plugins.mjs --targets Metadata-Auto-Classifier,obsidian-eagle-plugin,obsidian-smart-connections
```

The sync command copies or renders these files into each target repo:
- `scripts/dev.mjs`
- `scripts/version.mjs`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`

## Plugin Development Workflow

1. Make changes in `src/`.
2. Run `pnpm run dev` to build and sync plugin output into a target vault.
3. Reload the plugin in Obsidian.
4. Enable the plugin in Obsidian settings if needed.

## Release Checklist

1. Publish an initial version.
2. Ensure the repo root contains a `README.md`.
3. Submit a pull request to [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
