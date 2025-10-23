import { test as setup } from "@playwright/test";

setup("clear all storage before tests", async ({ page, context }) => {
    // Clear cookies at context level
    await context.clearCookies();

    // Navigate to the app
    await page.goto("/");

    // Clear all storage types in the browser context
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
});
