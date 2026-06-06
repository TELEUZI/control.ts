---
name: preact-signals-and-reactivity
description: Implement reactive state bindings using Preact Signals. Use when introducing dynamic attributes or state-driven UI updates in control.ts components.
---

# Preact Signals and Reactivity

**Trigger:** When introducing dynamic attributes or state bindings.

## Workflow

1. Import signals utilities from `@preact/signals-core` (or using wrapper exports in `@control.ts/signals`).
2. Use computed signals `$$(() => ...)` for composite values.
3. Extract current values using `getValue$(prop)`.
4. Maintain proper cleanup/unsubscriptions where necessary inside components.

## Best Practices

- Always use the signals wrapper exports from `@control.ts/signals` when available for consistency across the monorepo.
- Ensure computed signals are properly typed and return the expected signal type.
- Clean up signal subscriptions to prevent memory leaks, especially in component lifecycle methods.
