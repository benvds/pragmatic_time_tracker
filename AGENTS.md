# AGENTS.md

## Core Principles

- Prefer simplicity, clear boundaries, and consistency over cleverness.

### Do

- use kebab-case for file names, e.g.: `my-component.tsx`
- use css modules for styling, e.g.: `import styles from "./my-component.module.css ";`
- use css variables
- use absolute paths for imports, e.g.: `import { Button } from "@/components/button";`
- default to small components
- use arrow functions
- use named exports

### Don't

- do not use hard coded css values
- do not hard code colors
- do not add new dependencies without approval

### Commands

```zsh
# file scoped checks preferred
pnpm format path/to/file.ts
pnpm lint path/to/file.tsx
# check types
pnpm check
# tests
pnpm test path/to/file.test.tsx
# full build when explicitly requested
pnpm build
```

### Safety and permissions

Allowed without prompt:

- read files, list files
- format, lint and type checking
- vitest single test

Ask first:

- package installs,
- git push
- deleting files, chmod
- running full build or end to end suites

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

### Good and bad examples

- non domain specific logic: look at `src/lib/form`
- domain specific logic: look at `src/features/entry`

## Components & Styling

- Small, pure components; prefer composition over inheritance.
- Co-locate component, styles, and tests next to each other.
- Keep presentational vs. container concerns separate when it clarifies intent.

### PR checklist

- format and type check: green
- unit tests: green. add tests for new code paths
- diff: small with a brief summary

### When stuck

- ask a clarifying question, propose a short plan, or open a draft PR with notes

### Test first mode

- write or update tests first on new features, then code to green

### Design system

- manage css variables in `src/index.css`
- for colors take inspiration from: https://tailwindcss.com/docs/colors
- for other variables and values like spacing, border radius, etc. take inspiration from: https://tailwindcss.com/docs/theme
