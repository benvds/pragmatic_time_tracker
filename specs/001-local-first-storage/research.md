# Research: Local-First Storage with LiveStore

**Feature**: Local-First Storage System  
**Date**: 2025-10-12  
**Status**: Complete

## Overview

This document consolidates research findings for integrating LiveStore into the pragmatic time tracker application to provide local-first persistent storage with event sourcing capabilities.

## Technology Selection

### Decision: LiveStore (@livestore/livestore)

**Rationale**:
- Local-first architecture with offline-first support
- Event-sourced design provides audit trail for time entries
- Built on reactive SQLite with sub-millisecond query performance
- Excellent TypeScript support with full type inference
- React 19 compatible (v0.3.1+)
- In-memory execution for instant queries
- No backend required for local storage use case
- Optional sync capabilities for future multi-device support

**Alternatives Considered**:

1. **IndexedDB (direct)**
   - ✅ Native browser API, no dependencies
   - ❌ Complex API, requires wrapper abstractions
   - ❌ No built-in reactivity
   - ❌ No event sourcing or audit trail
   - **Rejected**: Would require significant custom infrastructure

2. **Dexie.js**
   - ✅ Mature library with good TypeScript support
   - ✅ Simpler API than raw IndexedDB
   - ✅ Observable queries
   - ❌ Not event-sourced
   - ❌ Additional abstraction layer needed for seeding
   - **Rejected**: Lacks event sourcing and audit capabilities

3. **localStorage/sessionStorage**
   - ✅ Simplest API
   - ✅ Synchronous
   - ❌ Limited storage capacity (5-10MB)
   - ❌ No querying capabilities
   - ❌ No structure or schema enforcement
   - **Rejected**: Insufficient for structured data with 10k+ entries

4. **PouchDB**
   - ✅ Mature, offline-first
   - ✅ CouchDB sync protocol
   - ⚠️ Larger bundle size
   - ❌ Document-oriented (less natural for relational data)
   - ❌ Not actively maintained
   - **Rejected**: Heavyweight solution, maintenance concerns

## LiveStore Integration Details

### Package Installation

**Primary Package**: `@livestore/livestore` (v0.3.1+)

**Required Dependencies**:
```bash
pnpm add @livestore/livestore \
  @livestore/wa-sqlite@1.0.5-dev.2 \
  @livestore/adapter-web \
  @livestore/react \
  @livestore/peer-deps \
  @livestore/sync-cf \
  @livestore/devtools-vite
```

**Note**: Specific `wa-sqlite` version (1.0.5-dev.2) is required for proper functionality.

### Architecture Overview

LiveStore uses an **event-sourced architecture** with three core concepts:

1. **Events**: Immutable log of changes (what happened)
   - Define all possible data mutations
   - Synced or local-only events
   - Type-safe with Schema validation

2. **Tables**: SQLite tables storing derived state (current state)
   - Standard relational schema
   - Indexed for fast queries
   - In-memory for performance

3. **Materializers**: Functions mapping events to state changes (how to update)
   - Pure functions: Event → SQL operations
   - Deterministic and replayable
   - Support insert, update, delete operations

### Schema Definition Pattern

```typescript
// src/features/storage/schema.ts
import { Events, makeSchema, Schema, State } from '@livestore/livestore'

// 1. Define Events
export const events = {
  entryCreated: Events.synced({
    name: 'v1.EntryCreated',
    schema: Schema.Struct({
      id: Schema.String,
      date: Schema.DateFromNumber,
      minutes: Schema.Number,
      description: Schema.String,
    }),
  }),
  entryUpdated: Events.synced({
    name: 'v1.EntryUpdated',
    schema: Schema.Struct({
      id: Schema.String,
      date: Schema.DateFromNumber.pipe(Schema.optional),
      minutes: Schema.Number.pipe(Schema.optional),
      description: Schema.String.pipe(Schema.optional),
    }),
  }),
  entryDeleted: Events.synced({
    name: 'v1.EntryDeleted',
    schema: Schema.Struct({
      id: Schema.String,
      deletedAt: Schema.DateFromNumber,
    }),
  }),
}

// 2. Define Tables
export const tables = {
  entries: State.SQLite.table({
    name: 'entries',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      date: State.SQLite.integer({ 
        schema: Schema.DateFromNumber 
      }),
      minutes: State.SQLite.integer(),
      description: State.SQLite.text(),
      deletedAt: State.SQLite.integer({ 
        nullable: true,
        schema: Schema.DateFromNumber 
      }),
    },
  }),
}

// 3. Define Materializers
const materializers = State.SQLite.materializers(events, {
  'v1.EntryCreated': ({ id, date, minutes, description }) =>
    tables.entries.insert({ id, date, minutes, description }),
  'v1.EntryUpdated': ({ id, date, minutes, description }) =>
    tables.entries.update({
      ...(date && { date }),
      ...(minutes && { minutes }),
      ...(description && { description }),
    }).where({ id }),
  'v1.EntryDeleted': ({ id, deletedAt }) =>
    tables.entries.update({ deletedAt }).where({ id }),
})

// 4. Export Schema
const state = State.SQLite.makeState({ tables, materializers })
export const schema = makeSchema({ events, state })
```

