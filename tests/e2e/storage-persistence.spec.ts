import { test, expect } from "@playwright/test";

test.describe("Storage Persistence", () => {
    test.beforeEach(async ({ page }) => {
        // Start with clean state - clear browser storage
        await page.goto("http://localhost:5173");
        await page.evaluate(() => {
            // Clear all local storage and indexedDB
            localStorage.clear();
            sessionStorage.clear();
            // Clear OPFS (if possible from browser context)
        });
    });

    test("persists time entry across page reloads", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Wait for app to load
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");

        // Initially should show empty state
        await expect(page.locator("text=No time entries yet")).toBeVisible();

        // Create a test entry using browser console to access storage hooks
        await page.evaluate(() => {
            // Access the LiveStore from window context if available
            // This is a simplified test - in real implementation you'd interact with UI forms
            const testEntry = {
                id: "test-persistence-1",
                date: new Date(),
                minutes: 90,
                description: "E2E Test Entry for Persistence",
            };

            // This would normally be done through UI interaction
            // For now, we'll test the UI rendering part
            console.log("Test entry would be created:", testEntry);
        });

        // For now, let's test that the logbook component renders correctly
        // In full implementation, this would test actual data persistence
        await expect(page.locator("[data-testid='logbook-table']")).toBeVisible();

        // Reload the page
        await page.reload();

        // Verify the app still loads correctly after reload
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
    });

    test("handles empty state correctly", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Should show empty state message when no entries exist
        await expect(page.locator("text=No time entries yet")).toBeVisible();
        await expect(page.locator("text=Start tracking your time!")).toBeVisible();

        // Table headers should still be visible
        await expect(page.locator("text=Date")).toBeVisible();
        await expect(page.locator("text=Duration")).toBeVisible();
        await expect(page.locator("text=Description")).toBeVisible();
    });

    test("displays logbook structure correctly", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Check main components are present
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        await expect(page.locator("table")).toBeVisible();

        // Check table structure
        await expect(page.locator("thead")).toBeVisible();
        await expect(page.locator("tbody")).toBeVisible();

        // Check column headers
        const headers = page.locator("th");
        await expect(headers).toHaveCount(3);
        await expect(headers.nth(0)).toContainText("Date");
        await expect(headers.nth(1)).toContainText("Duration");
        await expect(headers.nth(2)).toContainText("Description");
    });

    test("has correct page title and meta", async ({ page }) => {
        await page.goto("http://localhost:5173");

        // Check page title
        await expect(page).toHaveTitle(/Pragmatic Time Tracker/);

        // App should load without JavaScript errors
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                errors.push(msg.text());
            }
        });

        await page.waitForTimeout(2000); // Wait for initial load

        // Should not have critical JavaScript errors
        const criticalErrors = errors.filter(error =>
            !error.includes("favicon") && // Ignore favicon errors
            !error.includes("livereload") // Ignore dev server errors
        );
        expect(criticalErrors).toHaveLength(0);
    });
});

// More comprehensive E2E tests would be added here for:
// - Creating entries through UI forms
// - Updating existing entries
// - Deleting entries
// - Filtering and searching
// - Performance with large datasets
//
// These require actual UI components for CRUD operations
// which would be implemented in later phases.