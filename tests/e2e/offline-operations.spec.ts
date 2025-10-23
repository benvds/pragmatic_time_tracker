import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { clearAllStorage } from "../helpers/clear-storage";

const OFFLINE_WAIT_TIME = 500;
const NON_CRITICAL_ERROR_PATTERNS = [
    "favicon",
    "livereload",
    "net::ERR_",
    "Failed to fetch",
    "WorkerError",
];

async function verifyAppLoaded(page: Page) {
    await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
    await expect(page.locator("table")).toBeVisible();
}

async function verifyTableHeaders(page: Page) {
    await expect(page.locator("th", { hasText: "Date" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Duration" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Description" })).toBeVisible();
}

async function goOffline(context: BrowserContext, page: Page) {
    await context.setOffline(true);
    await page.waitForTimeout(OFFLINE_WAIT_TIME);
}

async function goOnline(context: BrowserContext, page: Page) {
    await context.setOffline(false);
    await page.waitForTimeout(OFFLINE_WAIT_TIME);
}

function isNonCriticalError(error: string): boolean {
    return NON_CRITICAL_ERROR_PATTERNS.some((pattern) =>
        error.includes(pattern),
    );
}

test.describe("Offline Operations", () => {
    let storageCleared = false;

    test.beforeEach(async ({ page }) => {
        if (!storageCleared) {
            await page.goto("/");
            await clearAllStorage(page);
            storageCleared = true;
        }
    });

    test("app loads and functions when going offline", async ({
        page,
        context,
    }) => {
        await page.goto("/");
        await verifyAppLoaded(page);

        await goOffline(context, page);

        await verifyAppLoaded(page);
        await verifyTableHeaders(page);
    });

    test("app loads when external domains are offline but localhost is online", async ({
        page,
        context,
    }) => {
        await context.route("**/*", (route) => {
            const url = route.request().url();
            if (url.includes("localhost") || url.includes("127.0.0.1")) {
                route.continue();
            } else {
                route.abort("failed");
            }
        });

        await page.goto("/");
        await verifyAppLoaded(page);

        await page.reload();
        await verifyAppLoaded(page);
    });

    test("page maintains state when going offline", async ({
        page,
        context,
    }) => {
        await page.goto("/");
        await verifyAppLoaded(page);

        await goOffline(context, page);

        await verifyAppLoaded(page);
    });

    test("handles network state changes gracefully", async ({
        page,
        context,
    }) => {
        await verifyAppLoaded(page);

        await goOffline(context, page);
        await expect(page.locator("table")).toBeVisible();

        await goOnline(context, page);
        await verifyAppLoaded(page);
    });

    test("displays consistent UI state across offline/online transitions", async ({
        page,
        context,
    }) => {
        const initialTitle = await page.locator("h1").textContent();
        const initialTableVisible = await page.locator("table").isVisible();

        await goOffline(context, page);
        expect(await page.locator("h1").textContent()).toBe(initialTitle);
        expect(await page.locator("table").isVisible()).toBe(
            initialTableVisible,
        );

        await goOnline(context, page);
        expect(await page.locator("h1").textContent()).toBe(initialTitle);
        expect(await page.locator("table").isVisible()).toBe(
            initialTableVisible,
        );
    });

    test("no critical errors when offline", async ({ page, context }) => {
        const errors: string[] = [];

        await page.goto("/");

        page.on("console", (msg) => {
            if (msg.type() === "error") {
                errors.push(msg.text());
            }
        });

        await goOffline(context, page);
        await page.waitForTimeout(500);

        const criticalErrors = errors.filter(
            (error) => !isNonCriticalError(error),
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test("maintains performance when offline", async ({ page, context }) => {
        await page.goto("/");
        await verifyAppLoaded(page);

        await context.setOffline(true);

        const startTime = Date.now();
        await page.waitForTimeout(100);
        await expect(page.locator("h1")).toContainText("Time Tracker Logbook");
        const responseTime = Date.now() - startTime;

        expect(responseTime).toBeLessThan(1000);
    });
});
