# Data Model: Time Tracking Feature

**Date**: 2025-09-14  
**Feature**: Daily Time Tracking for Freelance Developer

## Core Entities

### TimeEntry

**Purpose**: Represents a single day's work time record for a freelancer (extends existing entry form)

**Fields** (based on existing src/features/entry/form):
```typescript
interface TimeEntry {
  id: string;           // Unique identifier (UUID v4)
  date: string;         // ISO date format (YYYY-MM-DD)
  description: string;  // Work description (existing: min 3 chars, required)
  project: string;      // Project name (existing: min 2 chars, required) 
  duration: number;     // Total minutes worked (existing: hh * 60 + mm)
  createdAt: string;    // ISO timestamp when entry was created
  updatedAt: string;    // ISO timestamp when entry was last modified
}

// Derived fields for form display (matches existing form)
interface TimeEntryForm {
  description: string;  // Required, min 3 characters
  project: string;      // Required, min 2 characters  
  hh: number;          // Hours (0-24)
  mm: number;          // Minutes (0-59)
}
```

**Validation Rules** (extends existing parsers):
- `id`: Must be valid UUID v4 format
- `date`: Must be valid ISO date (YYYY-MM-DD), no future dates allowed
- `description`: Required, minimum 3 characters (existing parseDescription)
- `project`: Required, minimum 2 characters (existing parseProject) 
- `hh`: Integer between 0 and 24 (existing parseHh)
- `mm`: Integer between 0 and 59 (existing parseMm)
- `duration`: Calculated as hh * 60 + mm, max 1440 minutes (24 hours)
- `createdAt`: ISO timestamp, set on creation
- `updatedAt`: ISO timestamp, updated on every modification

**Business Rules** (adapted from spec requirements):
- Only one TimeEntry per date allowed
- Total duration per day cannot exceed 1440 minutes (24 hours)
- Description required for ALL entries (existing validation stricter than spec)
- Project tracking included (extends spec requirements)
- Cannot create entries for future dates

**State Transitions**:
```
[New Entry] → [Validation] → [Persisted]
     ↓
[Edit Mode] → [Validation] → [Updated]
```

## Storage Schema

### LocalStorage Structure
```typescript
interface TimeTrackingStorage {
  timeEntries: TimeEntry[];
  version: string; // Schema version for migrations
}
```

**Storage Key**: `"time-tracker-data"`

**Storage Format**: JSON serialized string

**Migration Strategy**:
- Current version: "1.0.0"
- Version field enables future schema migrations
- Backward compatibility maintained through version checks

## Data Validation

### Client-Side Validation Functions
```typescript
type ValidationResult = {
  isValid: boolean;
  errors: string[];
}

// Core validation functions
validateHours(hours: number): ValidationResult
validateMinutes(minutes: number): ValidationResult
validateDate(date: string): ValidationResult
validateDescription(description: string, totalMinutes: number): ValidationResult
validateTimeEntry(entry: Partial<TimeEntry>): ValidationResult
```

### Error Messages
- Invalid hours: "Hours must be between 0 and 24"
- Invalid minutes: "Minutes must be between 0 and 59"
- Missing description: "Description is required for time entries under 7 hours"
- Future date: "Cannot create entries for future dates"
- Duplicate date: "An entry for this date already exists"

## Data Access Patterns

### CRUD Operations
```typescript
// Create
createTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): TimeEntry

// Read
getTimeEntries(): TimeEntry[]
getTimeEntryByDate(date: string): TimeEntry | null
getTimeEntriesForMonth(year: number, month: number): TimeEntry[]

// Update
updateTimeEntry(id: string, updates: Partial<TimeEntry>): TimeEntry

// Delete
deleteTimeEntry(id: string): boolean
```

### Query Patterns
- **Daily lookup**: Most common - get entry for specific date
- **Monthly view**: Display entries for calendar month
- **Chronological list**: All entries sorted by date (newest first)

## Relationships

### Entity Relationships
- **TimeEntry** ← (1:1) → **Date**: Each date can have exactly one time entry
- **TimeEntry** ← (N/A) → **User**: Single-user system, no user entity needed
- **TimeEntry** ← (N/A) → **Project/Client**: Not required per specification

### Data Dependencies
- No foreign key relationships (single entity system)
- Date uniqueness constraint enforced at application level
- No cascading deletes (single entity)

## Performance Considerations

### Storage Limits
- LocalStorage typical limit: 5-10MB per domain
- Estimated storage per entry: ~200 bytes JSON
- Maximum entries supported: ~25,000-50,000
- Practical yearly limit: 365 entries (well within constraints)

### Access Patterns
- **Read frequency**: High (every page load, date selection)
- **Write frequency**: Low (1-2 updates per day maximum)
- **Query complexity**: Simple (date-based lookups)

### Optimization Strategies
- Load all entries on app initialization (small dataset)
- In-memory caching for current session
- Debounced persistence for form updates
- Index by date for fast lookups

## Error Handling

### Storage Failures
- LocalStorage unavailable: Fallback to session storage
- Quota exceeded: Warn user, suggest cleanup
- Data corruption: Reset to empty state with user confirmation

### Validation Failures
- Field-level: Real-time feedback during input
- Form-level: Prevent submission with clear error messages
- Business rule violations: Block operation with explanation

**Status**: Data model complete ✅