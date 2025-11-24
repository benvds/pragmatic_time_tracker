# Debug Console API

The Debug Console API provides convenient browser console commands for managing test data during development and testing.

## Availability

The console API is **only available** when `VITE_DEBUG` environment variable is set to `"true"`:

- ✅ **Development mode** (`pnpm dev`) - Enabled by default
- ✅ **Test mode** (`pnpm build:test`) - Enabled by default
- ❌ **Production builds** - Disabled

## Usage

Open the browser DevTools console and use the `__debug` object:

### Load Sample Data

```javascript
__debug.load();
```

Loads sample time tracking entries into the database. Useful for:

- Testing with realistic data
- Previewing the UI with content
- E2E test setup

### Clear All Data

```javascript
__debug.clear();
```

Performs a hard reset using LiveStore's `hardReset()` helper, then reloads the page. Useful for:

- Resetting to a completely clean state
- Testing empty states
- Starting fresh with no data or events

**Note:** This uses LiveStore's built-in hard reset functionality which clears all data and the eventlog.

### Download Database

```javascript
__debug.downloadDb();
```

Downloads the SQLite database file to your computer. Useful for:

- Inspecting database contents
- Debugging data issues
- Backing up test data

### Download Eventlog

```javascript
__debug.downloadEventlog();
```

Downloads the eventlog database file to your computer. Useful for:

- Reviewing event history
- Debugging event sourcing issues
- Auditing data changes

### View Sync States

```javascript
__debug.syncStates();
```

Displays the current synchronization state in the console. Useful for:

- Debugging sync issues
- Monitoring connection status
- Checking replication state

### Get Help

```javascript
__debug.help();
```

Displays available commands and usage examples in the console.

## Examples

```javascript
// Load sample data
> __debug.load()
🔧 Loading sample data...
✅ Sample data loaded successfully! (18 entries)

// Clear everything (hard reset)
> __debug.clear()
🔧 Clearing all data...
✅ All data cleared successfully!
♻️  Reloading page to reflect cleared state...

// Download database
> __debug.downloadDb()
💾 Downloading database...
✅ Database download started

// Download eventlog
> __debug.downloadEventlog()
💾 Downloading eventlog database...
✅ Eventlog database download started

// Check sync state
> __debug.syncStates()
🔄 Fetching sync states...
Sync States: { ... }

// Show help
> __debug.help()
🔧 Debug Console API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
```

## TypeScript Support

The `__debug` object is fully typed in TypeScript:

```typescript
interface DebugAPI {
    load: () => void;
    clear: () => Promise<void>;
    downloadDb: () => Promise<void>;
    downloadEventlog: () => Promise<void>;
    syncStates: () => void;
    help: () => void;
}

declare global {
    interface Window {
        __debug?: DebugAPI;
    }
}
```

Your IDE will provide autocomplete for `window.__debug` methods.

## Implementation

See `src/lib/debug-console.ts` for the implementation details.

## UI Alternative

If you prefer a visual interface, the **Debug Overlay Menu** is also available (floating button in bottom-right corner) when debug mode is enabled.
