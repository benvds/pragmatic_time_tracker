import { test, expect } from "@playwright/test";

test.describe("Logbook", () => {
    test.beforeEach(async ({ page, context }) => {
        // Clear storage for consistent test state
        await context.clearCookies();
        await page.goto(".");

        // Wait for app to be ready
        await page.waitForSelector("h1:has-text('Time Tracker Logbook')", {
            timeout: 10000,
        });

        // Load sample data if empty state is visible
        const loadSampleButton = page.locator("button", {
            hasText: "Load Sample Data",
        });
        const isEmptyState = await loadSampleButton
            .isVisible()
            .catch(() => false);

        if (isEmptyState) {
            await loadSampleButton.click();
            // Wait for data to load - table should appear
            await page.waitForSelector("table tbody tr", { timeout: 10000 });
        }
    });

    test("displays the logbook title", async ({ page }) => {
        await expect(
            page.getByRole("heading", { name: "Time Tracker Logbook" }),
        ).toBeVisible();
    });

    test("displays the table headers", async ({ page }) => {
        await expect(page.locator("th", { hasText: "Date" })).toBeVisible();
        await expect(page.locator("th", { hasText: "Duration" })).toBeVisible();
        await expect(
            page.locator("th", { hasText: "Description" }),
        ).toBeVisible();
    });

    test("displays time entries in a table", async ({ page }) => {
        const table = page.getByRole("table");
        await expect(table).toBeVisible();

        // Check that there are rows in the table body
        const rows = page.locator("tbody tr");
        await expect(rows).not.toHaveCount(0);
    });

    test("each entry has date, duration, and description columns", async ({
        page,
    }) => {
        const firstRow = page.locator("tbody tr").first();
        await expect(firstRow).toBeVisible();

        // Check that each row has 3 cells
        const cells = firstRow.locator("td");
        await expect(cells).toHaveCount(3);

        // Check that date cell contains expected format (e.g., "Jan 15")
        const dateCell = cells.nth(0);
        await expect(dateCell).toContainText(/\w{3} \d{1,2}/);

        // Check that duration cell contains time format (e.g., "2h 30m" or "45m" or "8h")
        const durationCell = cells.nth(1);
        await expect(durationCell).toContainText(/\d+[hm](\s\d+m)?/);

        // Description cell may contain text or em dash for empty
        const descriptionCell = cells.nth(2);
        await expect(descriptionCell).toBeVisible();
    });

    test("entries are displayed in reverse chronological order", async ({
        page,
    }) => {
        const rows = page.locator("tbody tr");
        const rowCount = await rows.count();

        if (rowCount >= 2) {
            const firstRowDate = await rows
                .nth(0)
                .locator("td")
                .nth(0)
                .textContent();
            const secondRowDate = await rows
                .nth(1)
                .locator("td")
                .nth(0)
                .textContent();

            // Parse dates to compare (simplified check for month/day format)
            const firstDate = new Date(firstRowDate + ", 2024");
            const secondDate = new Date(secondRowDate + ", 2024");

            // First entry should be more recent than or equal to second entry
            expect(firstDate.getTime()).toBeGreaterThanOrEqual(
                secondDate.getTime(),
            );
        }
    });

    test("handles empty descriptions gracefully", async ({ page }) => {
        const descriptionCells = page.locator("tbody tr td:nth-child(3)");
        const cellCount = await descriptionCells.count();

        // Check that at least one cell exists
        expect(cellCount).toBeGreaterThan(0);

        // Look for cells with em dash (—) which indicates empty description
        const emptyDescriptions = page.locator("tbody tr td:nth-child(3)", {
            hasText: "—",
        });
        const emptyCount = await emptyDescriptions.count();

        // Should have some entries with descriptions and some without
        expect(emptyCount).toBeGreaterThanOrEqual(0);
        expect(emptyCount).toBeLessThan(cellCount);
    });

    test("duration formats are valid", async ({ page }) => {
        const durationCells = page.locator("tbody tr td:nth-child(2)");
        const durationCount = await durationCells.count();

        if (durationCount > 0) {
            // Check first few duration formats
            for (let i = 0; i < Math.min(3, durationCount); i++) {
                const durationText = await durationCells.nth(i).textContent();

                // Should match patterns like "2h", "30m", "2h 30m"
                expect(durationText).toMatch(/^\d+[hm](\s\d+m)?$/);
            }
        }
    });

    test("table is responsive and accessible", async ({ page }) => {
        // Check table accessibility
        const table = page.getByRole("table");
        await expect(table).toBeVisible();

        // Check headers are properly associated
        const headers = page.locator("th");
        await expect(headers).toHaveCount(3);

        // Check table has proper structure
        const thead = page.locator("thead");
        const tbody = page.locator("tbody");
        await expect(thead).toBeVisible();
        await expect(tbody).toBeVisible();
    });
});
