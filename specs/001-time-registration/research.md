# Research: Daily Time Tracking Feature

**Date**: 2025-09-14  
**Feature**: Daily Time Tracking for Freelance Developer

## Research Areas

### 1. React 19 Form Handling Best Practices

**Decision**: Extend existing src/lib/form system with custom parsers  
**Rationale**: 
- Existing useForm hook with Field<T> pattern already proven
- src/features/entry/form shows working implementation with description/project/hh/mm fields
- Consistent validation pattern with FieldParser<T> and FieldError components
- Built-in validation, error handling, and type safety

**Existing Implementation Analysis**:
- useForm hook manages field state with validation
- Field<T> type enforces either {value: T} or {value: T | undefined, error: string}
- Form parsers handle validation: parseDescription, parseProject, parseHh, parseMm
- Real-time validation on blur events
- Form submission with everyFieldOk() guard

**Alternatives considered**:
- Third-party form libraries: Would duplicate existing proven system
- Custom form solution: Reinventing what already works well

### 2. Local Storage Data Persistence

**Decision**: Direct localStorage API with JSON serialization and TypeScript types  
**Rationale**:
- Single-user application with no backend requirements
- Browser-native persistence sufficient for ~365 entries/year
- Simple key-value storage pattern: `timeEntries: TimeEntry[]`
- Built-in data durability across browser sessions

**Alternatives considered**:
- IndexedDB: Over-engineered for simple array of time entries
- Third-party storage libraries: Unnecessary abstraction
- Session storage: Would lose data on browser close

### 3. Date Handling Strategy

**Decision**: Use native Date objects with toISOString().split('T')[0] for date keys  
**Rationale**:
- Built-in browser support, no external dependencies
- ISO date format (YYYY-MM-DD) provides consistent sorting
- Prevents timezone-related bugs for daily entries

**Alternatives considered**:
- date-fns or moment.js: Unnecessary for simple date operations
- Unix timestamps: Less readable for debugging
- String manipulation: More error-prone than Date methods

### 4. Input Validation Patterns

**Decision**: Real-time validation with immediate user feedback  
**Rationale**:
- Time entries have clear business rules (max 24hrs, description required for <7hrs)
- Better UX than form-level validation on submit
- TypeScript provides compile-time type safety

**Validation Rules Identified**:
- Hours: 0-24 integer range
- Minutes: 0-59 integer range
- Description: Required when total time < 7 hours (420 minutes)
- Date: Must be valid date, defaults to today

**Alternatives considered**:
- Submit-time validation only: Poor user experience
- Schema validation libraries: Overkill for 3 simple rules

### 5. Component Architecture

**Decision**: Extend existing src/features/entry using bulletproof-react patterns  
**Rationale**:
- Existing entry feature already has description/project/hh:mm form structure
- Bulletproof-react feature module pattern already established
- Add date field and persistence to existing EntryForm
- Maintain architectural consistency across project

**Extended Component Structure** (pragmatic approach):
```
src/features/entry/                     # Existing feature to extend
├── form/                               # Existing form component
│   └── index.tsx                       # Current EntryForm (add date + persistence)
├── components/                         # NEW: only if multiple components needed
│   ├── TimeEntryList.tsx              # Display saved entries
│   └── TimeEntryCard.tsx              # Individual entry display  
├── hooks/                              # NEW: only if custom hooks needed
│   └── useTimeEntries.ts              # Entry management + localStorage logic
├── types.ts                            # NEW: TypeEntry interface (file, not folder)
└── index.ts                            # EXISTING: export file
```

**Simplified Rationale**:
- **No api/ folder**: localStorage operations can live in hooks or directly in components
- **No utils/ folder**: Single parseDate function can be added to existing src/lib/form/util.ts
- **Types as file**: Single interface doesn't warrant a folder
- **Hooks only if needed**: Complex state management may be better handled directly in form

**Alternatives considered**:
- New time-tracking feature: Would duplicate existing form logic
- Global state management: Unnecessary complexity for feature-scoped data
- Monolithic approach: Against bulletproof-react principles

### 6. Testing Strategy

**Decision**: Multi-layer testing with TDD + E2E using Playwright  
**Rationale**:
- Constitution requires RED-GREEN-Refactor cycle
- Vitest + Testing Library already configured for unit/integration
- Playwright for comprehensive E2E user workflow testing
- Focus on user behaviors rather than implementation details

**Test Types Planned**:
- **E2E tests (Playwright)**: Complete user workflows, cross-browser testing
- **Integration tests (Vitest)**: Full form workflow with localStorage, existing form extension
- **Component tests (Testing Library)**: Form validation, error states, display logic
- **Unit tests (Vitest)**: Custom hooks, validation functions, parsers
- **Contract tests**: localStorage data schema consistency, form parser compatibility

**E2E Test Scenarios (Playwright)**:
- End-to-end time entry creation and persistence
- Form validation across different browsers
- Data persistence after browser reload
- Cross-session data integrity

**Alternatives considered**:
- E2E only: Insufficient coverage for business logic
- Unit tests only: Miss integration issues
- Mock localStorage: Hide real storage integration bugs
- Cypress instead of Playwright: Playwright better for modern React apps

## Implementation Unknowns Resolved

All technical context items have been clarified through research:
- ✅ Language/Version: TypeScript 5.9.2 with React 19.1.1
- ✅ Storage: localStorage with JSON serialization
- ✅ Testing: Vitest + Testing Library (existing setup)
- ✅ Validation: Real-time client-side validation
- ✅ Component patterns: Controlled components + custom hooks

## Next Phase Requirements

Phase 1 dependencies satisfied:
- No external API research needed (localStorage only)
- No complex state management patterns required
- Component architecture defined
- Testing strategy established
- Data persistence approach confirmed

### 7. Playwright E2E Setup

**Decision**: Add Playwright for end-to-end testing of time tracking workflows  
**Rationale**:
- Constitution requires comprehensive testing including E2E
- Playwright provides cross-browser testing (Chrome, Firefox, Safari)
- Better modern web app support than Cypress
- Integrates well with existing Vite + TypeScript setup

**Configuration Required**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Test Structure**:
```
e2e/
├── time-tracking.spec.ts              # Main user workflows
├── playwright.config.ts               # Playwright configuration
└── fixtures/
    └── test-data.ts                   # Reusable test data
```

**E2E Scenarios to Test**:
- Complete time entry creation workflow
- Form validation across browsers
- Data persistence after page reload
- Extending existing form functionality

**Alternatives considered**:
- Cypress: Less robust for modern React applications
- Manual testing only: Insufficient for regression testing
- No E2E testing: Violates constitution requirements

**Status**: Research complete ✅