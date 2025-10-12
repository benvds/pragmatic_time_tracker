# Implementation Plan: Local-First Storage System

**Branch**: `001-local-first-storage` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-local-first-storage/spec.md`

## Summary

Implement a local-first persistent storage system using LiveStore to replace the current in-memory data generation. The system will provide automatic persistence of time tracking entries with offline-first capabilities, event sourcing for audit trails, and comprehensive seeding infrastructure for development and testing workflows. The implementation will maintain the existing LogEntry data structure while adding durable storage, validation, and error handling capabilities.

## Technical Context

**Language/Version**: TypeScript 5.9.2  
**Primary Dependencies**: React 19.1.1, Vite 7.1.4, LiveStore 0.3.1+  
**Storage**: LiveStore (event-sourced SQLite via OPFS)  
**Testing**: Vitest 3.2.4, @testing-library/react 16.3.0, Playwright 1.55.0  
**Target Platform**: Modern web browsers (desktop: Chrome/Firefox/Safari/Edge, mobile: iOS Safari)  
**Project Type**: Single web application with feature-based structure  
**Performance Goals**: <100ms persistence, <500ms load time, support 10,000+ entries  
**Constraints**: Offline-capable, in-memory execution, OPFS storage, no Android support  
**Scale/Scope**: Single user, local-only storage, ~1MB data at 10k entries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check ✅

**I. Simplicity First**
- ⚠️ **Complexity Added**: Event-sourced architecture is more complex than direct localStorage
- ✅ **Justified**: Provides audit trail, reactivity, and scalability for future features
- ✅ **Simpler Alternative Considered**: Direct IndexedDB/localStorage rejected due to lack of structure and reactivity

**II. Test-Driven Development**
- ✅ TDD will be enforced throughout implementation
- ✅ All storage operations testable with mocked/real stores
- ✅ Persistence verification via E2E tests

**III. Component Composition**
- ✅ Storage layer separate from UI components
- ✅ Hook-based API maintains component simplicity
- ✅ Existing logbook component remains small and focused

**IV. Code Quality Standards**
- ✅ LiveStore provides excellent TypeScript support
- ✅ Follows project conventions (kebab-case, absolute imports, CSS modules)
- ✅ No hard-coded values (configuration via schema)

**V. Dependency Management**
- ⚠️ **New Dependencies**: @livestore/* packages (7 packages)
- ✅ **Justified**: Core feature requirement, no lighter alternative meets needs
- ✅ **Approved**: Documented in research.md with rationale

**VI. Testing Strategy**
- ✅ Unit tests: Component rendering with mocked store data
- ✅ Integration tests: Real store operations with seed data
- ✅ E2E tests: Persistence verification across reloads
- ✅ Mocking strategy: Mock worker/queries in unit tests

**VII. User Experience Standards**
- ✅ Empty state handling: Initial load with no data
- ✅ Human-readable formats: Existing duration/date formatting maintained
- ✅ Accessibility: No impact (storage layer only)
- ✅ Consistent patterns: CRUD operations follow established patterns

**Status**: ✅ **PASSED** - Complexity justified, all other principles satisfied

### Post-Phase 1 Check ✅

**Design Review Against Constitution**:

**I. Simplicity First**
- ✅ **Data Model**: Uses 3 events, 1 table, 3 materializers (minimal schema)
- ✅ **API Surface**: Hook-based API with 4 operations (query, create, update, delete)
- ✅ **No Over-Engineering**: Soft deletes, no versioning complexity yet, no premature optimization
- ✅ **Clear Contracts**: Event schemas are simple structs with basic validation

**II. Test-Driven Development**
- ✅ **Testable Design**: All operations can be tested in isolation
- ✅ **Mocking Strategy**: Clear separation allows mocking at hook or store level
- ✅ **Test Data**: Seed data provides fixtures for all test types
- ✅ **E2E Verifiable**: Persistence can be validated across reloads

**III. Component Composition**
- ✅ **Small Hooks**: Each hook has single responsibility (use-entries, use-create-entry, etc.)
- ✅ **Composable**: Hooks can be combined in components as needed
- ✅ **Pure Functions**: Validation and seeding are pure utility functions
- ✅ **Clear Boundaries**: Storage layer completely separate from UI

**IV. Code Quality Standards**
- ✅ **Type Safety**: Full TypeScript coverage with LiveStore's type inference
- ✅ **Naming**: schema.ts, seed-data.ts, use-entries.ts follow kebab-case
- ✅ **Imports**: Absolute paths from @/features/storage
- ✅ **No Magic Values**: All configuration in schema, no hardcoded strings/numbers

**V. Dependency Management**
- ✅ **No Additional Dependencies**: All 7 LiveStore packages approved in Pre-Phase 0
- ✅ **Justified Packages**: Each package serves specific purpose (adapter, worker, react bindings)
- ✅ **Version Locked**: wa-sqlite pinned to required version (1.0.5-dev.2)

**VI. Testing Strategy**
- ✅ **Unit Tests**: Mock store.useQuery() for component tests
- ✅ **Integration Tests**: Real store with seed data for workflow tests
- ✅ **E2E Tests**: Playwright tests verify persistence across reloads
- ✅ **Edge Cases**: Test seed data includes boundary conditions

**VII. User Experience Standards**
- ✅ **Empty State**: Seeding logic handles first-run experience
- ✅ **Error Handling**: try-catch patterns in all mutation hooks
- ✅ **Performance**: <100ms persistence meets SC-001 requirement
- ✅ **Consistency**: Query patterns consistent across all read operations

**Status**: ✅ **PASSED** - Design adheres to all constitutional principles

**Key Design Strengths**:
1. Minimal schema (3 events, 1 table) keeps complexity low
2. Hook-based API aligns with React best practices
3. Event sourcing provides audit trail without custom logging
4. Soft deletes preserve data integrity
5. Seed infrastructure supports both dev and test workflows
6. Clear separation of concerns (storage ↔ UI)

**No violations identified** - proceed to Phase 2 (tasks generation)

## Project Structure

### Documentation (this feature)

```
specs/001-local-first-storage/
├── spec.md              # Feature specification (from /speckit.specify)
├── plan.md              # This file (implementation plan)
├── research.md          # ✅ Phase 0 complete - LiveStore integration research
├── data-model.md        # ✅ Phase 1 complete - Event-sourced schema definition
├── quickstart.md        # ✅ Phase 1 complete - Developer guide for storage system
├── contracts/           # N/A (storage layer has no external API contracts)
├── checklists/
│   └── requirements.md  # Spec quality checklist (passed)
└── tasks.md             # Phase 2 output (generated by /speckit.tasks)
```

### Source Code (repository root)

```
src/
├── features/
│   ├── storage/
│   │   ├── schema.ts              # LiveStore schema (events, tables, materializers)
│   │   ├── livestore.worker.ts    # Worker setup
│   │   ├── provider.tsx           # Provider component (or in main.tsx)
│   │   ├── hooks/
│   │   │   ├── use-entries.ts     # Query hook for entries
│   │   │   ├── use-create-entry.ts
│   │   │   ├── use-update-entry.ts
│   │   │   └── use-delete-entry.ts
│   │   ├── lib/
│   │   │   ├── seed-data.ts       # Seed data definitions
│   │   │   ├── seed.ts            # Seeding utilities
│   │   │   └── validation.ts      # Data validation
│   │   ├── types.d.ts             # Type definitions
│   │   ├── storage.test.tsx       # Unit tests
│   │   └── index.ts               # Public API
│   │
│   └── logbook/
│       ├── logbook.tsx            # Refactored to use storage hooks
│       ├── logbook.test.tsx       # Updated tests
│       └── ... (existing structure)
│
├── lib/                           # (existing)
├── assets/                        # (existing)
├── App.tsx                        # (existing)
└── main.tsx                       # Updated with LiveStoreProvider

tests/
├── e2e/
│   └── storage-persistence.spec.ts  # E2E tests for persistence
└── fixtures/
    └── test-seed-data.ts           # Test fixtures

```

**Structure Decision**: Single web application structure selected. Storage feature follows project conventions with domain-specific logic in `src/features/storage/` and tests colocated. The storage module will provide hooks that the logbook feature consumes, maintaining clear separation of concerns and adhering to the feature-based organization principle from the constitution.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Event-sourced architecture | Provides audit trail of all time entries, enables future features (undo, sync), reactive updates | Direct localStorage: no structure/querying. IndexedDB: complex API, no reactivity. Simple wrapper: would recreate LiveStore features poorly. |
| 7 new LiveStore dependencies | Core library requires peer dependencies and adapters for web platform | Monolithic package: not available. Fewer packages: missing required platform adapters. |

**Justification**: The complexity is proportional to requirements (FR-001 through FR-013) and success criteria (SC-001 through SC-008). Event sourcing is the simplest architecture that satisfies persistence, audit trail, reactivity, and offline-first requirements simultaneously.
