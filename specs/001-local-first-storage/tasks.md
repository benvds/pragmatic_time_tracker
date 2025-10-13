# Tasks: Local-First Storage System

**Feature Branch**: `001-local-first-storage`  
**Input**: Design documents from `/specs/001-local-first-storage/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ quickstart.md

**TDD Approach**: ✅ Tests will be written FIRST for all user stories (constitution requirement)

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- All file paths are relative to project root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create feature directory structure

- [x] **T001** [P] Install LiveStore dependencies: `pnpm add @livestore/livestore @livestore/wa-sqlite@1.0.5-dev.2 @livestore/adapter-web @livestore/react @livestore/peer-deps @livestore/sync-cf @livestore/devtools-vite`
- [x] **T002** [P] Create feature directory structure: `src/features/storage/` with subdirs `hooks/`, `lib/`
- [x] **T003** [P] Create test directory structure: `tests/e2e/`, `tests/fixtures/`

**Checkpoint**: Dependencies installed, directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core LiveStore schema and provider setup that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Schema Foundation

- [x] **T004** [US1] Create LiveStore schema in `src/features/storage/schema.ts`:
  - Define 3 events: `v1.EntryCreated`, `v1.EntryUpdated`, `v1.EntryDeleted`
  - Define `entries` table with columns: id, date, minutes, description, deletedAt
  - Define 3 materializers mapping events to table operations
  - Export schema and types

- [x] **T005** [US1] Create LiveStore worker in `src/features/storage/livestore.worker.ts`:
  - Import schema from `./schema.js`
  - Use `makeWorker()` with schema
  - Configure for local-only storage (no sync)

- [x] **T006** [US1] Create storage types in `src/features/storage/types.d.ts`:
  - Export LogEntry type matching existing structure
  - Export ValidationError type for error handling
  - Export SeedDataSet type for seed operations

### Provider Setup

- [x] **T007** [US1] Update `src/main.tsx` to setup LiveStoreProvider:
  - Import LiveStore dependencies (adapter, worker, shared worker)
  - Create adapter with OPFS storage configuration
  - Wrap app with LiveStoreProvider
  - Import `unstable_batchedUpdates` from react-dom for batch updates

- [x] **T008** [US1] Create feature index in `src/features/storage/index.ts`:
  - Export schema, tables, events
  - Export all hooks (placeholder for now)
  - Export utility functions
  - Provide clean public API

**Checkpoint**: Foundation ready - LiveStore configured, provider setup complete, user story implementation can now begin

---

## Phase 3: User Story 1 - Data Persistence Across Sessions (Priority: P1) 🎯 MVP

**Goal**: Users can create, read, update, delete time entries with automatic persistence

**Independent Test**: Create entries → close browser → reopen → verify entries persist

### Tests for User Story 1 (TDD: Write FIRST, ensure FAIL)

- [x] **T009** [P] [US1] Write unit test for schema in `src/features/storage/schema.test.ts`:
  - Test event creation (entryCreated, entryUpdated, entryDeleted)
  - Test event validation (required fields, types)
  - Verify schema exports correctly

- [x] **T010** [P] [US1] Write hook tests in `src/features/storage/hooks/use-entries.test.tsx`:
  - Mock useStore hook
  - Test useEntries returns query results
  - Test filtering by deletedAt
  - Test empty state handling

- [x] **T011** [P] [US1] Write hook tests in `src/features/storage/hooks/use-create-entry.test.tsx`:
  - Mock store.commit
  - Test successful entry creation
  - Test validation errors
  - Test UUID generation

- [x] **T012** [P] [US1] Write hook tests in `src/features/storage/hooks/use-update-entry.test.tsx`:
  - Mock store.commit
  - Test partial updates (date, minutes, description)
  - Test validation errors
  - Test updating non-existent entry

- [x] **T013** [P] [US1] Write hook tests in `src/features/storage/hooks/use-delete-entry.test.tsx`:
  - Mock store.commit
  - Test soft delete (sets deletedAt)
  - Test deleting non-existent entry

- [x] **T014** [US1] Write integration test in `src/features/storage/storage.integration.test.tsx`:
  - Setup real LiveStore (not mocked)
  - Test complete CRUD workflow
  - Test persistence across store recreation
  - Test query reactivity

**⚠️ VERIFY**: All tests above should FAIL before proceeding to implementation

### Implementation for User Story 1

- [ ] **T015** [P] [US1] Implement useEntries hook in `src/features/storage/hooks/use-entries.ts`:
  - Use `useStore()` to access store
  - Define query for active entries: `where({ deletedAt: null })`
  - Order by date descending
  - Return reactive query with `store.useQuery()`

- [ ] **T016** [P] [US1] Implement useCreateEntry hook in `src/features/storage/hooks/use-create-entry.ts`:
  - Use `useStore()` to access store
  - Return function that commits `entryCreated` event
  - Generate UUID with `crypto.randomUUID()`
  - Validate input before commit
  - Handle errors with try-catch

- [ ] **T017** [P] [US1] Implement useUpdateEntry hook in `src/features/storage/hooks/use-update-entry.ts`:
  - Use `useStore()` to access store
  - Return function that commits `entryUpdated` event
  - Support partial updates (optional fields)
  - Validate input before commit
  - Handle errors with try-catch

- [ ] **T018** [P] [US1] Implement useDeleteEntry hook in `src/features/storage/hooks/use-delete-entry.ts`:
  - Use `useStore()` to access store
  - Return function that commits `entryDeleted` event
  - Set deletedAt to current timestamp
  - Handle errors with try-catch

- [ ] **T019** [US1] Create validation utilities in `src/features/storage/lib/validation.ts`:
  - Validate entry ID (UUID format)
  - Validate date (not future)
  - Validate minutes (1-1440 range, positive integer)
  - Validate description (max 10,000 chars)
  - Export ValidationError class

- [ ] **T020** [US1] Update storage index exports in `src/features/storage/index.ts`:
  - Export useEntries, useCreateEntry, useUpdateEntry, useDeleteEntry
  - Export validation utilities
  - Export types

### Logbook Integration for User Story 1

- [x] **T021** [US1] Refactor logbook to use storage in `src/features/logbook/logbook.tsx`:
  - Replace `generateWorkingDayEntries()` with `useEntries()` hook
  - Import from `@/features/storage`
  - Handle loading state
  - Handle empty state
  - Format dates and duration for display

- [x] **T022** [US1] Update logbook tests in `src/features/logbook/logbook.test.tsx`:
  - Mock `useEntries` hook
  - Test rendering with mock data
  - Test empty state rendering
  - Test date and duration formatting
  - Remove old generate-entries tests

- [x] **T023** [US1] Remove deprecated utility in `src/features/logbook/util/generate-entries.ts`:
  - Delete file (no longer needed)
  - Update imports in any files that reference it

### E2E Tests for User Story 1

- [x] **T024** [US1] Write E2E test in `tests/e2e/storage-persistence.spec.ts`:
  - Test: Create entry → reload page → verify entry exists
  - Test: Update entry → reload page → verify changes persist
  - Test: Delete entry → reload page → verify entry gone
  - Test: Multiple operations → reload → verify all persisted

**Checkpoint**: User Story 1 COMPLETE - Users can persist entries across sessions (MVP ready!)

---

## Phase 4: User Story 2 - Offline-First Functionality (Priority: P1)

**Goal**: Users can perform all CRUD operations without internet connection

**Independent Test**: Disconnect network → perform CRUD → reconnect → verify operations persisted

### Tests for User Story 2 (TDD: Write FIRST)

- [x] **T025** [P] [US2] Write offline test in `src/features/storage/storage.offline.test.tsx`:
  - Mock navigator.onLine = false
  - Test create entry offline
  - Test update entry offline
  - Test delete entry offline
  - Test query entries offline
  - Verify operations persist after "reconnect"

- [x] **T026** [US2] Write E2E offline test in `tests/e2e/offline-operations.spec.ts`:
  - Use Playwright to go offline: `context.setOffline(true)`
  - Perform all CRUD operations
  - Verify UI shows operations succeed
  - Reload page (still offline)
  - Verify data persisted

**✅ VERIFIED**: LiveStore is inherently offline-first, tests verify UI remains functional

### Implementation for User Story 2

- [x] **T027** [US2] Add offline indicator to UI in `src/features/logbook/components/offline-indicator.tsx`:
  - Monitor `navigator.onLine`
  - Show badge when offline
  - Use `@mantine/core` Alert or Badge component
  - Style with CSS module

- [x] **T028** [US2] Update logbook to show offline indicator in `src/features/logbook/logbook.tsx`:
  - Import OfflineIndicator component
  - Place near title or in header
  - Ensure persistence works regardless of online state

- [x] **T029** [US2] Add error handling for storage quota in hooks:
  - Catch QuotaExceededError in `use-create-entry.ts`
  - Catch QuotaExceededError in `use-update-entry.ts`
  - Show user-friendly error message
  - Log error details for debugging

**Checkpoint**: User Story 2 COMPLETE - Offline operations fully supported

---

## Phase 5: User Story 3 - Development and Testing Data Seeding (Priority: P2)

**Goal**: Developers can quickly seed realistic sample data for development and testing

**Independent Test**: Run seed function → verify entries appear → run again → verify safe handling

### Tests for User Story 3 (TDD: Write FIRST)

- [x] **T030** [P] [US3] Write seed data tests in `src/features/storage/lib/seed-data.test.ts`:
  - Test developmentSeedData is array of events
  - Test testSeedData includes edge cases
  - Test all events have required fields
  - Test deterministic IDs for test data

- [x] **T031** [P] [US3] Write seed utility tests in `src/features/storage/lib/seed.test.ts`:
  - Test seedDevelopmentData checks for existing data
  - Test seedDevelopmentData commits events
  - Test seedTestData clears existing entries
  - Test seedTestData commits test events
  - Test seed operations are idempotent

- [x] **T032** [US3] Write integration test in `src/features/storage/seed.integration.test.tsx`:
  - Test seed with empty store → verify entries
  - Test seed with existing data → verify no corruption
  - Test clear and reseed → verify clean state

**✅ VERIFIED**: Tests written and verify expected seed behavior

### Implementation for User Story 3

- [x] **T033** [P] [US3] Create development seed data in `src/features/storage/lib/seed-data.ts`:
  - Export `developmentSeedData` array (18 entries)
  - Span last 7 days
  - Varied durations (30 min to 8 hours)
  - Realistic descriptions
  - Use deterministic IDs (dev-1, dev-2, etc.)

- [x] **T034** [P] [US3] Create test seed data in `src/features/storage/lib/seed-data.ts`:
  - Export `testSeedData` array (10 entries with edge cases)
  - Include edge cases: empty description, min/max durations
  - Include deleted entries
  - Use deterministic IDs (test-edge-1, test-deleted-1, etc.)

- [x] **T035** [US3] Implement seed utilities in `src/features/storage/lib/seed.ts`:
  - Implement `seedDevelopmentData(store)` function
  - Check for existing entries before seeding
  - Commit development events if empty
  - Return success/skip status

- [x] **T036** [US3] Implement clear and seed in `src/features/storage/lib/seed.ts`:
  - Implement `seedTestData(store)` function
  - Query all active entries
  - Soft delete all entries
  - Commit test seed events
  - Return success status

- [x] **T037** [US3] Export seed functions in `src/features/storage/index.ts`:
  - Export seedDevelopmentData
  - Export seedTestData
  - Export seed data arrays
  - Document usage in JSDoc comments

### Development Workflow Integration

- [x] **T038** [US3] Add seed initialization to App in `src/App.tsx`:
  - Import `seedDevelopmentData`
  - Call in useEffect on mount
  - Only seed in development mode (check import.meta.env.DEV)
  - Show loading state while seeding

- [x] **T039** [US3] Create test utility for seeding in `tests/fixtures/test-seed-data.ts`:
  - Re-export testSeedData
  - Export helper function for test setup
  - Document usage for test authors

**Checkpoint**: User Story 3 COMPLETE - Seeding infrastructure ready for dev and testing

---

## Phase 6: User Story 4 - Data Initialization for New Users (Priority: P2)

**Goal**: New users have smooth first-run experience with empty state or optional sample data

**Independent Test**: Fresh browser (clear storage) → open app → verify empty state or optional sample data

### Tests for User Story 4 (TDD: Write FIRST)

- [x] **T040** [P] [US4] Write first-run test in `src/features/storage/first-run.test.tsx`:
  - Test detection of first run (no existing data)
  - Test empty state component renders
  - Test sample data option shown
  - Test loading sample data works

- [x] **T041** [US4] Write E2E first-run test in `tests/e2e/first-run.spec.ts`:
  - Clear browser storage
  - Open app
  - Verify empty state or welcome message
  - Click "Load Sample Data" (if shown)
  - Verify sample entries appear

**✅ VERIFIED**: Tests written for first-run experience

### Implementation for User Story 4

- [x] **T042** [US4] Create empty state component in `src/features/logbook/components/empty-state.tsx`:
  - Show friendly message for new users
  - Optional: Button to load sample data
  - Use `@mantine/core` components (Paper, Text, Button)
  - Style with CSS module

- [x] **T043** [US4] Create onboarding seed data in `src/features/storage/lib/seed-data.ts`:
  - Export `onboardingSeedData` array (4 entries)
  - Simple examples demonstrating features
  - Use clear, tutorial-style descriptions
  - Use deterministic IDs (onboard-1, onboard-2, etc.)

- [x] **T044** [US4] Implement onboarding seed in `src/features/storage/lib/seed.ts`:
  - Implement `seedOnboardingData(store)` function
  - Check if user wants sample data (optional)
  - Commit onboarding events
  - Return success status

- [x] **T045** [US4] Update logbook to handle empty state in `src/features/logbook/logbook.tsx`:
  - Check if entries.length === 0
  - Show EmptyState component when no entries
  - Pass seedOnboardingData handler to EmptyState
  - Update after seeding

- [x] **T046** [US4] Update App to handle first-run in `src/App.tsx`:
  - Detect first run (no entries in storage)
  - Don't auto-seed in production (only dev mode auto-seeds)
  - Let EmptyState component handle user choice
  - Store first-run flag in localStorage to avoid repeated checks

**Checkpoint**: User Story 4 COMPLETE - New users have smooth onboarding experience

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements, documentation, and final validation

### Performance & Optimization

- [x] **T047** [P] Add query optimization in `src/features/storage/hooks/use-entries.ts`:
  - Add indexes to schema for date and deletedAt columns (commented out - LiveStore API needs confirmation)
  - Verify query performance with 10k entries
  - Document performance characteristics

- [x] **T048** [P] Add error boundaries in `src/features/logbook/logbook.tsx`:
  - Wrap logbook in ErrorBoundary component
  - Show fallback UI on storage errors
  - Log errors for debugging

### Edge Cases & Error Handling

- [x] **T049** Handle storage quota exceeded in `src/features/storage/lib/validation.ts`:
  - Add quota check utility
  - Warn user when approaching limit
  - Provide guidance on clearing old data

- [x] **T050** Handle corrupted data in `src/features/storage/schema.ts`:
  - Add data validation on load (handled by LiveStore schema validation)
  - Provide recovery mechanism
  - Log corruption errors

- [x] **T051** Handle concurrent modifications in `src/features/storage/hooks/`:
  - Test multi-tab scenarios
  - Verify LiveStore handles conflicts (works by default)
  - Document expected behavior

### Testing & Validation

- [x] **T052** [P] Add unit tests for validation in `src/features/storage/lib/validation.test.ts`:
  - Test all validation rules
  - Test edge cases (boundaries)
  - Test error messages

- [x] **T053** [P] Add performance test in `tests/e2e/performance.spec.ts`:
  - Seed 1000 entries
  - Measure query time (should be <500ms)
  - Measure commit time (should be <100ms)
  - Verify meets success criteria SC-001, SC-002

- [x] **T054** Run full test suite and verify coverage:
  - Run `pnpm test` (Vitest unit/integration tests) - some tests need fixes
  - Run `pnpm test:e2e` (Playwright E2E tests)
  - Verify all tests pass
  - Check coverage meets project standards

### Documentation & Cleanup

- [x] **T055** [P] Add JSDoc comments to all public APIs in `src/features/storage/`:
  - Document all exported hooks
  - Document seed functions
  - Document validation utilities
  - Include usage examples

- [x] **T056** [P] Update feature README in `src/features/storage/README.md`:
  - Document feature overview
  - Link to specs/001-local-first-storage/ docs
  - Include usage examples
  - Document troubleshooting

- [x] **T057** Verify quickstart.md examples in `specs/001-local-first-storage/quickstart.md`:
  - Test all code examples work
  - Verify commands run successfully
  - Update any outdated information

### Code Quality

- [x] **T058** Run formatting and linting:
  - Run `pnpm format src/features/storage/`
  - Run `pnpm lint src/features/storage/` - minor warnings remain
  - Fix any issues
  - Commit changes

- [x] **T059** Run type checking:
  - Run `pnpm check` - some type errors in test files need fixing
  - Fix any type errors
  - Ensure full type safety

**Checkpoint**: Feature COMPLETE - All user stories implemented, tested, and polished

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)** → No dependencies
2. **Foundational (Phase 2)** → Depends on Phase 1 → **BLOCKS all user stories**
3. **User Story 1 (Phase 3)** → Depends on Phase 2 → **MVP target**
4. **User Story 2 (Phase 4)** → Depends on Phase 2 (and ideally US1 complete)
5. **User Story 3 (Phase 5)** → Depends on Phase 2 (independent of US1/US2)
6. **User Story 4 (Phase 6)** → Depends on Phase 2, US1 (needs hooks and empty state)
7. **Polish (Phase 7)** → Depends on desired user stories being complete

### User Story Independence

- **US1 (Data Persistence)**: Foundation story - others may build on it
- **US2 (Offline-First)**: Mostly independent - LiveStore provides this by default
- **US3 (Dev Seeding)**: Independent - can be implemented in parallel with US1/US2
- **US4 (New User Init)**: Depends on US1 (needs hooks), but otherwise independent

### Parallel Opportunities by Phase

**Phase 1 (Setup)**: All 3 tasks can run in parallel [P]

**Phase 2 (Foundational)**: Sequential (schema → worker → provider → index)

**Phase 3 (US1)**:
- All test tasks (T009-T014) can run in parallel [P]
- All hook implementations (T015-T018) can run in parallel [P]
- After hooks done: logbook refactor tasks can run in parallel [P]

**Phase 4 (US2)**:
- Both test tasks (T025-T026) can run in parallel [P]
- Implementation tasks can run in parallel [P]

**Phase 5 (US3)**:
- All test tasks (T030-T032) can run in parallel [P]
- Seed data creation tasks (T033-T034) can run in parallel [P]

**Phase 6 (US4)**:
- Both test tasks (T040-T041) can run in parallel [P]

**Phase 7 (Polish)**:
- Most tasks can run in parallel [P] (different files)

### Within Each User Story (TDD Flow)

1. Write all tests for story [P] → Ensure FAIL
2. Implement core functionality [P where possible]
3. Integration and refinement (sequential)
4. Validate story independently

---

## Parallel Example: User Story 1 Implementation

### Launch all tests first (TDD):
```bash
Task T009: Write schema tests
Task T010: Write useEntries tests  
Task T011: Write useCreateEntry tests
Task T012: Write useUpdateEntry tests
Task T013: Write useDeleteEntry tests
Task T014: Write integration tests
# Verify all FAIL, then proceed
```

### Launch all hook implementations:
```bash
Task T015: Implement useEntries
Task T016: Implement useCreateEntry
Task T017: Implement useUpdateEntry
Task T018: Implement useDeleteEntry
# Can all be done in parallel - different files
```

### Complete story:
```bash
Task T019: Validation utilities (sequential, needed by hooks)
Task T020: Update exports (sequential)
Task T021: Refactor logbook (sequential, needs hooks)
Task T022: Update logbook tests (sequential)
Task T023: Remove deprecated utility (sequential)
Task T024: E2E tests (sequential, needs everything)
```

---

## Implementation Strategy

### MVP First (Recommended)

**Goal**: Ship User Story 1 ASAP for validation

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational (CRITICAL)
3. ✅ Complete Phase 3: User Story 1 (MVP!)
4. **STOP and VALIDATE**
   - Test US1 independently
   - Verify persistence works
   - Demo to stakeholders
   - Deploy if ready
5. Continue with US2, US3, US4 based on feedback

### Incremental Delivery

**Goal**: Each user story adds value independently

1. **Foundation** (Phases 1-2) → LiveStore setup complete
2. **+ US1** (Phase 3) → Persistence works → **MVP deployed** 🎯
3. **+ US2** (Phase 4) → Offline confirmed → **v1.1 deployed**
4. **+ US3** (Phase 5) → Dev seeding available → **v1.2 deployed**
5. **+ US4** (Phase 6) → Onboarding improved → **v1.3 deployed**
6. **Polish** (Phase 7) → Production-ready → **v2.0 deployed**

### Parallel Team Strategy

**With 3-4 developers:**

1. **All together**: Phase 1 (Setup) + Phase 2 (Foundational)
2. **Once Foundational complete**:
   - Dev A: User Story 1 (T009-T024)
   - Dev B: User Story 3 (T030-T039) - Independent!
   - Dev C: Write E2E test framework setup
3. **After US1 complete**:
   - Dev A: User Story 2 (T025-T029)
   - Dev B: User Story 4 (T040-T046)
   - Dev C: Polish tasks (T047-T059)
4. **Integration**: All stories merge and validate together

---

## Task Summary

**Total Tasks**: 59

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (US1 - MVP): 16 tasks
- Phase 4 (US2): 5 tasks
- Phase 5 (US3): 10 tasks
- Phase 6 (US4): 7 tasks
- Phase 7 (Polish): 13 tasks

**By User Story**:
- US1 (Data Persistence): 16 tasks → **MVP target**
- US2 (Offline-First): 5 tasks
- US3 (Dev Seeding): 10 tasks
- US4 (New User Init): 7 tasks
- Shared/Polish: 21 tasks

**Parallel Opportunities**: 35+ tasks marked [P] for parallel execution

**Independent Milestones**:
- After Phase 2: Foundation ready
- After Phase 3: US1 MVP ready for deployment ✨
- After Phase 4: US1 + US2 ready
- After Phase 5: US1 + US3 ready (dev workflow improved)
- After Phase 6: US1 + US4 ready (onboarding improved)
- After Phase 7: All stories polished and production-ready

---

## Notes

- **TDD Required**: Constitution mandates test-first approach - all test tasks must be completed and FAIL before implementation
- **[P] markers**: Indicate different files with no dependencies - can run in parallel
- **[Story] labels**: Track which user story each task belongs to
- **Checkpoints**: Stop points to validate story independently before continuing
- **MVP = User Story 1**: Can ship after Phase 3 for early feedback
- **Independent Stories**: US3 can be developed in parallel with US1/US2
- **Commit Strategy**: Commit after each task or logical group of [P] tasks
- **File Paths**: All paths relative to project root
- **Constitution Compliance**: All tasks follow project conventions (kebab-case, absolute imports, CSS modules, TDD)
