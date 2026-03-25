<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# tooling/sync

## Purpose
Sync engine that propagates shared files from `obsidian-boiler-template` to all downstream plugins. Reads `targets.json` for the list of destination plugin paths, then copies files defined in `SHARED_FILE_SPECS` from `tooling/shared/` and `src/shared/` to each target.

## Key Files

| File | Description |
|------|-------------|
| `index.mjs` | Main sync script — reads targets, copies shared files, reports drift |
| `targets.json` | List of downstream plugin paths to sync into |

## For AI Agents

### Working In This Directory
- Run via `pnpm sync:plugins` from the boiler-template root
- `targets.json` must list absolute or relative paths to downstream plugin roots
- Do NOT manually copy shared files — always run the sync engine to prevent drift
- After modifying any file in `tooling/shared/` or `src/shared/`, run sync to propagate

## Dependencies
- `tooling/shared/` — source files copied to downstream plugins
- `src/shared/` — source shared TypeScript files copied to downstream plugins
