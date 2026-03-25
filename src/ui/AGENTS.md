<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# src/ui/ — Obsidian-Dependent UI Layer

## Purpose

Placeholder for UI implementations that depend on Obsidian APIs. This layer contains settings tabs, modals, views, commands, and DOM adapters. Each plugin populates this directory with UI-specific implementations.

## Key Files

| File | Purpose |
|------|---------|
| `.gitkeep` | Placeholder — plugins fill this directory with UI code |

## For AI Agents

### obsidian-ui
- Owns all implementations in this layer
- May freely import `obsidian`, `obsidian-ext`, and other browser APIs
- May import from `domain/`, `utils/`, `types/`, and `shared/`
- Responsible for visual design, UX flows, and DOM manipulation
- Coordinates with developer on domain contracts and dependency injection

### obsidian-developer
- Assists UI agent with domain wiring and dependency injection patterns
- Works in parallel on domain logic that UI layer will call

### obsidian-qa
- Verifies UI implementations via integration tests or screenshots
- Tests DOM rendering and user interaction flows

## Dependencies

**Allowed imports:**
- `obsidian` — full Obsidian API access
- `src/domain/` — business logic
- `src/utils/` — utility functions
- `src/types/` — type definitions
- `src/shared/` — shared boilerplate (all files safe here)

**Forbidden imports:**
- None — this layer is unrestricted

## Design Patterns

- Settings tabs extend `PluginSettingTab`
- Modals extend `Modal`
- Views extend `ItemView` or other Obsidian view types
- Commands registered via `addCommand()` in composition root
- Adapters expose domain logic as Obsidian-compatible interfaces
