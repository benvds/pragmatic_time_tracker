# AGENTS.md

### Commands

```zsh
# file scoped checks preferred
pnpm format path/to/file.ts
pnpm lint path/to/file.tsx
pnpm check           # type checking
pnpm test path/to/file.test.tsx  # single test file
pnpm test:e2e        # playwright e2e tests (all specs)
pnpm test:e2e path/to/spec.ts   # single spec
pnpm test:e2e --grep "test name" # single test
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

Allowed without prompt: read files, format, lint, type check, single vitest test, single e2e spec

Ask first: package installs, git push, delete files, chmod, full build, full e2e test suite

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

### Testing

#### E2E Test Structure

E2E tests are organized with shared helpers in `tests/helpers/`:

- **selectors.ts** - All selectors, timeouts, patterns, constants
- **app-actions.ts** - Navigation, data management, offline/online actions
- **app-assertions.ts** - Verification functions for app state
- **table-helpers.ts** - Table interaction utilities
- **error-filtering.ts** - Error collection and filtering

Always import from these helpers rather than duplicating code in test files.

#### E2E Test Patterns

```typescript
// ✅ Good: Use shared helpers
import { SELECTORS, TIMEOUTS } from "../helpers/selectors";
import { navigateToApp, clearDataViaDebugMenu } from "../helpers/app-actions";
import { verifyAppLoaded } from "../helpers/app-assertions";

// ❌ Bad: Duplicate selectors and logic
const title = "h1";
await page.goto("/");
await page.waitForSelector(title, { timeout: 10000 });
```

#### When Writing E2E Tests

1. **Run single test first** - Test one spec at a time during development: `pnpm test:e2e --grep "test name"`
2. **Use shared helpers** - Import from `tests/helpers/` to avoid duplication
3. **Clear data properly** - Use `clearDataViaDebugMenu()` for empty state tests (dev mode auto-seeds data)
4. **Filter errors** - Use `filterCriticalErrors()` to ignore expected errors (favicon, dev server, WorkerError, etc.)
5. **Wait for selectors** - Always wait for `SELECTORS.TITLE` after navigation/reload
6. **Avoid shared state** - Don't use module-level variables in test files (breaks parallelization)
7. **Run full suite last** - Only run `pnpm test:e2e` after individual tests pass

#### Test Refactoring Process

When refactoring tests:

1. Run single test to verify current behavior
2. Identify duplication across test files
3. Extract to shared helpers
4. Update one test file at a time
5. Run that spec to validate
6. Move to next file
7. Run full suite when all updated

#### Parallelization

Tests run in parallel using 5 workers by default (`fullyParallel: true` in playwright.config.ts).

**DO NOT use shared state:**

```typescript
// ❌ Bad: Breaks parallelization
let storageCleared = false;
test.beforeEach(async ({ page }) => {
    if (!storageCleared) {
        await clearStorage();
        storageCleared = true;
    }
});

// ✅ Good: Each test is independent
test.beforeEach(async ({ page }) => {
    await page.goto("/");
});
```

Each test should be completely independent and not rely on execution order or shared state.

### Workflow

- test first: write/update tests before implementation
- PR checklist: format, type check, unit tests green; small focused diffs
- when stuck: ask clarifying questions or propose a plan
- e2e tests: use shared helpers, run single tests during dev, full suite before commit
