import { type Page, type BrowserContext } from "@playwright/test";
import { SELECTORS, TIMEOUTS } from "./selectors";

export async function navigateToApp(page: Page): Promise<void> {
    await page.goto("/");
    await page.waitForSelector(SELECTORS.TITLE, {
        timeout: TIMEOUTS.APP_READY,
    });
}

export async function clearDataViaDebugMenu(page: Page): Promise<void> {
    await page.locator(SELECTORS.DEBUG_BUTTON).click();
    await page.locator(SELECTORS.CLEAR_DATA_BUTTON).click();
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForSelector(SELECTORS.TITLE, {
        timeout: TIMEOUTS.APP_READY,
    });
}

export async function ensureSampleDataLoaded(page: Page): Promise<void> {
    const tableExists = await page
        .locator(SELECTORS.TABLE_ROWS)
        .first()
        .isVisible()
        .catch(() => false);

    if (!tableExists) {
        await page.locator(SELECTORS.DEBUG_BUTTON).click({
            timeout: TIMEOUTS.BUTTON_CLICK,
        });
        await page.locator(SELECTORS.LOAD_SAMPLE_DATA_BUTTON).click({
            timeout: TIMEOUTS.BUTTON_CLICK,
        });
        await page.waitForSelector(SELECTORS.TABLE_ROWS, {
            timeout: TIMEOUTS.TABLE_LOAD,
        });
    }
}

export async function goOffline(
    context: BrowserContext,
    page: Page,
): Promise<void> {
    await context.setOffline(true);
    await page.waitForTimeout(TIMEOUTS.OFFLINE_WAIT);
}

export async function goOnline(
    context: BrowserContext,
    page: Page,
): Promise<void> {
    await context.setOffline(false);
    await page.waitForTimeout(TIMEOUTS.OFFLINE_WAIT);
}
