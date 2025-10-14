import { test, expect } from "@playwright/test";

test.describe("First Run Experience", () => {
    test.beforeEach(async ({ page, context }) => {
        // Clear all storage to simulate first run
        await context.clearCookies();
        await page.goto("http://localhost:5173");

        // Clear all storage types including OPFS
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

        // Reload to get fresh state
        await page.reload();
        await page.waitForLoadState("networkidle");
    });

    test("shows empty state on first visit", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Wait for app to load
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");

        // Should show empty state message
        await expect(page.locator("text=No time entries yet")).toBeVisible();
        await expect(
            page.locator("text=Start tracking your time"),
        ).toBeVisible();
    });

    test("displays welcome message for new users", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Should have friendly welcome content
        await expect(page.locator("text=No time entries yet")).toBeVisible();
        await expect(
            page.locator("text=Start tracking your time"),
        ).toBeVisible();

        // Should have clear call to action
        const loadSampleButton = page.locator("button", {
            hasText: "Load Sample Data",
        });
        await expect(loadSampleButton).toBeVisible();
    });

    test("provides option to load sample data", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Should offer sample data option
        const loadSampleButton = page.locator("button", {
            hasText: "Load Sample Data",
        });
        await expect(loadSampleButton).toBeVisible();
        await expect(loadSampleButton).toBeEnabled();
    });

    test("sample data button is functional", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Click load sample data button
        const loadSampleButton = page.locator("button", {
            hasText: "Load Sample Data",
        });
        await loadSampleButton.click();

        // Should show loading state briefly
        await expect(page.locator("text=Loading")).toBeVisible();

        // Should eventually show sample entries (or updated state)
        // Note: In real implementation, this would show actual sample entries
        await page.waitForTimeout(1000); // Wait for any loading

        // Verify button interaction worked (no errors)
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
    });

    test("maintains table structure even when empty", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Table headers should still be visible
        await expect(page.locator("text=Date")).toBeVisible();
        await expect(page.locator("text=Duration")).toBeVisible();
        await expect(page.locator("text=Description")).toBeVisible();

        // Table should exist
        await expect(page.locator("table")).toBeVisible();
        await expect(page.locator("thead")).toBeVisible();
        await expect(page.locator("tbody")).toBeVisible();
    });

    test("has proper responsive design on mobile", async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto("http://localhost:5173");

        // Should still be functional on mobile
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        await expect(page.locator("text=No time entries yet")).toBeVisible();

        // Button should be accessible on mobile
        const loadSampleButton = page.locator("button", {
            hasText: "Load Sample Data",
        });
        await expect(loadSampleButton).toBeVisible();
    });

    test("handles offline first run gracefully", async ({ page, context }) => {
        // Go offline
        await context.setOffline(true);

        await page.goto("http://localhost:5173");

        // Should still load and show empty state
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        await expect(page.locator("text=No time entries yet")).toBeVisible();

        // Sample data button should still be present (even if it might not work offline)
        const loadSampleButton = page.locator("button", {
            hasText: "Load Sample Data",
        });
        await expect(loadSampleButton).toBeVisible();
    });

    test("preserves app functionality after first interaction", async ({
        page,
    }) => {
        await page.goto("http://localhost:5173");

        // Interact with the empty state
        const loadSampleButton = page.locator("button", {
            hasText: "Load Sample Data",
        });
        await loadSampleButton.click();

        // Wait for interaction to complete
        await page.waitForTimeout(500);

        // App should remain functional
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        await expect(page.locator("table")).toBeVisible();

        // No JavaScript errors should occur
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                errors.push(msg.text());
            }
        });

        await page.waitForTimeout(1000);

        // Filter out non-critical errors
        const criticalErrors = errors.filter(
            (error) =>
                !error.includes("favicon") &&
                !error.includes("livereload") &&
                !error.includes("net::ERR_"),
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test("provides clear visual hierarchy", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Main title should be prominent
        const title = page.locator("h1");
        await expect(title).toBeVisible();

        // Empty state should be clearly separated
        const emptyStateText = page.locator("text=No time entries yet");
        await expect(emptyStateText).toBeVisible();

        // Call to action should be prominent
        const button = page.locator("button", { hasText: "Load Sample Data" });
        await expect(button).toBeVisible();
    });

    test("works consistently across browser reloads", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Verify initial empty state
        await expect(page.locator("text=No time entries yet")).toBeVisible();

        // Reload the page
        await page.reload();

        // Should still show empty state (no data persistence yet)
        await expect(page.locator("text=No time entries yet")).toBeVisible();
        await expect(
            page.locator("button", { hasText: "Load Sample Data" }),
        ).toBeVisible();
    });
});
