# CLAUDE.md

Root `AGENTS.md` rules apply. See `README.md` for the layers, dev contract, the plugin porting checklist and the release flow.

- This repo is both the plugin reference and the shared infra source: edit `.github/workflows/plugin-*.yml` and `scripts/` here, never in plugins.
- Changing `plugin-*.yml` or `scripts/` affects every plugin on `@main`; keep them backward compatible.
- Releases are CI-only. Use `bun run release <bump>`; never tag or `gh release` locally.
- Naming: repo = folder = package name = `obsidian-<slug>`; manifest id = `<slug>`, never changed once published.
