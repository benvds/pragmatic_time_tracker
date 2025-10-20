# AGENTS.md

### Commands

```zsh
# file scoped checks preferred
pnpm format path/to/file.ts
pnpm lint path/to/file.tsx
pnpm check           # type checking
pnpm test path/to/file.test.tsx  # single test file
pnpm test:e2e        # playwright e2e tests
pnpm build           # full build (ask first)
```

### Code style

- **Imports**: use absolute paths with `@/` prefix (e.g. `import { useEntries } from "@/features/storage";`)
- **Files**: kebab-case naming (e.g. `my-component.tsx`)
- **Exports**: named exports, arrow functions for components
- **Styling**: css modules with css variables (e.g. `import styles from "./field-error.module.css";`)
- **Formatting**: 4-space tabs (prettier), oxlint for linting
- **Types**: TypeScript strict mode, explicit types for public APIs
- **Error handling**: throw custom error classes (see `ValidationError` in `src/features/storage/types.ts`)
- **Components**: small, pure, colocated with styles and tests

### Don't

- hard code colors or css values (use css variables in `src/index.css`)
- add new dependencies without approval (check package.json first)
- use default exports or classes for components

### Safety and permissions

Allowed without prompt: read files, format, lint, type check, single vitest test

Ask first: package installs, git push, delete files, chmod, full build, e2e test suite

### Project structure

Apply the following strategy for project structure:

- Colocate things as close as possible to where it's being used
- Avoid large components with nested rendering functions
- Stay consistent
- Limit the number of props a component is accepting as input
- Abstract shared or general components and logic into a components or lib modules

In general use the follow structure:

```
src
|
+-- assets            # assets folder can contain all the static files such as images, fonts, etc.
|
+-- components        # shared components used across the entire application
|
+-- features          # domain specificfeature based modules
|
+-- lib               # non domain specific reusable libraries
```

A feature could have the following structure:

```
features
|
+-- feature-name
|   |
|   +-- components    # components specific to this feature
|   +-- lib           # libraries specific to this feature
|   +-- types         # routes specific to this feature
|   +-- index.ts      # entry point for this feature
```

### Examples

- component patterns: `src/features/logbook/logbook.tsx`
- custom hooks: `src/features/storage/hooks/use-entries.ts`
- validation/error handling: `src/features/storage/lib/validation.ts`
- non-domain logic: `src/lib` modules

### Preferred libraries

- `@mantine/core`, `@mantine/hooks`, `@mantine/form`: UI components and forms
- `@livestore/livestore`, `@livestore/react`: local-first storage and state
- `@tabler/icons-react`: icons
- `clsx`: conditional classnames
- `vitest`: unit tests with happy-dom
- `@playwright/test`: e2e tests

### Workflow

- test first: write/update tests before implementation
- PR checklist: format, type check, unit tests green; small focused diffs
- when stuck: ask clarifying questions or propose a plan
