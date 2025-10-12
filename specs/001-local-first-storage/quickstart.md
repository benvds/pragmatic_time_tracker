# Quickstart Guide: Local-First Storage System

**Feature**: Local-First Storage System  
**Date**: 2025-10-12  
**Audience**: Developers implementing or maintaining the storage feature

## Overview

This guide provides step-by-step instructions for working with the local-first storage system built on LiveStore. It covers common development tasks from initial setup to debugging.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Basic understanding of React hooks
- Familiarity with TypeScript
- Understanding of event-sourced architectures (helpful but not required)

## Installation

### 1. Install Dependencies

```bash
pnpm add @livestore/livestore \
  @livestore/wa-sqlite@1.0.5-dev.2 \
  @livestore/adapter-web \
  @livestore/react \
  @livestore/peer-deps \
  @livestore/sync-cf \
  @livestore/devtools-vite
```

**Note**: Specific `wa-sqlite` version (1.0.5-dev.2) is required.

### 2. Verify Installation

```bash
pnpm check  # Type check
pnpm test   # Run tests
```

## Architecture Quick Reference

```
Events (what happened) 
  ↓
Materializers (how to update state)
  ↓
Tables (current state)
  ↓
Queries (read state)
  ↓
React Components (display data)
```

**Key Concept**: All data changes flow through events. You never directly modify tables.

## Common Tasks

### Task 1: Query Entries

**Goal**: Display all active time entries

```typescript
// In any React component
import { useStore } from '@livestore/react'
import { queryDb } from '@livestore/livestore'
import { tables } from '@/features/storage/schema'

function EntriesList() {
  const { store } = useStore()
  
  // Define query
  const query$ = queryDb(
    tables.entries
      .where({ deletedAt: null })  // Only active entries
      .orderBy('date', 'desc')      // Newest first
  )
  
  // Execute query (reactive - auto-updates on data changes)
  const entries = store.useQuery(query$)
  
  return (
    <ul>
      {entries.map(entry => (
        <li key={entry.id}>
          {entry.description} - {entry.minutes} min
        </li>
      ))}
    </ul>
  )
}
```

**Key Points**:
- Always filter `deletedAt: null` for active entries
- `store.useQuery()` automatically re-renders on data changes
- Queries are type-safe (TypeScript infers return type)

### Task 2: Create an Entry

**Goal**: Add a new time tracking entry

```typescript
import { useStore } from '@livestore/react'
import { events } from '@/features/storage/schema'

function CreateEntryForm() {
  const { store } = useStore()
  
  const handleSubmit = async (data: { description: string, minutes: number }) => {
    try {
      await store.commit(
        events.entryCreated({
          id: crypto.randomUUID(),
          date: new Date(),
          minutes: data.minutes,
          description: data.description,
        })
      )
      console.log('Entry created successfully')
    } catch (error) {
      console.error('Failed to create entry:', error)
      // Handle error (show user feedback)
    }
  }
  
  // ... form UI
}
```

**Key Points**:
- Generate unique ID with `crypto.randomUUID()`
- Wrap in try-catch for error handling
- `store.commit()` is async
- Queries automatically update (reactive)

### Task 3: Update an Entry

**Goal**: Modify an existing entry

```typescript
const handleUpdate = async (entryId: string, updates: { 
  minutes?: number, 
  description?: string 
}) => {
  try {
    await store.commit(
      events.entryUpdated({
        id: entryId,
        ...updates,  // Only include fields to update
      })
    )
  } catch (error) {
    console.error('Failed to update entry:', error)
  }
}

// Example usage
handleUpdate('some-uuid', { minutes: 150 })
```

**Key Points**:
- Only include fields you want to update
- Must provide entry `id`
- Partial updates supported

### Task 4: Delete an Entry (Soft Delete)

**Goal**: Mark entry as deleted

```typescript
const handleDelete = async (entryId: string) => {
  try {
    await store.commit(
      events.entryDeleted({
        id: entryId,
        deletedAt: new Date(),
      })
    )
  } catch (error) {
    console.error('Failed to delete entry:', error)
  }
}
```

**Key Points**:
- Soft delete preserves data
- Entry still in database, just marked deleted
- Queries with `where({ deletedAt: null })` exclude it

### Task 5: Filter by Date Range

**Goal**: Show entries for specific date range

```typescript
function EntriesForWeek({ startDate, endDate }: { 
  startDate: Date, 
  endDate: Date 
}) {
  const { store } = useStore()
  
  const query$ = queryDb(
    tables.entries
      .where({ deletedAt: null })
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'desc')
  )
  
  // React to prop changes
  const entries = store.useQuery(query$, { 
    deps: [startDate, endDate] 
  })
  
  return <EntriesList entries={entries} />
}
```

**Key Points**:
- Chain `.where()` calls for multiple filters
- Use `deps` array when query depends on external state
- Supports operators: `==`, `!=`, `<`, `>`, `<=`, `>=`, `like`

### Task 6: Search Entries

**Goal**: Find entries matching search term

