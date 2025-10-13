import { test, expect } from "@playwright/test";

test.describe("Offline Operations", () => {
    test.beforeEach(async ({ page }) => {
        // Start online and navigate to app
        await page.goto("http://localhost:5173");

        // Wait for app to load
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
    });

    test("app loads and functions when going offline", async ({ page, context }) => {
        // Verify app is working online first
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        await expect(page.locator("table")).toBeVisible();

        // Go offline
        await context.setOffline(true);

        // App should still be functional when offline
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        await expect(page.locator("table")).toBeVisible();

        // Table headers should still be present
        await expect(page.locator("text=Date")).toBeVisible();
        await expect(page.locator("text=Duration")).toBeVisible();
        await expect(page.locator("text=Description")).toBeVisible();
    });

    test("page reload works when offline", async ({ page, context }) => {
        // Start online, then go offline
        await context.setOffline(true);

        // Reload the page while offline
        await page.reload();

        // App should still load when offline
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        await expect(page.locator("table")).toBeVisible();
    });

    test("handles network state changes gracefully", async ({ page, context }) => {
        // Start online
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");

        // Go offline
        await context.setOffline(true);

        // Wait a moment for any offline handling
        await page.waitForTimeout(500);

        // Should still be functional
        await expect(page.locator("table")).toBeVisible();

        // Go back online
        await context.setOffline(false);

        // Wait a moment for any online handling
        await page.waitForTimeout(500);

        // Should still be functional
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        await expect(page.locator("table")).toBeVisible();
    });

    test("displays consistent UI state across offline/online transitions", async ({ page, context }) => {
        // Verify initial state
        const initialTitle = await page.locator("h1").textContent();
        const initialTableVisible = await page.locator("table").isVisible();

        // Go offline
        await context.setOffline(true);
        await page.waitForTimeout(300);

        // Should maintain same UI state
        const offlineTitle = await page.locator("h1").textContent();
        const offlineTableVisible = await page.locator("table").isVisible();

        expect(offlineTitle).toBe(initialTitle);
        expect(offlineTableVisible).toBe(initialTableVisible);

        // Go back online
        await context.setOffline(false);
        await page.waitForTimeout(300);

        // Should still maintain same UI state
        const onlineTitle = await page.locator("h1").textContent();
        const onlineTableVisible = await page.locator("table").isVisible();

        expect(onlineTitle).toBe(initialTitle);
        expect(onlineTableVisible).toBe(initialTableVisible);
    });

    test("no critical errors when offline", async ({ page, context }) => {
        const errors: string[] = [];

        // Track console errors
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                errors.push(msg.text());
            }
        });

        // Go offline
        await context.setOffline(true);

        // Navigate around the app
        await page.reload();
        await page.waitForTimeout(1000);

        // Filter out non-critical errors (favicon, dev server, etc.)
        const criticalErrors = errors.filter(error =>
            !error.includes("favicon") &&
            !error.includes("livereload") &&
            !error.includes("net::ERR_") && // Network errors are expected when offline
            !error.includes("Failed to fetch") // Fetch errors are expected when offline
        );

        // Should not have critical JavaScript errors when offline
        expect(criticalErrors).toHaveLength(0);
    });

    test("maintains performance when offline", async ({ page, context }) => {
        // Go offline
        await context.setOffline(true);

        // Measure page load performance
        const startTime = Date.now();
        await page.reload();
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        const loadTime = Date.now() - startTime;

        // Should load reasonably quickly even when offline (LiveStore is local-first)
        expect(loadTime).toBeLessThan(5000); // 5 seconds is generous for offline loading
    });
});

// Note: These E2E tests verify the offline user experience.
// LiveStore provides offline-first capabilities by design since it's local-first storage.
// The tests focus on ensuring the UI remains functional when network is unavailable.
//
// For comprehensive offline testing with actual data operations, we would need:
// 1. UI components for creating/editing entries
// 2. Form interactions to test CRUD operations
// 3. Data persistence verification across offline sessions
// 4. Conflict resolution testing (if sync is implemented later)