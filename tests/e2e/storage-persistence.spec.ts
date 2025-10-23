import { test, expect } from "@playwright/test";
import { SELECTORS } from "../helpers/selectors";
import { clearDataViaDebugMenu, navigateToApp } from "../helpers/app-actions";
import { verifyEmptyState } from "../helpers/app-assertions";
import { filterCriticalErrors } from "../helpers/error-filtering";

test.describe("Storage Persistence", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToApp(page);
    });

    test("maintains empty state after clearing data and reloading", async ({
        page,
    }) => {
        await clearDataViaDebugMenu(page);

        await verifyEmptyState(page);

        await page.reload();
        await page.waitForSelector(SELECTORS.TITLE);

        await verifyEmptyState(page);
    });

    test("handles empty state correctly", async ({ page }) => {
        await clearDataViaDebugMenu(page);

        await verifyEmptyState(page);

        await expect(
            page.locator(SELECTORS.LOAD_SAMPLE_DATA_BUTTON),
        ).toBeVisible();
    });

    test("displays logbook structure correctly", async ({ page }) => {
        await expect(page.locator(SELECTORS.TITLE)).toContainText(
            "Time Tracker Logbook",
        );
        await expect(page.locator(SELECTORS.TABLE)).toBeVisible();

        await expect(page.locator(SELECTORS.THEAD)).toBeVisible();
        await expect(page.locator(SELECTORS.TBODY)).toBeVisible();

        const headers = page.locator(SELECTORS.TABLE_HEADERS);
        await expect(headers).toHaveCount(3);
        await expect(headers.nth(0)).toContainText("Date");
        await expect(headers.nth(1)).toContainText("Duration");
        await expect(headers.nth(2)).toContainText("Description");
    });

    test("loads without critical JavaScript errors", async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                errors.push(msg.text());
            }
        });

        await page.waitForTimeout(2000);

        const criticalErrors = filterCriticalErrors(errors);
        expect(criticalErrors).toHaveLength(0);
    });
});
