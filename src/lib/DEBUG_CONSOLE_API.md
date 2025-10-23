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

Clears all time entries from the database. Useful for:

- Resetting to a clean state
- Testing empty states
- Starting fresh

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

// Clear everything
> __debug.clear()
🔧 Clearing all data...
✅ All data cleared successfully! (18 entries cleared)

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
    load: () => Promise<void>;
    clear: () => Promise<void>;
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
