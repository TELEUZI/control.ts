---
name: workspace-component-development
description: Build control.ts components following monorepo patterns. Use when writing component logic, factories, or modifying component structure in the control.ts packages.
---

# Workspace Component Development

**Trigger:** When writing component logic or factories.

## Workflow

- Base components inherit from `BaseComponent` or `Control`.
- Component initialization must allow custom props and children (appended via `.append(...)`).
- Write associated vitest suites under `tests/` directory (e.g. `base-component.test.ts`).
- Run `pnpm run test:run` to verify correctness.

## Guidelines

1. **Inheritance:** Always extend from the appropriate base class (`BaseComponent` in `@control.ts/min` or `Control` from `@control.ts/control`).
2. **Props and Children:** Ensure components accept flexible props objects and support appending children dynamically.
3. **Testing:** Create comprehensive test suites in the `tests/` directory using Vitest patterns from the workspace.
4. **Code Reuse:** Leverage existing abstractions from `@control.ts/control` to avoid duplication across packages.
5. **Linting & Formatting:** All code must pass `pnpm run lint` and `pnpm run format` before being committed.