### Worker Setup Pattern

```typescript
// src/features/storage/livestore.worker.ts
import { makeWorker } from '@livestore/adapter-web/worker'
import { schema } from './schema.js'

makeWorker({
  schema,
  // Sync config omitted for local-only storage
})
```

**Critical**: Import workers with `?worker` extension in Vite:
```typescript
import LiveStoreWorker from './livestore.worker?worker'
```

### Provider Setup

```typescript
// src/main.tsx
import { LiveStoreProvider } from '@livestore/react'
import { makePersistedAdapter } from '@livestore/adapter-web'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import LiveStoreWorker from './features/storage/livestore.worker?worker'
import { unstable_batchedUpdates as batchUpdates } from 'react-dom'

const adapter = makePersistedAdapter({
  storage: { type: 'opfs' }, // Origin Private File System
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
})

function App() {
  return (
    <LiveStoreProvider adapter={adapter} batchUpdates={batchUpdates}>
      <YourApp />
    </LiveStoreProvider>
  )
}
```

### CRUD Operations

#### Reading Data

```typescript
import { useStore } from '@livestore/react'
import { queryDb } from '@livestore/livestore'
import { tables } from '@/features/storage/schema'

function EntriesList() {
  const { store } = useStore()
  
  const query$ = queryDb(
    tables.entries
      .where({ deletedAt: null })
      .orderBy('date', 'desc')
  )
  
  const entries = store.useQuery(query$)
  
  return <div>{entries.map(entry => ...)}</div>
}
```

**Query Features**:
- `.select()` - Choose columns
- `.where()` - Filter with operators (==, !=, <, >, <=, >=, like)
- `.orderBy()` - Sort results
- `.limit()` / `.offset()` - Pagination
- `.count()` - Aggregation

**Reactive Queries**:
```typescript
const entries = store.useQuery(query$, { deps: [searchTerm] })
```

#### Creating Data

```typescript
import { useStore } from '@livestore/react'
import { events } from '@/features/storage/schema'

function CreateEntry() {
  const { store } = useStore()
  
  const handleCreate = async () => {
    await store.commit(
      events.entryCreated({
        id: crypto.randomUUID(),
        date: new Date(),
        minutes: 60,
        description: 'Development work',
      })
    )
  }
  
  return <button onClick={handleCreate}>Create</button>
}
```

#### Updating Data

```typescript
await store.commit(
  events.entryUpdated({
    id: existingId,
    minutes: 90,
    description: 'Updated description',
  })
)
```

#### Deleting Data (Soft Delete)

```typescript
await store.commit(
  events.entryDeleted({
    id: existingId,
    deletedAt: new Date(),
  })
)
```

### Data Seeding Strategy

LiveStore uses event-based seeding rather than SQL seed files:

```typescript
// src/features/storage/lib/seed-data.ts
import { events } from '../schema'

export const developmentSeedData = [
  events.entryCreated({
    id: '1',
    date: new Date('2025-10-10T09:00:00'),
    minutes: 120,
    description: 'Morning development session',
  }),
  events.entryCreated({
    id: '2',
    date: new Date('2025-10-10T13:00:00'),
    minutes: 180,
    description: 'Afternoon feature work',
  }),
  // ... more seed entries
]

export const testSeedData = [
  // Edge cases
  events.entryCreated({
    id: 'edge-1',
    date: new Date('2025-01-01T00:00:00'),
    minutes: 1,
    description: '',
  }),
  events.entryCreated({
    id: 'edge-2',
    date: new Date('2025-12-31T23:59:59'),
    minutes: 1440, // Full day
    description: 'Very long description...'.repeat(100),
  }),
]
```

**Seeding Implementation**:

```typescript
// src/features/storage/lib/seed.ts
import { Store } from '@livestore/livestore'
import { developmentSeedData, testSeedData } from './seed-data'

export async function seedDevelopmentData(store: Store) {
  const existing = await store.query(
    queryDb(tables.entries.limit(1))
  )
  
  if (existing.length === 0) {
    await store.commit(...developmentSeedData)
  }
}

export async function seedTestData(store: Store) {
  // Clear existing data first
  const allEntries = await store.query(
    queryDb(tables.entries.where({ deletedAt: null }))
  )
  
  await store.commit(
    ...allEntries.map(e => 
      events.entryDeleted({ id: e.id, deletedAt: new Date() })
    )
  )
  
  await store.commit(...testSeedData)
}
```

### Performance Characteristics

