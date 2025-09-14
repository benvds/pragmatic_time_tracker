# Tasks: Daily Time Tracking for Freelance Developer

**Input**: Design documents from `/specs/001-time-registration/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript 5.9.2, React 19.1.1, Vite, Vitest, Playwright
   → Structure: Extend existing src/features/entry with bulletproof-react patterns
2. Load design documents:
   → data-model.md: TimeEntry entity with localStorage persistence
   → contracts/: ITimeEntryService, IValidationService, IStorageService
   → quickstart.md: 3 test scenarios for E2E validation
3. Generate tasks by category:
   → Setup: Playwright, types, exports
   → Tests: Contract tests, form parsers, E2E scenarios
   → Core: Form extensions, localStorage integration
   → Integration: Component interactions, data persistence
   → Polish: Component tests, performance validation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Form parser extensions = sequential (same util.ts file)
   → Tests before implementation (RED-GREEN-Refactor)
5. Number tasks sequentially (T001, T002...)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- **CRITICAL**: All tests MUST be written and MUST FAIL before implementation

## Path Conventions
Single project structure extending existing src/features/entry:
- `src/features/entry/` - extend existing feature
- `src/lib/form/` - extend existing form utilities
- `src/__tests__/entry/` - feature-scoped tests
- `e2e/` - Playwright end-to-end tests

## Phase 3.1: Setup & Dependencies ✅
- [x] T001 [P] Install Playwright and configure for E2E testing in package.json
- [x] T002 [P] Create TypeScript interfaces in src/features/entry/types.ts
- [x] T003 [P] Update src/features/entry/index.ts to export new types and components

## Phase 3.2: Contract Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3 ✅
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test for TimeEntry interface in src/__tests__/entry/types.test.ts
- [x] T005 [P] Contract test for ITimeEntryService in src/__tests__/entry/time-entry-service.test.ts
- [x] T006 [P] Contract test for IValidationService parsers in src/__tests__/entry/validation-service.test.ts
- [x] T007 [P] Contract test for IStorageService localStorage operations in src/__tests__/entry/storage-service.test.ts

## Phase 3.3: Form Parser Extensions (ONLY after contract tests are failing) ✅
- [x] T008 Add parseDate function to src/lib/form/util.ts with ISO date validation
- [x] T009 Add parseDate export to src/lib/form/index.ts
- [x] T010 Test parseDate parser in src/__tests__/lib/form/parseDate.test.ts

## Phase 3.4: Core Implementation - Form Extensions ✅
- [x] T011 [P] Extend EntryForm component with date field in src/features/entry/form/index.tsx
- [x] T012 Add localStorage service functions directly in src/features/entry/form/index.tsx
- [x] T013 Update form submission to save TimeEntry with persistence in src/features/entry/form/index.tsx  
- [x] T014 Add form validation for date field and business rules in src/features/entry/form/index.tsx

## Phase 3.5: Component Extensions (evaluate necessity during implementation) ✅
- [x] T015 [P] Create TimeEntryList component in src/features/entry/components/TimeEntryList.tsx (if multiple components needed)
- [x] T016 [P] Create TimeEntryCard component in src/features/entry/components/TimeEntryCard.tsx (if multiple components needed)
- [x] T017 Integrate TimeEntryList with localStorage data loading (if components created)
- [x] T018 Add components folder exports to src/features/entry/index.ts (if components created)

## Phase 3.6: Custom Hooks (create only if form complexity warrants)
- [ ] T019 [P] Extract useTimeEntries hook from form component in src/features/entry/hooks/useTimeEntries.ts (if needed)
- [ ] T020 [P] Create useLocalStorage hook for data persistence in src/features/entry/hooks/useLocalStorage.ts (if needed)
- [ ] T021 Update form to use custom hooks instead of direct localStorage (if hooks created)

## Phase 3.7: Integration Tests ✅
- [x] T022 [P] Integration test form submission with localStorage in src/__tests__/entry/form-submission.test.tsx
- [x] T023 [P] Integration test data persistence across page reloads in src/__tests__/entry/data-persistence.test.tsx
- [x] T024 [P] Integration test form validation with business rules in src/__tests__/entry/form-validation.test.tsx
- [x] T025 [P] Integration test existing form extension compatibility in src/__tests__/entry/component-integration.test.tsx

## Phase 3.8: E2E Tests (Playwright) ✅
- [x] T026 [P] E2E test Scenario 1: Happy path full day entry in e2e/happy-path.spec.ts
- [x] T027 [P] E2E test Scenario 2: Form validation and error handling in e2e/form-validation.spec.ts
- [x] T028 [P] E2E test Scenario 3: Data persistence after page reload in e2e/data-persistence.spec.ts
- [x] T029 [P] E2E test Error handling and edge cases in e2e/error-handling.spec.ts

## Dependencies
- Setup (T001-T003) before all other tasks
- Contract tests (T004-T007) before core implementation (T011-T014)
- Form parser (T008-T010) before form extensions (T011-T014)
- Core implementation (T011-T014) before integration tests (T022-T025)
- Components (T015-T018) optional, evaluate during implementation
- Custom hooks (T019-T021) optional, create only if complexity warrants
- Integration tests (T022-T025) before E2E tests (T026-T029)

## Parallel Execution Examples

### Phase 3.1 - Setup Tasks
```
# Launch T001-T003 together:
Task: "Install Playwright and configure for E2E testing in package.json"
Task: "Create TypeScript interfaces in src/features/entry/types.ts" 
Task: "Update src/features/entry/index.ts to export new types and components"
```

### Phase 3.2 - Contract Tests (TDD)
```
# Launch T004-T007 together:
Task: "Contract test for TimeEntry interface in src/__tests__/entry/types.test.ts"
Task: "Contract test for ITimeEntryService in src/__tests__/entry/time-entry-service.test.ts"
Task: "Contract test for IValidationService parsers in src/__tests__/entry/validation-service.test.ts"
Task: "Contract test for IStorageService localStorage operations in src/__tests__/entry/storage-service.test.ts"
```

### Phase 3.7 - Integration Tests  
```
# Launch T022-T025 together:
Task: "Integration test form submission with localStorage in src/__tests__/entry/form-integration.test.ts"
Task: "Integration test data persistence across page reloads in src/__tests__/entry/persistence-integration.test.ts"
Task: "Integration test form validation with business rules in src/__tests__/entry/validation-integration.test.ts"
Task: "Integration test existing form extension compatibility in src/__tests__/entry/form-compatibility.test.ts"
```

### Phase 3.8 - E2E Tests
```
# Launch T026-T029 together:
Task: "E2E test Scenario 1: Happy path full day entry in e2e/time-tracking-happy-path.spec.ts"
Task: "E2E test Scenario 2: Form validation and error handling in e2e/time-tracking-validation.spec.ts"
Task: "E2E test Scenario 3: Data persistence after page reload in e2e/time-tracking-persistence.spec.ts"
Task: "Configure Playwright test fixtures and setup in e2e/fixtures/test-data.ts"
```

## Task Generation Rules Applied

1. **From Contracts**: 
   - time-entry-service.ts → T005 (ITimeEntryService contract test)
   - Validation interfaces → T006 (IValidationService contract test) 
   - Storage interface → T007 (IStorageService contract test)

2. **From Data Model**:
   - TimeEntry entity → T002 (types.ts creation), T004 (interface contract test)
   - Form validation rules → T008-T010 (parseDate parser extension)

3. **From Quickstart Scenarios**:
   - Scenario 1 → T026 (happy path E2E test)
   - Scenario 2 → T027 (validation E2E test)  
   - Scenario 3 → T028 (persistence E2E test)

4. **From Existing Architecture**:
   - Extends src/features/entry → T011-T014 (form extensions)
   - Extends src/lib/form → T008-T010 (parser extensions)
   - Optional bulletproof-react folders → T015-T021 (evaluated during implementation)

## Validation Checklist ✅

- [x] All contracts have corresponding tests (T004-T007)
- [x] TimeEntry entity has model tasks (T002, T004) 
- [x] All tests come before implementation (Phase 3.2 before 3.3-3.6)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] TDD order enforced: RED (failing tests) → GREEN (implementation) → REFACTOR
- [x] Pragmatic folder creation: components/ and hooks/ marked as optional
- [x] Extends existing architecture rather than creating duplicate features

## Notes
- **Pragmatic Implementation**: Only create components/ and hooks/ folders if complexity justifies them
- **Existing Form Extension**: Build upon proven src/lib/form system rather than rebuilding
- **TDD Critical**: Verify tests fail before implementing (T004-T007 must fail before T011-T014)
- **localStorage Integration**: Direct integration in form component, extract to hooks only if needed
- **Cross-browser Testing**: Playwright E2E tests ensure compatibility across modern browsers
- **Feature Boundaries**: All changes scoped to src/features/entry, respects bulletproof-react architecture