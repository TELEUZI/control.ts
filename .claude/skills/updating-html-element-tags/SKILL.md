---
name: updating-html-element-tags
description: Automate HTML element tag updates via MDN scraper. Use when browser support changes or new HTML tags are released and need integration into the control.ts library.
---

# Updating HTML Element Tags

**Trigger:** When browser support changes or new HTML tags are released and need to be integrated into the library.

## Workflow

1. Navigate to `@control.ts/signals` or root.
2. Run the update script:
   ```bash
   pnpm --filter @control.ts/signals run update-html-tags
   ```
3. The scraper will fetch HTML tags from MDN via `cheerio` and automatically regenerate:
   - `packages/control/src/element-tags.ts`
   - `packages/min/src/component-tags.ts`
   - `packages/min/src/element-tags.ts`
   - `packages/signals/src/component-tags.ts`
   - `packages/signals/src/element-tags.ts`
4. Ensure linting passes after generation by running `pnpm run lint`.
