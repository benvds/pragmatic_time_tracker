import { test, expect } from "@playwright/test";
import { SELECTORS } from "../helpers/selectors";
import { navigateToApp, clearDataViaDebugMenu } from "../helpers/app-actions";
import { verifyEmptyState } from "../helpers/app-assertions";
import { filterCriticalErrors } from "../helpers/error-filtering";

test.describe("First Run Experience", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToApp(page);
    });

    test("displays empty state after clearing all data", async ({ page }) => {
        await clearDataViaDebugMenu(page);

        await expect(page.locator(SELECTORS.TITLE)).toContainText(
            "Time Tracker Logbook",
        );
        await verifyEmptyState(page);
    });

    test("empty state has load sample data button", async ({ page }) => {
        await clearDataViaDebugMenu(page);

        const loadSampleButton = page.locator(
            SELECTORS.LOAD_SAMPLE_DATA_BUTTON,
        );
        await expect(loadSampleButton).toBeVisible();
        await expect(loadSampleButton).toBeEnabled();
    });

    test("load sample data button populates entries", async ({ page }) => {
        await clearDataViaDebugMenu(page);

        const loadSampleButton = page.locator(
            SELECTORS.LOAD_SAMPLE_DATA_BUTTON,
        );
        await loadSampleButton.click();

        await page.waitForTimeout(1000);

        await expect(page.locator(SELECTORS.TABLE)).toBeVisible();
        await expect(page.locator(SELECTORS.TABLE_ROWS)).not.toHaveCount(0);
        await expect(page.locator(SELECTORS.EMPTY_STATE)).not.toBeVisible();
    });

    test("empty state is responsive on mobile", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await clearDataViaDebugMenu(page);

        await expect(page.locator(SELECTORS.TITLE)).toContainText(
            "Time Tracker Logbook",
        );
        await verifyEmptyState(page);
    });

    test("load sample data button becomes disabled when clicked", async ({
        page,
    }) => {
        await clearDataViaDebugMenu(page);

        const loadSampleButton = page.locator(
            SELECTORS.LOAD_SAMPLE_DATA_BUTTON,
        );

        const clickPromise = loadSampleButton.click();
        const disabledPromise = expect(loadSampleButton).toBeDisabled();

        await Promise.race([clickPromise, disabledPromise]);

        await page.waitForTimeout(500);
    });

    test("empty state persists across reloads", async ({ page }) => {
        await clearDataViaDebugMenu(page);
        await verifyEmptyState(page);

        await page.reload();
        await page.waitForSelector(SELECTORS.TITLE);

        await verifyEmptyState(page);
    });

    test("load sample data works after reload", async ({ page }) => {
        await clearDataViaDebugMenu(page);
        await page.reload();
        await page.waitForSelector(SELECTORS.TITLE);

        const loadSampleButton = page.locator(
            SELECTORS.LOAD_SAMPLE_DATA_BUTTON,
        );
        await loadSampleButton.click();

        await page.waitForTimeout(1000);

        await expect(page.locator(SELECTORS.TABLE)).toBeVisible();
    });

    test("no errors when loading sample data", async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                errors.push(msg.text());
            }
        });

        await clearDataViaDebugMenu(page);

        const loadSampleButton = page.locator(
            SELECTORS.LOAD_SAMPLE_DATA_BUTTON,
        );
        await loadSampleButton.click();

        await page.waitForTimeout(1000);

        const criticalErrors = filterCriticalErrors(errors);

        expect(criticalErrors).toHaveLength(0);
    });
});
