import type { Store } from "@livestore/livestore";
import { seedOnboardingData } from "@/features/storage";

/**
 * Debug console API for development
 * Available in the browser console when DEBUG mode is enabled
 *
 * Usage:
 *   __debug.load()              - Load sample data
 *   __debug.clear()             - Clear all data (hard reset)
 *   __debug.downloadDb()        - Download SQLite database
 *   __debug.downloadEventlog()  - Download eventlog database
 *   __debug.syncStates()        - Show current sync state
 *   __debug.help()              - Show available commands
 */

interface DebugAPI {
    load: () => void;
    clear: () => void;
    downloadDb: () => void;
    downloadEventlog: () => void;
    syncStates: () => void;
    help: () => void;
}

/**
 * Initialize the debug console API
 * Only available when VITE_DEBUG is true
 */
export function initializeDebugConsole(store: Store): void {
    // Only initialize in debug mode
    if (import.meta.env.VITE_DEBUG !== "true") {
        return;
    }

    const debugAPI: DebugAPI = {
        load: () => {
            console.log("🔧 Loading sample data...");
            try {
                const result = seedOnboardingData(store);
                if (result.success) {
                    console.log(
                        `✅ Sample data loaded successfully! (${result.seeded} entries)`,
                    );
                } else {
                    console.error(
                        "❌ Failed to load sample data:",
                        result.error,
                    );
                }
            } catch (error) {
                console.error("❌ Error loading sample data:", error);
            }
        },

        clear: () => {
            console.log("🔧 Clearing all data...");
            try {
                if (!__debugLiveStore?.default?._dev) {
                    throw new Error("LiveStore debug helpers not available");
                }
                __debugLiveStore.default._dev.hardReset();
                console.log("✅ All data cleared successfully!");
                console.log("♻️  Reloading page to reflect cleared state...");
                window.location.reload();
            } catch (error) {
                console.error("❌ Error clearing data:", error);
            }
        },

        downloadDb: () => {
            console.log("💾 Downloading database...");
            try {
                if (!__debugLiveStore?.default?._dev) {
                    throw new Error("LiveStore debug helpers not available");
                }
                __debugLiveStore.default._dev.downloadDb();
                console.log("✅ Database download started");
            } catch (error) {
                console.error("❌ Error downloading database:", error);
            }
        },

        downloadEventlog: () => {
            console.log("💾 Downloading eventlog database...");
            try {
                if (!__debugLiveStore?.default?._dev) {
                    throw new Error("LiveStore debug helpers not available");
                }
                __debugLiveStore.default._dev.downloadEventlogDb();
                console.log("✅ Eventlog database download started");
            } catch (error) {
                console.error("❌ Error downloading eventlog:", error);
            }
        },

        syncStates: () => {
            console.log("🔄 Fetching sync states...");
            try {
                if (!__debugLiveStore?.default?._dev) {
                    throw new Error("LiveStore debug helpers not available");
                }
                const states = __debugLiveStore.default._dev.syncStates();
                console.log("Sync States:", states);
            } catch (error) {
                console.error("❌ Error fetching sync states:", error);
            }
        },

        help: () => {
            console.log(`
🔧 Debug Console API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available commands:

  __debug.load()              Load sample time tracking data
  __debug.clear()             Clear all data (hard reset + reload)
  __debug.downloadDb()        Download SQLite database file
  __debug.downloadEventlog()  Download eventlog database file
  __debug.syncStates()        Display current sync state
  __debug.help()              Show this help message

Examples:

  > __debug.load()
  > __debug.clear()
  > __debug.downloadDb()
  > __debug.syncStates()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `);
        },
    };

    // Expose to window
    (window as any).__debug = debugAPI;

    // Log welcome message
    console.log(
        "%c🔧 Debug Mode Enabled",
        "background: #ff6b35; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;",
    );
    console.log(
        "%cType __debug.help() for available commands",
        "color: #666; font-style: italic;",
    );
}
