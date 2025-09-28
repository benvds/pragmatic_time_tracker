# Logbook Feature Specification

## Overview

This specification defines the Time Tracker Logbook feature - a traditional paper logbook-style interface for recording and viewing time entries in a tabular format inspired by sailing logbooks.

## User Interface Specification

### Visual Design Requirements

#### Overall Layout

- **Container**: Full-width responsive container with background gradient
- **Paper aesthetic**: White paper background with subtle shadow and border
- **Color scheme**: Professional with muted grays, blues for highlights

#### Table Structure

```
┌───────────────────────────────────────────────────────────┐
│                    Time Tracker Logbook                   │
├──────────┬──────────┬─────────────────────────────────────┤
│   Date   │ Duration │           Description               │
├──────────┼──────────┼─────────────────────────────────────┤
│ [Today's │ [0h 0m ] │ [Enter description...] [Save][Clear]│ <- Entry Form
│  date  ] │          │                                     │
├──────────┼──────────┼─────────────────────────────────────┤
│ Dec 20   │   7h 30m │ Feature development - authentication│
├──────────┼──────────┼─────────────────────────────────────┤
│ Dec 19   │   6h     │ Code review and feedback            │
├──────────┼──────────┼─────────────────────────────────────┤
│ Dec 18   │   4h 15m │ —                                   │
└──────────┴──────────┴─────────────────────────────────────┘
```

#### Column Specifications

- **Date column**: 120px fixed width, center-aligned
- **Duration column**: 100px fixed width, right-aligned
- **Description column**: Flexible width, left-aligned

### Entry Form Requirements

#### Layout Integration

- **Position**: First row in table, spanning all columns
- **Background**: Light blue highlight (`--mantine-color-blue-0`)
- **Border**: Blue border (`--mantine-color-blue-2`) to distinguish from entries

#### Form Fields

1. **Date Field**
    - **Type**: Read-only text input
    - **Value**: Current date in "MMM DD" format (e.g., "Dec 22")
    - **Style**: Unstyled variant, centered text
    - **Width**: Matches date column (120px)

2. **Duration Fields**
    - **Layout**: Two number inputs with separators
    - **Hours**: 0-24 range, 30px width, center-aligned
    - **Minutes**: 0-59 range, 30px width, center-aligned
    - **Format**: "Xh Ym" display with separators
    - **Style**: Unstyled variant with bottom border on focus

3. **Description Field**
    - **Type**: Text input with placeholder "Enter task description..."
    - **Validation**: Required, minimum 3 characters
    - **Style**: Unstyled variant, italic placeholder, bottom border on focus
    - **Width**: Flexible to fill remaining space

#### Action Buttons

- **Save Button**:
    - Size: xs
    - Variant: subtle with blue background
    - Action: Submit form, reset on success

### Data Display Requirements

#### Entry Generation

- **Scope**: Current month working days only (Monday-Friday)
- **Exclusion**: Skip current date (where form is positioned)
- **Order**: Reverse chronological (most recent first)
- **Count**: Variable based on working days elapsed in current month

#### Entry Format

```typescript
interface LogEntry {
    date: string; // "MMM DD" format
    duration: string; // "Xh Ym", "Xh", or "Ym" format
    description?: string; // Optional, shows "—" if empty
}
```

#### Sample Data Patterns

- **Durations**: 1-8 hours with optional 15-minute increments

## Component Specifications

### Logbook Component (`src/features/logbook/index.tsx`)

#### Dependencies

```typescript
import { Container, Table, Title, Paper, Text } from "@mantine/core";
import { EntryForm } from "./entry-form";
import { generateWorkingDayEntries } from "./lib/generate-entries";
import styles from "./index.module.css";
```

#### Structure

### EntryForm Component (`src/features/logbook/entry-form/index.tsx`)

#### Dependencies

```typescript
import { Button, Group, NumberInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import styles from "./index.module.css";
```

#### Form Configuration

```typescript
const form = useForm({
    mode: "uncontrolled",
    initialValues: {
        description: "",
        hh: 0,
        mm: 0,
    },
    validate: {
        description: (value) => {
            if (!value || value.length === 0) return "Required";
            if (value.length < 3) return "At least 3 characters needed";
            return null;
        },
        hh: (value) =>
            value < 0 || value > 24 ? "Should be between 0 and 24" : null,
        mm: (value) =>
            value < 0 || value > 59 ? "Should be between 0 and 59" : null,
    },
});
```

#### Layout Structure

- **Three-column flex layout**: Date | Duration | Description + Actions
- **Column alignment**: Matches parent table columns exactly
- **Responsive behavior**: Maintains structure across screen sizes

### Data Generator (`src/features/logbook/lib/generate-entries.ts`)

#### Core Functions

1. **`generateWorkingDayEntries()`**: Main export function
2. **`isWorkingDay(date: Date)`**: Monday-Friday filter
3. **`getRandomDuration()`**: Realistic time duration generator
4. **`getRandomDescription()`**: Task description selector

#### Business Logic

- **Date range**: First day of current month to yesterday
- **Working days only**: Excludes weekends
- **Current date exclusion**: Leaves space for entry form
- **Realistic data**: Mirrors actual software development work patterns

### Testing Requirements

#### E2E Test Updates

- **Location**: Update existing `tests/entry-form.spec.ts`
- **URL change**: Use explicit `http://localhost:5173/` instead of relative path
- **Form location**: Entry form now embedded in table structure
- **Selector updates**: May need updated selectors for table context

#### Unit Testing (Future)

- Component rendering tests
- Data generation validation
- Form submission behavior
- Date formatting accuracy

## Quality Assurance

### Validation Checklist

- [ ] Logbook displays current month working days
- [ ] Entry form appears as first table row
- [ ] Form validation works for all fields
- [ ] Date auto-populates with current date
- [ ] Duration format displays correctly (Xh Ym)
- [ ] Description field handles empty states
- [ ] Save button submits and resets form
- [ ] Clear button resets all fields
- [ ] Table styling matches logbook aesthetic
- [ ] Responsive design works on mobile
