# AGENTS.md

### Do

- use kebab-case for file names
- use css modules for styling, e.g.: `import styles from "./my-component.module.css ";`
- use css variables
- default to small components
- default to small diffs

### Don't

- don't use hard coded css values
- do not hard code colors
- do not use divs if we have a component already
- do not add new heavy dependencies without approval

### Commands

```zsh
# file scoped checks preferred
pnpm format --write path/to/file.ts
pnpm lint:fix path/to/file.tsx
# check types
pnpm check
# tests
npm run vitest run path/to/file.test.tsx
# full build when explicitly requested
npm run build:app
```

### Safety and permissions

Allowed without prompt:

- read files, list files
- tsc single file, prettier, eslint,
- vitest single test

Ask first:

- package installs,
- git push
- deleting files, chmod
- running full build or end to end suites

### Project structure

- see App.tsx for our routes
- see AppSideBar.tsx for our sidebar
- components are in app/components
- theme tokens are in app/lib/theme/tokens.ts

### Good and bad examples

- avoid class based components like `Admin.tsx`
- use functional components with hooks like `Projects.tsx`
- forms: copy `app/components/Form.Field.tsx` and `app/components/Form.Submit.tsx`
- charts: copy `app/components/Charts/Bar.tsx` and `app/lib/chartTheme.ts`
- data layer: use `app/api/client.ts`. do not fetch in components

### API docs

- docs in ./api/docs/\*.md
- list projects - GET /api/projects using app/api/client.ts
- update project name - PATCH /api/projects/:id using client.projects.update

### PR checklist

- format and type check: green
- unit tests: green. add tests for new code paths
- diff: small with a brief summary

### When stuck

- ask a clarifying question, propose a short plan, or open a draft PR with notes

### Test first mode

- write or update tests first on new features, then code to green

### Design system

- use @acme/ui per the indexed docs in ./design-system-index/\*.md
- tokens come from @acme/ui/tokens