**Strengths**:
- ⚡ Sub-millisecond queries (in-memory SQLite)
- ⚡ Synchronous reads (no loading states for local data)
- ⚡ 120 FPS capable (real-time UI updates)
- ⚡ Automatic reactivity (components re-render on data changes)

**Memory Considerations**:
- 📦 Entire database runs in-memory
- 📦 Each browser tab uses separate memory
- 💾 OPFS provides persistent storage

**Scale Estimates**:
- 10,000 entries × ~100 bytes/entry = ~1MB in memory
- Well within performance targets for success criteria

### Limitations and Constraints

**Platform Constraints**:
- ❌ Android browsers not supported (no SharedWorker API)
- ⚠️ OPFS only (no IndexedDB fallback currently)
- ✅ Modern desktop browsers fully supported
- ✅ iOS/Safari supported

**Development Stage**:
- ⚠️ Beta status (v0.3.1) - Breaking changes possible
- ⚠️ Pre-1.0 semver (minor versions may break)
- ⚠️ New projects only (no migration tooling yet)
- ⚠️ Storage format may change with updates

**Usage Patterns**:
- ✅ Best for apps where data fits in memory
- ✅ Ideal for offline-first applications
- ⚠️ Not suitable for large datasets (>100MB)
- ⚠️ Not suitable for apps requiring Android support

### Known Gotchas

1. **Worker Import Syntax**: Must use `?worker` for Vite
2. **Development Mode**: May need polyfill during dev
3. **Event Versioning**: Use `v1.EventName` pattern for future migrations
4. **Soft Deletes**: Recommended over hard deletes for audit trail
5. **Date Handling**: Use `Schema.DateFromNumber` for SQLite integer storage
6. **Null Handling**: TypeScript strictly enforces nullable columns

### Integration Best Practices

**For Time Tracking Application**:

1. **Schema Design**:
   - Use soft deletes (`deletedAt` column)
   - Store dates as integers (SQLite native)
   - Index frequently queried columns
   - Version event names for future migrations

2. **Query Patterns**:
   - Always filter out deleted entries: `.where({ deletedAt: null })`
   - Use `orderBy` for chronological display
   - Leverage reactive queries for real-time updates

3. **Seeding Strategy**:
   - Check for existing data before seeding
   - Provide separate dev and test seed sets
   - Store seed data in version control
   - Use deterministic IDs for test data

4. **Testing**:
   - Reset storage between test runs
   - Mock worker in unit tests
   - Test storage quota exceeded scenarios
   - Verify persistence across page reloads

5. **Error Handling**:
   - Wrap `store.commit()` in try-catch
   - Handle storage quota errors gracefully
   - Validate data before committing events
   - Provide user feedback on storage errors

## Implementation Recommendations

### Phase 1: Core Storage Setup
1. Install LiveStore packages
2. Create schema with basic CRUD events
3. Setup worker and provider
4. Verify data persists across reloads

### Phase 2: Logbook Integration
1. Refactor logbook to use LiveStore queries
2. Replace in-memory data generation
3. Add create/update/delete functionality
4. Test with real user workflows

### Phase 3: Seeding Infrastructure
1. Create seed data files
2. Implement seeding utilities
3. Add development seed initialization
4. Add test seed infrastructure

### Phase 4: Edge Cases & Polish
1. Handle storage quota exceeded
2. Implement error recovery
3. Add data validation
4. Performance testing with 10k entries

## Compliance with Constitution

**Dependency Management**: LiveStore introduces new dependencies but:
- ✅ Necessary for local-first storage requirement
- ✅ Well-maintained and actively developed
- ✅ Strong TypeScript support aligns with project standards
- ✅ React 19 compatibility verified

**Simplicity First**: Event-sourced architecture adds conceptual complexity:
- ⚠️ More complex than direct localStorage
- ✅ Justified by audit trail requirements
- ✅ Provides scalability for future features
- ✅ Eliminates need for custom storage abstractions

**TDD Enforcement**: LiveStore testing strategy:
- ✅ Unit testable (mock store/queries)
- ✅ Integration testable (real store with test data)
- ✅ E2E testable (persistence verification)

## Documentation References

- **Main Site**: https://livestore.dev/
- **Documentation**: https://docs.livestore.dev/
- **React Web Guide**: https://docs.livestore.dev/getting-started/react-web/
- **Schema Definition**: https://docs.livestore.dev/reference/state/sqlite-schema/
- **SQL Queries**: https://docs.livestore.dev/reference/state/sql-queries/
- **Performance**: https://docs.livestore.dev/evaluation/performance/
- **GitHub**: https://github.com/livestorejs/livestore

## Unresolved Questions

None - All technical unknowns have been resolved through research.

## Next Steps

Proceed to Phase 1: Design & Contracts
- Generate data-model.md
- Define API contracts (if applicable)
- Create quickstart.md
- Update agent context
