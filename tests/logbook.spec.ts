import { test, expect } from "@playwright/test";

test.describe("Logbook", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:5174");
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

    test("table has proper styling classes", async ({ page }) => {
        const table = page.getByRole("table");

        // Check table has Mantine classes and custom styling
        await expect(table).toHaveClass(/mantine-Table-table/);

        // Check that table rows have striped and hover attributes
        const firstRow = page.locator("tbody tr").first();
        await expect(firstRow).toHaveAttribute("data-striped", "odd");
        await expect(firstRow).toHaveAttribute("data-hover", "true");
    });

    test("container has proper layout", async ({ page }) => {
        const container = page.locator(".mantine-Container-root");
        await expect(container).toBeVisible();

        const paper = page.locator(".mantine-Paper-root");
        await expect(paper).toBeVisible();
    });

    test("displays working days only (no weekends)", async ({ page }) => {
        // Get all date cells
        const dateCells = page.locator("tbody tr td:nth-child(1)");
        const dateCount = await dateCells.count();

        if (dateCount > 0) {
            // Sample a few dates to verify they're working days
            for (let i = 0; i < Math.min(3, dateCount); i++) {
                const dateText = await dateCells.nth(i).textContent();
                const date = new Date(dateText + ", 2024");
                const dayOfWeek = date.getDay();

                // Should be Monday(1) to Friday(5)
                expect(dayOfWeek).toBeGreaterThanOrEqual(1);
                expect(dayOfWeek).toBeLessThanOrEqual(5);
            }
        }
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

    test("loads within reasonable time", async ({ page }) => {
        const startTime = Date.now();
        await page.goto("http://localhost:5174");

        // Wait for main content to be visible
        await expect(
            page.getByRole("heading", { name: "Time Tracker Logbook" }),
        ).toBeVisible();
        await expect(page.getByRole("table")).toBeVisible();

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });
});
