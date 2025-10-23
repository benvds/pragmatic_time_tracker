import type { Page } from "@playwright/test";

/**
 * Clears all browser storage including localStorage, sessionStorage, IndexedDB, and OPFS.
 * Must be called after navigating to a page to have a valid browser context.
 */
export async function clearAllStorage(page: Page): Promise<void> {
    await page.evaluate(async () => {
        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Clear IndexedDB
        const databases = (await indexedDB.databases?.()) || [];
        for (const db of databases) {
            if (db.name) {
                indexedDB.deleteDatabase(db.name);
            }
        }

        // Clear OPFS (Origin Private File System)
        try {
            const root = await navigator.storage.getDirectory();
            // @ts-ignore - removeEntry is available but types might not be updated
            for await (const entry of root.values()) {
                await root.removeEntry(entry.name, { recursive: true });
            }
        } catch (e) {
            console.log("OPFS clear not available:", e);
        }
    });
}
