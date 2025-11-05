# Storage Feature: Local-First Persistent Storage

## Overview

The storage feature provides local-first persistent storage for time tracking entries using [LiveStore](https://livestore.dev/), an event-sourced database built on SQLite and OPFS (Origin Private File System).

## Key Features

- **Persistent Storage**: All time entries automatically persist across browser sessions
- **Offline-First**: Full functionality without internet connection
- **Event Sourcing**: Complete audit trail of all data changes
- **Reactive Queries**: UI automatically updates when data changes
- **Type-Safe**: Full TypeScript support with type inference
- **Performance**: Sub-millisecond queries, <100ms persistence operations

## Quick Start

### Basic Usage

```typescript
import { useEntries, useCreateEntry } from '@/features/storage'

function MyComponent() {
  // Query all active entries
  const entries = useEntries()

  // Create new entry
  const createEntry = useCreateEntry()

  const handleCreate = () => {
    createEntry({
      date: new Date(),
      minutes: 60,
      description: 'Development work'
    })
  }

  return <div>...</div>
}
```

### Available Hooks

- `useEntries()` - Query all active time entries
- `useCreateEntry()` - Create new time entry
- `useUpdateEntry()` - Update existing time entry
- `useDeleteEntry()` - Soft delete time entry (sets deletedAt)

### Seed Data for Development

```typescript
import { seedDevelopmentData } from "@/features/storage";
import { useStore } from "@livestore/react";

// In development, seed sample data
const { store } = useStore();
await seedDevelopmentData(store);
```

## Architecture

### Event-Sourced Design

```
User Action → Event → Materializer → Table → Reactive Query → UI Update
```

**Events** (what happened):

- `v1.EntryCreated` - New entry created
- `v1.EntryUpdated` - Entry modified
- `v1.EntryDeleted` - Entry soft deleted

**Tables** (current state):

- `entries` - Current state of all time entries

**Materializers** (how to update state):

- Map each event type to table operations (insert, update, delete)

### Data Flow

1. User performs action (create, update, delete)
2. Hook commits event to store
3. Materializer applies event to table
4. Reactive query automatically re-runs
5. Component re-renders with new data

## API Reference

### Hooks

#### `useEntries()`

Returns array of all active (non-deleted) time entries, ordered by date (newest first).

```typescript
const entries = useEntries();
// entries: Array<{ id: string, date: Date, minutes: number, description: string, deletedAt: Date | null }>
```

#### `useCreateEntry()`

Returns function to create new time entry.

```typescript
const createEntry = useCreateEntry();

createEntry({
    date: new Date(),
    minutes: 120,
    description: "Feature development",
});
```

#### `useUpdateEntry()`

Returns function to update existing entry (partial updates supported).

```typescript
const updateEntry = useUpdateEntry();

updateEntry("entry-id", {
    minutes: 150,
    description: "Updated description",
});
```

#### `useDeleteEntry()`

Returns function to soft delete entry (sets deletedAt timestamp).

```typescript
const deleteEntry = useDeleteEntry();

deleteEntry("entry-id");
```

### Utilities

#### Validation

```typescript
import {
    validateEntry,
    validateId,
    validateDate,
    validateMinutes,
    validateDescription,
} from "@/features/storage";

// Validate complete entry
validateEntry({ date: new Date(), minutes: 60, description: "Work" });

// Validate individual fields
validateId("550e8400-e29b-41d4-a716-446655440000");
validateDate(new Date());
validateMinutes(60);
validateDescription("Valid description");
```

#### Storage Quota

```typescript
import { checkStorageQuota } from "@/features/storage";

const { used, total, percentUsed, warning } = await checkStorageQuota();

if (warning) {
    console.warn(warning); // "Storage is 85% full..."
}
```

#### Seed Data

```typescript
import {
    seedDevelopmentData,
    seedTestData,
    seedOnboardingData,
    clearAllData,
} from "@/features/storage";

// Seed development data (skips if data exists)
seedDevelopmentData(store);

// Seed test data (clears existing first)
seedTestData(store);

// Seed onboarding data for new users
seedOnboardingData(store);

// Clear all data
clearAllData(store);
```

## Data Model

### LogEntry Type

```typescript
type LogEntry = {
    id: string; // UUID v4
    date: Date; // Entry date
    minutes: number; // Duration in minutes (positive integer)
    description: string; // Work description (max 10,000 chars)
    deletedAt: Date | null; // Deletion timestamp (null for active entries)
};
```

### Validation Rules

- **id**: Valid UUID v4 format
- **date**: Valid date, not in future
- **minutes**: Positive integer, minimum 1
- **description**: String, maximum 10,000 characters (can be empty)

## Performance

### Benchmarks

- **Query Time**: <10ms for 10k entries (indexed)
- **Commit Time**: <100ms per operation
- **Load Time**: <500ms for full dataset
- **Memory**: ~1MB for 10,000 entries

### Optimization

- Date column indexed for chronological queries
- deletedAt column indexed for filtering active entries
- In-memory SQLite for sub-millisecond subsequent queries
- Reactive queries only re-run when data changes

## Testing

### Unit Tests

```bash
pnpm test src/features/storage/
```

### Integration Tests

```bash
pnpm test src/features/storage/storage.integration.test.tsx
```

### E2E Tests

```bash
pnpm test:e2e tests/e2e/storage-persistence.spec.ts
pnpm test:e2e tests/e2e/offline-operations.spec.ts
pnpm test:e2e tests/e2e/performance.spec.ts
```

## Error Handling

### QuotaExceededError

```typescript
const createEntry = useCreateEntry();

try {
    createEntry({ date: new Date(), minutes: 60, description: "Work" });
} catch (error) {
    if (error.name === "QuotaExceededError") {
        // Show user-friendly message about clearing old data
        console.error("Storage quota exceeded:", error.message);
    }
}
```

### ValidationError

```typescript
import { ValidationError } from "@/features/storage";

try {
    validateMinutes(-10);
} catch (error) {
    if (error instanceof ValidationError) {
        console.error(
            `Validation failed: ${error.message} (field: ${error.field})`,
        );
    }
}
```

## Troubleshooting

### Data not persisting

1. Check LiveStoreProvider wraps your app
2. Verify OPFS is supported (check browser compatibility)
3. Check browser console for errors
4. Verify storage quota not exceeded

### Queries return empty array

1. Check data has been seeded
2. Verify filtering: `where({ deletedAt: null })` excludes deleted entries
3. Use browser DevTools → Application → Storage to inspect OPFS

### Changes not reflecting in UI

1. Use `store.useQuery()` (not `store.query()`) for reactive queries
2. Add `deps` array if query depends on external state
3. Verify component is inside LiveStoreProvider

## Documentation

- **Feature Spec**: [spec.md](../../../specs/001-local-first-storage/spec.md)
- **Implementation Plan**: [plan.md](../../../specs/001-local-first-storage/plan.md)
- **Data Model**: [data-model.md](../../../specs/001-local-first-storage/data-model.md)
- **Quickstart Guide**: [quickstart.md](../../../specs/001-local-first-storage/quickstart.md)
- **Research**: [research.md](../../../specs/001-local-first-storage/research.md)
- **LiveStore Docs**: https://docs.livestore.dev/

## Browser Support

- ✅ Chrome/Edge 102+ (desktop)
- ✅ Firefox 111+ (desktop)
- ✅ Safari 15.2+ (desktop & iOS)
- ❌ Android browsers (no SharedWorker support)

## License

Part of Pragmatic Time Tracker - see repository license
