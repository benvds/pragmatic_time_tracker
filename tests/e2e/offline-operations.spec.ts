import { test, expect } from "@playwright/test";
import { SELECTORS } from "../helpers/selectors";
import { goOffline, goOnline } from "../helpers/app-actions";
import { verifyAppLoaded, verifyTableHeaders } from "../helpers/app-assertions";
import { filterCriticalErrors } from "../helpers/error-filtering";

test.describe("Offline Operations", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
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
        await expect(page.locator(SELECTORS.TABLE)).toBeVisible();

        await goOnline(context, page);
        await verifyAppLoaded(page);
    });

    test("displays consistent UI state across offline/online transitions", async ({
        page,
        context,
    }) => {
        const initialTitle = await page.locator(SELECTORS.TITLE).textContent();
        const initialTableVisible = await page
            .locator(SELECTORS.TABLE)
            .isVisible();

        await goOffline(context, page);
        expect(await page.locator(SELECTORS.TITLE).textContent()).toBe(
            initialTitle,
        );
        expect(await page.locator(SELECTORS.TABLE).isVisible()).toBe(
            initialTableVisible,
        );

        await goOnline(context, page);
        expect(await page.locator(SELECTORS.TITLE).textContent()).toBe(
            initialTitle,
        );
        expect(await page.locator(SELECTORS.TABLE).isVisible()).toBe(
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

        const criticalErrors = filterCriticalErrors(errors);

        expect(criticalErrors).toHaveLength(0);
    });

    test("maintains performance when offline", async ({ page, context }) => {
        await page.goto("/");
        await verifyAppLoaded(page);

        await context.setOffline(true);

        const startTime = Date.now();
        await page.waitForTimeout(100);
        await expect(page.locator(SELECTORS.TITLE)).toContainText(
            "Time Tracker Logbook",
        );
        const responseTime = Date.now() - startTime;

        expect(responseTime).toBeLessThan(1000);
    });
});
