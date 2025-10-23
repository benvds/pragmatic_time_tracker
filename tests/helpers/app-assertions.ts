import { expect, type Page } from "@playwright/test";
import { SELECTORS, HEADERS } from "./selectors";

export async function verifyAppLoaded(page: Page): Promise<void> {
    await expect(page.locator(SELECTORS.TITLE)).toContainText(
        "Time Tracker Logbook",
    );
    await expect(page.locator(SELECTORS.TABLE)).toBeVisible();
}

export async function verifyTableHeaders(page: Page): Promise<void> {
    for (const header of HEADERS) {
        await expect(
            page.locator(SELECTORS.TABLE_HEADERS, { hasText: header }),
        ).toBeVisible();
    }
}

export async function verifyEmptyState(page: Page): Promise<void> {
    await expect(page.locator(SELECTORS.EMPTY_STATE)).toBeVisible();
    await expect(page.locator(SELECTORS.EMPTY_STATE_TITLE)).toBeVisible();
    await expect(page.locator(SELECTORS.EMPTY_STATE_DESCRIPTION)).toBeVisible();
    await expect(page.locator(SELECTORS.LOAD_SAMPLE_DATA_BUTTON)).toBeVisible();
}
