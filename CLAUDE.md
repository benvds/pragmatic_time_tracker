# Claude Code Context - Pragmatic Time Tracker

## Project Overview
React-based single-page time tracking application for freelance developers. Built with TypeScript, Vite, and localStorage for data persistence.

## Tech Stack
- **Frontend**: React 19.1.1, TypeScript 5.9.2
- **Build**: Vite 7.1.4 with ES2022 target
- **Testing**: Vitest 3.2.4, Testing Library, Happy DOM, Playwright (E2E)
- **Styling**: CSS modules, modern CSS features
- **Storage**: Browser localStorage (no backend)
- **Architecture**: Bulletproof-React feature modules

## Current Architecture
```
src/
├── components/     # Reusable UI components
├── features/       # Feature-specific modules
├── lib/           # Utility libraries
└── App.tsx        # Root component
```

## Development Commands
```zsh
pnpm run dev         # Start dev server (port 5173)
pnpm run build       # Production build
pnpm run test        # Run tests
pnpm run test:ui     # Interactive test UI
pnpm run lint        # Format + lint code
pnpm run typecheck   # TypeScript validation
```

## Active Features

### Time Tracking (001-time-registration)
**Status**: Ready for implementation
**Location**: `src/features/entry/` (extends existing feature)

**Core Requirements**:
- Extend existing EntryForm with date field and persistence
- Build upon existing description/project/hh:mm form structure
- Use existing src/lib/form system (useForm, Field<T>, parsers)
- localStorage persistence for single-user data
- No backend/API integration needed

**Data Model** (extends existing entry structure):
```typescript
interface TimeEntry {
  id: string;           // UUID
  date: string;         // YYYY-MM-DD (NEW field)
  description: string;  // Existing (required, min 3 chars)
  project: string;      // Existing (required, min 2 chars)
  duration: number;     // Existing (hh * 60 + mm)
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}

// Form data (matches existing + new date field)
interface TimeEntryFormData {
  date: string;         // NEW
  description: string;  // EXISTING
  project: string;      // EXISTING
  hh: number;          // EXISTING (0-24)
  mm: number;          // EXISTING (0-59)
}
```

## Testing Strategy
- **TDD Required**: Write failing tests before implementation (RED-GREEN-Refactor)
- **Test Types**: Contract → Integration → E2E → Unit (constitutional order)
- **E2E Testing**: Playwright for cross-browser user workflows
- **Real Dependencies**: Use actual localStorage, no mocks for integration
- **Feature-Scoped**: Tests within src/features/entry boundaries
- **Coverage**: Focus on user workflows and business logic

## Code Patterns
- **Components**: Controlled React components with TypeScript
- **State**: useState for simple forms, custom hooks for complex logic
- **Validation**: Real-time client-side validation with immediate feedback
- **Storage**: Direct localStorage API with JSON serialization
- **Error Handling**: User-friendly messages, graceful degradation

## Recent Changes (2025-09-14)
- **UPDATED**: Plan revised to extend existing src/features/entry instead of new feature
- **ARCHITECTURE**: Bulletproof-react patterns adopted, respects feature boundaries
- **FORM SYSTEM**: Will extend existing src/lib/form (useForm, Field<T>, parsers)
- **DATA MODEL**: Updated to match existing entry structure (description/project/hh/mm + date)
- **TESTING**: Added Playwright E2E testing to complement Vitest unit/integration
- **READY**: Implementation plan complete, 27 tasks estimated for /tasks command (simplified)

---
*Auto-generated context for Claude Code AI assistant*
