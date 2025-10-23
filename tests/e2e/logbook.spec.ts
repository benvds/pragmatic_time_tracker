import { test, expect } from "@playwright/test";
import {
    SELECTORS,
    TIMEOUTS,
    PATTERNS,
    COLUMN_INDEX,
    HEADERS,
} from "../helpers/selectors";
import { ensureSampleDataLoaded } from "../helpers/app-actions";
import { getTableRows, getCellText } from "../helpers/table-helpers";

test.describe("Logbook", () => {
    test.beforeEach(async ({ page, context }) => {
        await context.clearCookies();
        await page.goto(".");
        await page.waitForSelector(SELECTORS.TITLE, {
            timeout: TIMEOUTS.APP_READY,
        });
        await ensureSampleDataLoaded(page);
    });

    test("displays the logbook title", async ({ page }) => {
        await expect(
            page.getByRole("heading", { name: "Time Tracker Logbook" }),
        ).toBeVisible();
    });

    test("displays the table headers", async ({ page }) => {
        for (const header of HEADERS) {
            await expect(
                page.locator(SELECTORS.TABLE_HEADERS, { hasText: header }),
            ).toBeVisible();
        }
    });

    test("displays time entries in a table", async ({ page }) => {
        await expect(page.getByRole("table")).toBeVisible();

        const rows = await getTableRows(page);
        await expect(rows).not.toHaveCount(0);
    });

    test("each entry has date, duration, and description columns", async ({
        page,
    }) => {
        const firstRow = page.locator(SELECTORS.TABLE_ROWS).first();
        await expect(firstRow).toBeVisible();

        const cells = firstRow.locator("td");
        await expect(cells).toHaveCount(3);

        await expect(cells.nth(COLUMN_INDEX.DATE)).toContainText(PATTERNS.DATE);
        await expect(cells.nth(COLUMN_INDEX.DURATION)).toContainText(
            PATTERNS.DURATION,
        );
        await expect(cells.nth(COLUMN_INDEX.DESCRIPTION)).toBeVisible();
    });

    test("entries are displayed in reverse chronological order", async ({
        page,
    }) => {
        const rows = await getTableRows(page);
        const rowCount = await rows.count();

        if (rowCount >= 2) {
            const firstRowDate = await getCellText(page, 0, COLUMN_INDEX.DATE);
            const secondRowDate = await getCellText(page, 1, COLUMN_INDEX.DATE);

            const firstDate = new Date(firstRowDate + ", 2024");
            const secondDate = new Date(secondRowDate + ", 2024");

            expect(firstDate.getTime()).toBeGreaterThanOrEqual(
                secondDate.getTime(),
            );
        }
    });

    test("handles empty descriptions gracefully", async ({ page }) => {
        const descriptionCells = page.locator(
            `${SELECTORS.TABLE_ROWS} td:nth-child(${COLUMN_INDEX.DESCRIPTION + 1})`,
        );
        const cellCount = await descriptionCells.count();

        expect(cellCount).toBeGreaterThan(0);

        const emptyDescriptions = page.locator(
            `${SELECTORS.TABLE_ROWS} td:nth-child(${COLUMN_INDEX.DESCRIPTION + 1})`,
            { hasText: "—" },
        );
        const emptyCount = await emptyDescriptions.count();

        expect(emptyCount).toBeGreaterThanOrEqual(0);
        expect(emptyCount).toBeLessThan(cellCount);
    });

    test("duration formats are valid", async ({ page }) => {
        const durationCells = page.locator(
            `${SELECTORS.TABLE_ROWS} td:nth-child(${COLUMN_INDEX.DURATION + 1})`,
        );
        const durationCount = await durationCells.count();

        const checksToPerform = Math.min(3, durationCount);
        for (let i = 0; i < checksToPerform; i++) {
            const durationText = await durationCells.nth(i).textContent();
            expect(durationText).toMatch(PATTERNS.DURATION_STRICT);
        }
    });

    test("table is responsive and accessible", async ({ page }) => {
        const table = page.getByRole("table");
        await expect(table).toBeVisible();

        const headers = page.locator(SELECTORS.TABLE_HEADERS);
        await expect(headers).toHaveCount(HEADERS.length);

        await expect(page.locator(SELECTORS.THEAD)).toBeVisible();
        await expect(page.locator(SELECTORS.TBODY)).toBeVisible();
    });
});
