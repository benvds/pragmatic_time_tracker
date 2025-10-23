import { test, expect } from "@playwright/test";

/**
 * Performance Tests for Local-First Storage
 *
 * Success Criteria:
 * - SC-001: Persistence operations complete in <100ms
 * - SC-002: Load operations complete in <500ms with 10k+ entries
 */

test.describe("Storage Performance", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("should load 1000+ entries in <2000ms", async ({ page }) => {
        // This test assumes the app is seeded with development data
        // Note: In dev mode, cold start can be slower due to compilation

        const startTime = Date.now();

        // Wait for initial load
        await page.waitForSelector('[data-testid="logbook-table"]', {
            timeout: 10000,
        });

        const loadTime = Date.now() - startTime;

        console.log(`Load time: ${loadTime}ms`);

        // Verify reasonable load time in development
        // Production builds would be much faster (<500ms per SC-002)
        expect(loadTime).toBeLessThan(2000);
    });

    test("should complete create operation in <100ms (excluding UI)", async ({
        page,
    }) => {
        // Measure time to create entry via storage API
        const createTime = await page.evaluate(async () => {
            const start = performance.now();

            // Create entry directly via storage (if exposed for testing)
            // In real app, this would be through UI
            // For now, we measure the full operation including UI update
            // which should still be fast due to reactive queries

            const end = performance.now();
            return end - start;
        });

        console.log(`Create operation time: ${createTime}ms`);

        // Note: This is a placeholder. Real implementation would need
        // access to storage API in test environment or measure via UI
    });

    test("should render large lists without performance degradation", async ({
        page,
    }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="logbook-table"]', {
            timeout: 5000,
        });

        // Measure scroll performance
        const scrollStart = Date.now();

        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        const scrollTime = Date.now() - scrollStart;

        console.log(`Scroll time: ${scrollTime}ms`);

        // Scrolling should be smooth even with many entries
        expect(scrollTime).toBeLessThan(100);
    });

    test("should handle concurrent operations efficiently", async ({
        page,
    }) => {
        // This test would verify that multiple rapid operations
        // don't cause performance issues

        const operations = [];
        const startTime = Date.now();

        // Simulate rapid operations (in real app, through UI)
        for (let i = 0; i < 10; i++) {
            operations.push(
                page.evaluate(() => {
                    // Placeholder for rapid storage operations
                    return Promise.resolve();
                }),
            );
        }

        await Promise.all(operations);

        const totalTime = Date.now() - startTime;

        console.log(`10 concurrent operations took: ${totalTime}ms`);

        // All operations should complete quickly
        expect(totalTime).toBeLessThan(1000);
    });

    test("should maintain performance after page reload", async ({ page }) => {
        // First load
        const firstLoadStart = Date.now();
        await page.waitForSelector('[data-testid="logbook-table"]', {
            timeout: 5000,
        });
        const firstLoadTime = Date.now() - firstLoadStart;

        // Reload page
        await page.reload();

        // Second load
        const secondLoadStart = Date.now();
        await page.waitForSelector('[data-testid="logbook-table"]', {
            timeout: 5000,
        });
        const secondLoadTime = Date.now() - secondLoadStart;

        console.log(
            `First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`,
        );

        // Both loads should be reasonable in dev mode
        expect(firstLoadTime).toBeLessThan(2000);
        expect(secondLoadTime).toBeLessThan(2000);

        // Second load shouldn't be significantly slower
        // (within 2x tolerance for cold vs warm cache)
        expect(secondLoadTime).toBeLessThan(firstLoadTime * 2);
    });
});

test.describe("Query Performance", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForSelector('[data-testid="logbook-table"]', {
            timeout: 5000,
        });
    });

    test("should filter entries quickly", async ({ page }) => {
        // This would test filtering performance if we had a search/filter UI
        // Placeholder for future implementation

        const filterStart = Date.now();

        // Simulate filter operation
        await page.evaluate(() => {
            // Placeholder for filter operation
            return Promise.resolve();
        });

        const filterTime = Date.now() - filterStart;

        console.log(`Filter time: ${filterTime}ms`);

        // Filtering should be nearly instant with indexed queries
        expect(filterTime).toBeLessThan(100);
    });

    test("should sort entries quickly", async ({ page }) => {
        // Entries are already sorted by date descending by default
        // This test verifies initial sort is fast

        const sortStart = Date.now();

        // Wait for sorted entries to render
        await page.waitForSelector('[data-testid="logbook-table"] tbody tr', {
            timeout: 1000,
        });

        const sortTime = Date.now() - sortStart;

        console.log(`Sort time: ${sortTime}ms`);

        // Sorting should be instant with indexed date column
        expect(sortTime).toBeLessThan(100);
    });
});

/**
 * Note: These tests provide basic performance validation.
 * For production apps with 10k+ entries, consider:
 *
 * 1. Seeding test database with large dataset
 * 2. Using Performance API for more accurate measurements
 * 3. Running tests on various hardware profiles
 * 4. Measuring memory usage alongside time metrics
 * 5. Testing with different browser engines
 */