```typescript
function SearchableEntries({ searchTerm }: { searchTerm: string }) {
  const { store } = useStore()
  
  const query$ = queryDb(
    tables.entries
      .where({ deletedAt: null })
      .where('description', 'like', `%${searchTerm}%`)
      .orderBy('date', 'desc')
  )
  
  const entries = store.useQuery(query$, { deps: [searchTerm] })
  
  return <EntriesList entries={entries} />
}
```

**Key Points**:
- Use `like` operator for pattern matching
- `%` is wildcard (SQL LIKE syntax)
- Always include `deps` when query uses external variables

### Task 7: Seed Development Data

**Goal**: Populate database with sample data

```typescript
// src/features/storage/lib/seed.ts
import { Store } from '@livestore/livestore'
import { queryDb } from '@livestore/livestore'
import { tables, events } from '../schema'
import { developmentSeedData } from './seed-data'

export async function seedDevelopmentData(store: Store) {
  // Check if already seeded
  const existing = await store.query(
    queryDb(tables.entries.limit(1))
  )
  
  if (existing.length === 0) {
    console.log('Seeding development data...')
    await store.commit(...developmentSeedData)
    console.log('✅ Development data seeded')
  } else {
    console.log('ℹ️ Data already exists, skipping seed')
  }
}

// Usage in App.tsx or main.tsx
import { useStore } from '@livestore/react'
import { seedDevelopmentData } from '@/features/storage/lib/seed'

function App() {
  const { store } = useStore()
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    seedDevelopmentData(store).then(() => setIsReady(true))
  }, [store])
  
  if (!isReady) return <div>Loading...</div>
  
  return <YourApp />
}
```

**Key Points**:
- Check for existing data before seeding
- Use `store.query()` for non-reactive queries
- Seed data is just an array of events

### Task 8: Clear All Data (Testing)

**Goal**: Reset database for tests

```typescript
// src/features/storage/lib/seed.ts
export async function clearAllData(store: Store) {
  const allEntries = await store.query(
    queryDb(tables.entries.where({ deletedAt: null }))
  )
  
  if (allEntries.length > 0) {
    await store.commit(
      ...allEntries.map(entry => 
        events.entryDeleted({
          id: entry.id,
          deletedAt: new Date(),
        })
      )
    )
  }
}
```

**Key Points**:
- Soft deletes all entries
- Useful for test setup/teardown
- Can also clear OPFS directly (browser dev tools)

## Testing Patterns

### Unit Test with Mocked Data

```typescript
// logbook.test.tsx
import { render, screen } from '@testing-library/react'
import { Logbook } from './logbook'

// Mock useStore hook
vi.mock('@livestore/react', () => ({
  useStore: () => ({
    store: {
      useQuery: () => [
        { 
          id: '1', 
          date: new Date('2025-10-12'), 
          minutes: 60, 
          description: 'Test entry' 
        }
      ]
    }
  })
}))

test('renders entries', () => {
  render(<Logbook />)
  expect(screen.getByText('Test entry')).toBeInTheDocument()
})
```

### Integration Test with Real Store

```typescript
// storage.test.tsx
import { renderWithStore } from '@/test/utils'
import { events } from './schema'

test('creates and queries entry', async () => {
  const { store, waitFor } = renderWithStore(<EntriesList />)
  
  // Create entry
  await store.commit(
    events.entryCreated({
      id: 'test-1',
      date: new Date(),
      minutes: 60,
      description: 'Integration test entry',
    })
  )
  
  // Verify it appears
  await waitFor(() => {
    expect(screen.getByText('Integration test entry')).toBeInTheDocument()
  })
})
```

### E2E Test (Persistence Verification)

```typescript
// tests/e2e/storage-persistence.spec.ts
import { test, expect } from '@playwright/test'

test('persists data across page reloads', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Create entry
  await page.fill('[data-testid="description"]', 'E2E Test Entry')
  await page.fill('[data-testid="minutes"]', '90')
  await page.click('[data-testid="create-button"]')
  
  // Verify entry appears
  await expect(page.locator('text=E2E Test Entry')).toBeVisible()
  
  // Reload page
  await page.reload()
  
  // Verify entry still exists
  await expect(page.locator('text=E2E Test Entry')).toBeVisible()
})
```

## Debugging

### Inspect Database Contents

**Browser DevTools Method**:
1. Open DevTools → Application tab
2. Navigate to Storage → Origin Private File System
3. See stored LiveStore database files

**Query Method** (in component):
```typescript
const { store } = useStore()

useEffect(() => {
  // Debug: Log all entries
  store.query(queryDb(tables.entries)).then(entries => {
    console.log('All entries:', entries)
  })
}, [store])
```

### Common Issues

**Issue**: Queries return empty array

**Possible Causes**:
1. Data not seeded yet
2. Filtering out all entries (`where({ deletedAt: null })` excludes deleted)
3. LiveStoreProvider not wrapping component

