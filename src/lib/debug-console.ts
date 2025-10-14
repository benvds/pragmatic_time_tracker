import type { Store } from "@livestore/livestore";
import { seedOnboardingData, clearAllData } from "@/features/storage";

/**
 * Debug console API for development
 * Available in the browser console when DEBUG mode is enabled
 *
 * Usage:
 *   __debug.load()          - Load sample data
 *   __debug.clear()         - Clear all data
 *   __debug.help()          - Show available commands
 */

interface DebugAPI {
    load: () => Promise<void>;
    clear: () => Promise<void>;
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
        load: async () => {
            console.log("🔧 Loading sample data...");
            try {
                const result = await seedOnboardingData(store);
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

        clear: async () => {
            console.log("🔧 Clearing all data...");
            try {
                const result = await clearAllData(store);
                if (result.success) {
                    console.log(
                        `✅ All data cleared successfully! (${result.cleared || 0} entries cleared)`,
                    );
                } else {
                    console.error("❌ Failed to clear data:", result.error);
                }
            } catch (error) {
                console.error("❌ Error clearing data:", error);
            }
        },

        help: () => {
            console.log(`
🔧 Debug Console API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Available commands:

  __debug.load()    Load sample time tracking data
  __debug.clear()   Clear all data from the database
  __debug.help()    Show this help message

Examples:

  > __debug.load()
  > __debug.clear()

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

/**
 * Clean up debug console API
 */
export function cleanupDebugConsole(): void {
    if (import.meta.env.VITE_DEBUG !== "true") {
        return;
    }

    delete (window as any).__debug;
}
