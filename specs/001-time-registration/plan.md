# Implementation Plan: Daily Time Tracking for Freelance Developer

**Branch**: `001-time-registration` | **Date**: 2025-09-14 | **Spec**: [specs/001-time-registration/spec.md](../001-time-registration/spec.md)
**Input**: Feature specification from `/specs/001-time-registration/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: Enable freelance developers to track daily work hours and minutes with optional descriptions. System must validate time entries (max 24hrs/day, require description for <7hrs) and persist entries for future retrieval. Technical approach: React frontend with local storage for single-user daily time tracking.

## Technical Context  
**Language/Version**: TypeScript 5.9.2 with React 19.1.1  
**Primary Dependencies**: React, React DOM, Vite (build), Vitest (testing), Playwright (E2E)  
**Storage**: Local storage (browser-based persistence for single user)  
**Testing**: Vitest + Testing Library (unit/integration), Playwright (E2E)  
**Target Platform**: Modern browsers (ES2022 support)  
**Project Type**: Single-page web application following bulletproof-react patterns  
**Architecture**: Feature-based modules with existing form system (src/lib/form)  
**Existing Assets**: src/features/entry form with description/project/hh:mm fields  
**Performance Goals**: <100ms response time for form interactions, instant local data persistence  
**Constraints**: Client-side only (no backend), data stored locally in browser  
**Scale/Scope**: Single user, ~365 time entries per year maximum  
**Technical Context Update**: Build upon existing src/lib/form and extend src/features/entry

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (single React app - within limit of 3)
- Using framework directly? YES (direct React components, no wrapper classes)
- Single data model? YES (TimeEntry entity only)
- Avoiding patterns? YES (no Repository pattern - direct localStorage usage)

**Architecture**:
- EVERY feature as library? DEVIATION: Frontend-only app using bulletproof-react feature modules
- Libraries listed: src/lib/form (existing), time-tracking (extends entry feature), local-storage (persistence)
- CLI per library: N/A (browser-based app)
- Library docs: llms.txt format planned? NO (frontend components, not CLI libraries)

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES (will write failing tests first)
- Git commits show tests before implementation? YES (will enforce)
- Order: Contract→Integration→E2E→Unit strictly followed? YES
- Real dependencies used? YES (actual localStorage, not mocks for integration tests)
- Integration tests for: component integration with localStorage, form validation, existing entry form extension
- E2E tests: Playwright for complete user workflows
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? NO (client-side app, browser dev tools sufficient)
- Frontend logs → backend? N/A (no backend)
- Error context sufficient? YES (form validation errors, localStorage failure handling)

**Versioning**:
- Version number assigned? YES (0.1.0 from package.json, will increment BUILD on changes)
- BUILD increments on every change? YES (will follow)
- Breaking changes handled? YES (localStorage schema migration if needed)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (bulletproof-react architecture)
```
# Existing structure (bulletproof-react pattern)
src/
├── app/                    # Application layer
├── assets/                 # Static files
├── components/             # Shared components (existing button, etc.)
├── features/               # Feature-based modules
│   └── entry/              # Existing entry feature (to be extended)
│       ├── components/     # Feature components
│       ├── form/           # Current EntryForm (extend for time tracking)
│       ├── api/            # Feature API (localStorage services)
│       ├── hooks/          # Feature hooks 
│       ├── stores/         # Feature state (if needed)
│       ├── types/          # Feature types
│       └── utils/          # Feature utilities
├── hooks/                  # Shared hooks
├── lib/                    # Shared libraries
│   ├── form/               # Existing form system (use as base)
│   └── ...                 # Other utilities
├── stores/                 # Global state management
├── types/                  # Shared TypeScript types
└── utils/                  # Shared utilities

# Test structure (matches features)
src/__tests__/              # Unit tests
e2e/                        # Playwright E2E tests
├── time-tracking/          # E2E scenarios
└── fixtures/               # Test data
```

**Structure Decision**: Extend existing bulletproof-react structure, build upon src/features/entry

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/bash/update-agent-context.sh claude` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base template structure  
- Generate tasks from Phase 1 design docs (contracts, data-model.md, quickstart.md)
- **Extend existing src/features/entry** rather than create new feature
- **Pragmatic folder creation**: Only create folders when multiple files needed
- Contract interfaces → contract test tasks [P]
- Form parsers → extend existing + NEW parseDate in src/lib/form/util.ts [P]
- localStorage operations → integrate directly in form component or custom hook if needed
- React components → extend existing EntryForm + NEW list/card components (if multiple components)
- User acceptance scenarios → E2E Playwright tests + integration tests

**Ordering Strategy (Bulletproof-React Compatible)**:
- **TDD order**: All tests written before any implementation code
- **Feature-first**: Work within src/features/entry, respect architectural boundaries
- **Dependency order**: Types → Form Parsers → API Services → Hooks → Components → E2E
- **Parallel execution**: Mark [P] for independent tasks within feature boundaries
- **Sequential phases**:
  1. Contract tests + Type definitions [P]
  2. Form parser extensions (parseDate in existing util.ts) [P]  
  3. EntryForm extensions (date field + localStorage integration)
  4. Component creation (List/Card only if warranted)
  5. Custom hooks (only if form becomes too complex)
  6. Integration tests (feature-scoped)
  7. E2E tests (Playwright - complete user workflows)

**Task Categories Planned** (simplified):
- **Setup/Dependencies**: 3 tasks (Playwright setup, types.ts file, exports)
- **Contract Tests**: 4 tasks (TimeEntry interface, form parsers)
- **Form Extensions**: 6 tasks (parseDate, date field, localStorage integration, validation)
- **Component Extensions**: 4 tasks (EntryForm updates, decide on List/Card necessity)
- **Optional Hooks**: 2 tasks (create useTimeEntries only if form complexity warrants)
- **Integration Tests**: 4 tasks (form workflows, localStorage integration, data flow)
- **E2E Tests**: 4 tasks (Playwright scenarios from quickstart user acceptance tests)

**Estimated Output**: 27 numbered, dependency-ordered tasks in tasks.md (reduced from 39)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (Architecture library requirement deviation justified)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*