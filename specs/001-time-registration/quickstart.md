# Quickstart Guide: Time Tracking Feature

**Feature**: Daily Time Tracking for Freelance Developer  
**Date**: 2025-09-14  
**Prerequisites**: Node.js, npm/pnpm, modern browser

## Quick Test Scenarios

### Scenario 1: Happy Path - Full Day Entry
```bash
# Start dev server
npm run dev

# Browser: http://localhost:5173
# 1. Navigate to Time Tracking page
# 2. Enter: Date: today, Hours: 8, Minutes: 30, Description: "Backend development"
# 3. Click "Save Time Entry"
# Expected: Entry saved, appears in daily view, success message shown
```

### Scenario 2: Validation - Short Day Requires Description
```bash
# Browser: Time Tracking page
# 1. Enter: Date: today, Hours: 5, Minutes: 0, Description: empty
# 2. Click "Save Time Entry"
# Expected: Error "Description is required for time entries under 7 hours"
# 3. Add description: "Client meeting"
# 4. Click "Save Time Entry"
# Expected: Entry saved successfully
```

### Scenario 3: Data Persistence - Page Reload
```bash
# Browser: After creating entries in Scenario 1 & 2
# 1. Refresh page (F5)
# Expected: All previously entered time entries still visible
# 2. Open browser dev tools → Application → Local Storage
# Expected: "time-tracker-data" key with JSON array of entries
```

## Development Setup

### Install Dependencies
```bash
cd /path/to/pragmatic_time_tracker
npm install  # or pnpm install
```

### Run Development Server
```bash
npm run dev
# Server starts at http://localhost:5173
```

### Run Tests
```bash
# Unit and integration tests (existing)
npm run test

# Coverage report
npm run test:cov

# Interactive test UI
npm run test:ui

# E2E tests with Playwright (NEW)
npx playwright test

# E2E tests in UI mode
npx playwright test --ui
```

## File Structure (Post-Implementation)
```
src/
├── features/
│   └── entry/                          # EXISTING feature (extended)
│       ├── form/
│       │   └── index.tsx               # EXTENDED EntryForm (add date field + persistence)
│       ├── components/                 # NEW folder (if multiple components needed)
│       │   ├── TimeEntryList.tsx       # Display saved entries  
│       │   └── TimeEntryCard.tsx       # Individual entry display
│       ├── hooks/                      # NEW folder (if complex state needed)
│       │   └── useTimeEntries.ts       # Entry management + localStorage logic
│       ├── types.ts                    # NEW file (TimeEntry interfaces)
│       └── index.ts                    # EXISTING export file
├── lib/
│   └── form/                           # EXISTING form system (extend with parseDate)
│       ├── use-form.ts                 # EXISTING hook
│       ├── field-error.tsx             # EXISTING component
│       └── util.ts                     # EXISTING Field<T> types + parseDate function
└── __tests__/                          # Unit & integration tests (as needed)
    └── entry/                          # Feature tests
        ├── form/                       # Form component tests
        ├── components/                 # Component tests (if components/ exists)
        └── hooks/                      # Hook tests (if hooks/ exists)
e2e/                                    # NEW Playwright E2E tests  
├── time-tracking.spec.ts               # Main user workflows
└── fixtures/                           # Test data
```

**Pragmatic Notes**:
- **folders/ created only when needed** - don't create empty folders
- **parseDate goes in existing src/lib/form/util.ts** - no new utils folder needed
- **localStorage logic might stay in form component** - only create hooks/ if complex
- **types.ts as file, not folder** - single interface doesn't need folder structure

## User Acceptance Testing

### Test 1: Create Daily Time Entry
**Given**: I am a freelancer who worked today  
**When**: I enter 8 hours 30 minutes with description "API development"  
**Then**: The entry is saved and visible in my time log

**Manual Steps**:
1. Open time tracking page
2. Verify today's date is pre-filled
3. Enter hours: 8
4. Enter minutes: 30  
5. Enter description: "API development"
6. Click "Save Time Entry"
7. Verify entry appears in time entries list
8. Verify success notification appears

### Test 2: Enforce Description Rule
**Given**: I worked less than 7 hours today  
**When**: I try to save without a description  
**Then**: I get an error and cannot save until description is added

**Manual Steps**:
1. Open time tracking page
2. Enter hours: 5
3. Enter minutes: 0
4. Leave description empty
5. Click "Save Time Entry"
6. Verify error message: "Description is required for time entries under 7 hours"
7. Verify entry is NOT saved
8. Add description: "Client consultation"
9. Click "Save Time Entry"
10. Verify entry is now saved

### Test 3: Data Persistence
**Given**: I have created time entries  
**When**: I refresh the page or close/reopen browser  
**Then**: My time entries are still visible

**Manual Steps**:
1. Create 2-3 time entries using Test 1 steps
2. Refresh the page (Ctrl+F5 or Cmd+R)
3. Verify all entries still display
4. Close browser tab
5. Open new tab to application URL
6. Verify all entries still display

### Test 4: Input Validation
**Given**: I am entering time data  
**When**: I enter invalid values  
**Then**: I get immediate feedback and cannot save invalid data

**Manual Steps**:
1. Try hours: -1 → Expected: Error "Hours must be between 0 and 24"
2. Try hours: 25 → Expected: Error "Hours must be between 0 and 24"
3. Try minutes: -5 → Expected: Error "Minutes must be between 0 and 59"
4. Try minutes: 60 → Expected: Error "Minutes must be between 0 and 59"
5. Try future date → Expected: Error "Cannot create entries for future dates"

## Browser Compatibility

**Minimum Requirements**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used**:
- ES2022 syntax (supported by build target)
- localStorage API (universal support)
- CSS Grid/Flexbox (modern layouts)
- TypeScript compilation to ES2022

## Troubleshooting

### Issue: Entries Not Saving
**Solution**: Check browser dev tools → Console for errors, verify localStorage is enabled

### Issue: Page Not Loading
**Solution**: Ensure dev server is running (`npm run dev`), check port 5173 is available

### Issue: Tests Failing
**Solution**: Run `npm run typecheck` first, then `npm run lint`, fix any issues

## Performance Expectations

**Load Time**: < 500ms initial page load  
**Form Response**: < 100ms for save/validation feedback  
**Data Display**: < 50ms to show existing entries  
**Storage Limit**: 25,000+ entries supported (decades of daily use)

**Status**: Quickstart guide complete ✅