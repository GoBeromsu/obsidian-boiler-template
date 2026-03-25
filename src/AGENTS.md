<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# src/ — Plugin Source Code

## Purpose

Root source directory containing the plugin's composable architecture: entry point, domain logic, UI layer, type definitions, utilities, and shared boilerplate. This layer structure is the foundation enforced across all downstream plugins.

## Key Files

| File | Purpose |
|------|---------|
| `main.ts` | Composition root — wires dependencies, imports from all layers, orchestrates plugin lifecycle |

## Subdirectories

| Directory | Purpose | AI Agent |
|-----------|---------|----------|
| `domain/` | Business logic layer — zero `obsidian` imports, fully testable | developer |
| `ui/` | Obsidian-dependent layer — views, modals, settings, commands, I/O adapters | ui |
| `types/` | Pure type definitions — zero `obsidian` imports, structural contracts | developer |
| `utils/` | Deterministic utility functions — zero state, zero external deps | developer |
| `shared/` | Synced boilerplate — PluginLogger, PluginNotices, SettingsMigration, DebounceController | qa |

## For AI Agents

### obsidian-developer
- Owns implementation of domain logic, infrastructure, wiring in `main.ts`
- Enforces layer boundaries via ESLint rules (`no-restricted-imports`)
- Ensures `domain/`, `types/`, `utils/` never import `obsidian`
- Works in parallel with `obsidian-ui` on feature implementation

### obsidian-ui
- Owns UX design and visual implementation in `ui/` subdirectory
- Implements settings tabs, modals, views, and adapters
- Coordinates with developer on shared types and domain contracts

### obsidian-qa
- Verifies layer structure compliance and import restrictions
- Validates code against ESLint rules for layering
- Tests integration via composition root (`main.ts`)

## Dependencies

- Each layer imports only from its declared dependencies (see `AGENTS.md` in subdirectories)
- `main.ts` is the only file that imports from all layers (composition root pattern)
- All imports of `obsidian` are scoped to `ui/` and `shared/` only
