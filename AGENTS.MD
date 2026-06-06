# AGENTS.MD

Operating and instruction manual for AI coding agents collaborating on the **control.ts** workspace.

---

## Project Context

- **Name:** control.ts
- **Owner/Organization:** [TELEUZI](https://github.com/TELEUZI)
- **Description:** A lightweight (<1kb) and versatile UI library for building modern web applications with ease, offering simple element/component factories and seamless integration with Preact Signals for reactive state management.
- **Repository:** `https://github.com/TELEUZI/control.ts.git`
- **Architecture:** Monorepo managed using `pnpm` workspaces and Turborepo (`turbo`).

---

## Tech Stack & Project Structure

The project is organized as a monorepo containing packages and applications:

### Workspace Packages (`/packages`)

- **`@control.ts/control`** ([packages/control](file:///j:/control.ts/packages/control)): The heart of the library. Contains the base class for abstraction from HTML.
- **`@control.ts/min`** ([packages/min](file:///j:/control.ts/packages/min)): Lightweight element and component factories.
- **`@control.ts/signals`** ([packages/signals](file:///j:/control.ts/packages/signals)): Reactive state bindings and signals integration utilizing `@preact/signals-core`.
- **`@control.ts/tags-scraper`** ([packages/tags-scraper](file:///j:/control.ts/packages/tags-scraper)): Scraping tool using `cheerio` to fetch the latest HTML elements from MDN and generate type/factory definitions.
- **Shared Configs:**
  - `@control.ts/design-system` ([packages/design-system](file:///j:/control.ts/packages/design-system))
  - `@control.ts/eslint-config` ([packages/eslint-config](file:///j:/control.ts/packages/eslint-config))
  - `@control.ts/prettier-config` ([packages/prettier-config](file:///j:/control.ts/packages/prettier-config))
  - `@control.ts/typescript-config` ([packages/typescript-config](file:///j:/control.ts/packages/typescript-config))

### Workspace Applications (`/apps`)

- **`storybook`** ([apps/storybook](file:///j:/control.ts/apps/storybook)): UI component documentation and playground.
- **`web`** ([apps/web](file:///j:/control.ts/apps/web)): Web-based demonstration and testing application.

---

## Common Development Commands

All tasks are managed via `pnpm` and `turbo`.

| Command                     | Action                                         | Scope                 |
| :-------------------------- | :--------------------------------------------- | :-------------------- |
| `pnpm i`                    | Install dependencies                           | Workspace Root        |
| `pnpm run build`            | Build all apps and packages                    | Workspace Root        |
| `pnpm run dev`              | Run dev mode with watch                        | Workspace Root        |
| `pnpm run lint`             | Run ESLint across workspace                    | Workspace Root        |
| `pnpm run lint:fix`         | Automatically fix ESLint warnings              | Workspace Root        |
| `pnpm run format`           | Run Prettier formatter                         | Workspace Root        |
| `pnpm run test`             | Run tests with watch                           | Workspace Root        |
| `pnpm run test:run`         | Run tests once in CI mode                      | Workspace Root        |
| `pnpm run coverage`         | Run Vitest tests and generate coverage reports | Workspace Root        |
| `pnpm run add-changeset`    | Add a release changeset                        | Workspace Root        |
| `pnpm run version-packages` | Bump package versions based on changesets      | Workspace Root        |
| `pnpm run release`          | Build packages and publish to NPM registry     | Workspace Root        |
| `pnpm run update-html-tags` | Scrape MDN and regenerate HTML tag files       | `@control.ts/signals` |

---

## Coding Rules & Conventions

To maintain codebase sanity, always adhere to the following rules:

1. **Package Manager:** Use `pnpm` exclusively. Never run `npm` or `yarn` commands.
2. **TypeScript Strict Mode:** All code must be strictly typed, matching DOM standards where applicable. Avoid `any` types.
3. **No Code Duplication:**
   - Eliminate duplicated code between packages (e.g. `min` vs `signals` factories).
   - Reuse base component abstractions from `@control.ts/control` where possible.
4. **HTML abstraction naming:** Element/component factories correspond directly to standard HTML tags. Avoid custom tag names unless subclassing.
5. **No placeholders:** Fully implement functions and features. Do not use temporary placeholders or unfinished TODOs in pull requests.
6. **Linting and Formatting:** All files must pass `pnpm run lint` and `pnpm run format` before they can be committed.

---
