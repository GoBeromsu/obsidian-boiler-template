<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# src/domain/ — Business Logic Layer

## Purpose

Placeholder for plugin-specific business logic. This layer contains no Obsidian imports and is fully testable in isolation. Each plugin populates this directory with domain-specific implementations (state machines, data processors, algorithms).

## Key Files

| File | Purpose |
|------|---------|
| `.gitkeep` | Placeholder — plugins fill this directory with domain logic |

## For AI Agents

### obsidian-developer
- Owns all implementations in this layer
- **MUST NOT** import from `obsidian` — ESLint will reject
- May import from `utils/`, `types/`, and `shared/` (only the parts that don't use `obsidian`)
- Should inject Obsidian dependencies via constructor/function parameters
- Must be testable without mocks of Obsidian APIs

### obsidian-qa
- Verifies no `obsidian` imports via static checks
- Validates unit tests cover domain logic with simple stubs (not full Obsidian mocks)

## Dependencies

**Allowed imports:**
- `src/utils/` — pure utility functions
- `src/types/` — type definitions

**Forbidden imports:**
- `obsidian` — violates layer boundary
- `src/ui/` — domain must not depend on presentation
- `src/shared/` — only if the shared file has no `obsidian` imports

## Layer Boundary Enforcement

ESLint rule `no-restricted-imports` prevents `obsidian` imports in all files under `src/domain/`. If domain code needs Obsidian types, define shim interfaces in `src/types/` instead.
