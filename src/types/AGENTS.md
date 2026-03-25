<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# src/types/ — Type Definitions

## Purpose

Placeholder for pure TypeScript type definitions and interfaces. This layer has no Obsidian imports and serves as a structural contract between domain logic and UI layer. When Obsidian types are needed in domain code, minimal shim interfaces are defined here instead.

## Key Files

| File | Purpose |
|------|---------|
| `.gitkeep` | Placeholder — plugins define types and interfaces here |

## For AI Agents

### obsidian-developer
- Owns all type definitions in this layer
- **MUST NOT** import from `obsidian` — ESLint will reject
- Defines shim interfaces for Obsidian types needed in domain logic
- Example: Instead of `import { TFile } from 'obsidian'` in domain code, define `interface FileRef { path: string; ... }` here

### obsidian-qa
- Verifies no `obsidian` imports via static checks
- Validates structural compatibility with actual Obsidian types

## Dependencies

**Allowed imports:**
- Nothing — types/ imports nothing

**Forbidden imports:**
- `obsidian` — violates type purity
- Other source files — types are base layer

## Shim Interface Pattern

When domain code needs Obsidian types:

1. Define minimal shim in `src/types/`:
```typescript
export interface FileRef { path: string; }
export interface NoteMetadata { frontmatter?: Record<string, unknown>; }
```

2. Domain code imports shim, not `obsidian`:
```typescript
import { FileRef } from '../types';
export function processFile(file: FileRef) { ... }
```

3. Composition root (`main.ts`) passes real Obsidian objects, which satisfy shim via structural typing:
```typescript
const realFile: TFile = app.vault.getAbstractFileByPath(path);
processFile(realFile); // TFile satisfies FileRef structurally
```

This isolates domain logic from Obsidian specifics while maintaining type safety.