**Solution**:
```typescript
// Check if data exists
const allEntries = await store.query(queryDb(tables.entries))
console.log('Total entries (including deleted):', allEntries.length)
```

**Issue**: Changes not reflecting in UI

**Possible Causes**:
1. Query missing `deps` array
2. Not using `store.useQuery()` (using `store.query()` instead)
3. Component not inside LiveStoreProvider

**Solution**:
- Use `store.useQuery()` for reactive queries
- Add `deps` array if query depends on external state
- Verify provider wraps component tree

**Issue**: Worker import errors

**Cause**: Incorrect worker import syntax

**Solution**:
```typescript
// ✅ Correct
import LiveStoreWorker from './livestore.worker?worker'

// ❌ Wrong
import LiveStoreWorker from './livestore.worker'
```

### Performance Profiling

```typescript
// Measure query performance
const start = performance.now()
const entries = await store.query(queryDb(tables.entries))
console.log(`Query took ${performance.now() - start}ms`)

// Check entry count
console.log(`Total entries: ${entries.length}`)
```

**Expected Performance**:
- Query: <10ms for 10k entries
- Commit: <100ms

## Best Practices

### DO ✅

- Always filter `deletedAt: null` for active entries
- Use `crypto.randomUUID()` for entry IDs
- Wrap `store.commit()` in try-catch
- Include `deps` array when queries use external state
- Test with realistic data volumes (1000+ entries)
- Use soft deletes for audit trail

### DON'T ❌

- Don't directly modify table data
- Don't use `store.query()` for reactive queries (use `store.useQuery()`)
- Don't forget to check for existing data before seeding
- Don't hardcode entry IDs (generate UUIDs)
- Don't forget error handling on commits
- Don't use hard deletes (use soft deletes instead)

## Quick Reference: API Cheatsheet

### Hooks

```typescript
const { store } = useStore()                    // Get store instance
const data = store.useQuery(query$)             // Reactive query
const data = store.useQuery(query$, { deps })   // Reactive query with deps
```

### Store Methods

```typescript
await store.commit(event)                       // Commit single event
await store.commit(event1, event2, ...)        // Commit multiple events
const data = await store.query(query$)          // One-time query (non-reactive)
```

### Query Builder

```typescript
tables.entries                                  // Start query
  .select('id', 'description')                 // Select columns
  .where({ deletedAt: null })                  // Exact match
  .where('minutes', '>', 60)                   // Comparison
  .where('description', 'like', '%search%')    // Pattern match
  .orderBy('date', 'desc')                     // Sort
  .limit(10)                                   // Limit results
  .offset(5)                                   // Skip results
```

### Events

```typescript
events.entryCreated({ id, date, minutes, description })
events.entryUpdated({ id, date?, minutes?, description? })
events.entryDeleted({ id, deletedAt })
```

## Next Steps

1. **Read**: [data-model.md](./data-model.md) for detailed schema documentation
2. **Read**: [research.md](./research.md) for architecture details
3. **Explore**: LiveStore docs at https://docs.livestore.dev/
4. **Practice**: Try the tasks above in a test component
5. **Implement**: Follow tasks.md for full feature implementation

## Troubleshooting

**Need Help?**
1. Check [research.md](./research.md) for LiveStore patterns
2. Review [data-model.md](./data-model.md) for schema details
3. See LiveStore docs: https://docs.livestore.dev/
4. Check browser console for errors
5. Verify LiveStoreProvider is present

**Common Gotchas**:
- Worker imports require `?worker` suffix
- Dates stored as integers (milliseconds)
- Queries with external deps need `deps` array
- Android browsers not supported
- OPFS storage only (no IndexedDB)

## Appendix: Complete Minimal Example

```typescript
// Complete working example
import { LiveStoreProvider, useStore } from '@livestore/react'
import { makePersistedAdapter } from '@livestore/adapter-web'
import { queryDb } from '@livestore/livestore'
import { unstable_batchedUpdates } from 'react-dom'
import LiveStoreWorker from './livestore.worker?worker'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { tables, events } from './schema'

// Setup
const adapter = makePersistedAdapter({
  storage: { type: 'opfs' },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
})

// App Component
function App() {
  return (
    <LiveStoreProvider adapter={adapter} batchUpdates={unstable_batchedUpdates}>
      <EntriesDemo />
    </LiveStoreProvider>
  )
}

// Usage Component
function EntriesDemo() {
  const { store } = useStore()
  
  // Query entries
  const entries = store.useQuery(
    queryDb(tables.entries.where({ deletedAt: null }))
  )
  
  // Create entry
  const handleCreate = () => {
    store.commit(
      events.entryCreated({
        id: crypto.randomUUID(),
        date: new Date(),
        minutes: 60,
        description: 'New entry',
      })
    )
  }
  
  return (
    <div>
      <button onClick={handleCreate}>Create Entry</button>
      <ul>
        {entries.map(e => <li key={e.id}>{e.description}</li>)}
      </ul>
    </div>
  )
}
```

**That's it!** You now have a working local-first storage system. 🎉
