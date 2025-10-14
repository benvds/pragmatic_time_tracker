/**
 * Test seed data utilities for test setup and teardown
 *
 * This module re-exports test seed data and provides helper functions
 * for tests that need to work with seeded data.
 */

import { Store } from "@livestore/livestore";
import {
    testSeedData,
    seedTestData,
    clearAllData,
    getDataStats,
    SeedResult,
} from "@/features/storage";

// Re-export test seed data for direct access
export { testSeedData };

/**
 * Helper function to setup test data in a store
 *
 * Usage in tests:
 * ```typescript
 * import { setupTestData } from "@/tests/fixtures/test-seed-data";
 *
 * test("my test", async () => {
 *   const store = createTestStore();
 *   await setupTestData(store);
 *   // ... test with seeded data
 * });
 * ```
 *
 * @param store - LiveStore instance
 * @returns Result of seeding operation
 */
export async function setupTestData(store: Store): Promise<SeedResult> {
    return await seedTestData(store);
}

/**
 * Helper function to clear all data from a store
 *
 * Usage in tests:
 * ```typescript
 * import { clearTestData } from "@/tests/fixtures/test-seed-data";
 *
 * afterEach(async () => {
 *   await clearTestData(store);
 * });
 * ```
 *
 * @param store - LiveStore instance
 * @returns Result of clear operation
 */
export async function clearTestData(store: Store): Promise<SeedResult> {
    return await clearAllData(store);
}

/**
 * Get expected test data counts for assertions
 *
 * @returns Object with expected counts from test seed data
 */
export function getTestDataCounts() {
    const createdEvents = testSeedData.filter(
        (event) => event.type === "v1.EntryCreated",
    );
    const deletedEvents = testSeedData.filter(
        (event) => event.type === "v1.EntryDeleted",
    );

    return {
        totalCreated: createdEvents.length,
        totalDeleted: deletedEvents.length,
        expectedActive: createdEvents.length - deletedEvents.length,
        totalEvents: testSeedData.length,
    };
}

/**
 * Get test entries by ID for specific test scenarios
 *
 * @returns Map of test entry IDs to their descriptions
 */
export function getTestEntryMap() {
    const createdEvents = testSeedData.filter(
        (event) => event.type === "v1.EntryCreated",
    );
    const entryMap = new Map<
        string,
        { minutes: number; description: string; date: Date }
    >();

    createdEvents.forEach((event) => {
        entryMap.set(event.data.id, {
            minutes: event.data.minutes,
            description: event.data.description,
            date: event.data.date,
        });
    });

    return entryMap;
}

/**
 * Get edge case test entries for specific testing scenarios
 *
 * @returns Object with references to specific edge case entries
 */
export function getEdgeCaseEntries() {
    const createdEvents = testSeedData.filter(
        (event) => event.type === "v1.EntryCreated",
    );

    return {
        minimalDuration: createdEvents.find((e) => e.data.minutes === 1),
        maximalDuration: createdEvents.find((e) => e.data.minutes >= 1440),
        emptyDescription: createdEvents.find((e) => e.data.description === ""),
        longDescription: createdEvents.find(
            (e) => e.data.description.length > 500,
        ),
        weekendEntry: createdEvents.find(
            (e) => e.data.date.getDay() === 0 || e.data.date.getDay() === 6,
        ),
        specialChars: createdEvents.find((e) =>
            e.data.description.includes("@#$%"),
        ),
    };
}

/**
 * Verify test data integrity after seeding
 *
 * @param store - LiveStore instance
 * @returns True if test data is properly seeded
 */
export async function verifyTestData(store: Store): Promise<boolean> {
    try {
        const stats = await getDataStats(store);
        const expectedCounts = getTestDataCounts();

        // Verify we have the expected number of active entries
        return stats.active === expectedCounts.expectedActive;
    } catch (error) {
        console.error("Error verifying test data:", error);
        return false;
    }
}

/**
 * Create a consistent test environment with predictable data
 *
 * This function clears existing data and seeds test data,
 * ensuring a clean, predictable test environment.
 *
 * @param store - LiveStore instance
 * @returns Result of setup operation
 */
export async function createTestEnvironment(store: Store): Promise<{
    success: boolean;
    stats?: { active: number; deleted: number; total: number };
    error?: string;
}> {
    try {
        // Clear existing data and seed test data
        const seedResult = await setupTestData(store);

        if (!seedResult.success) {
            return {
                success: false,
                error: seedResult.error,
            };
        }

        // Get final stats
        const stats = await getDataStats(store);

        return {
            success: true,
            stats,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Example usage documentation
 *
 * ```typescript
 * // Setup test data before tests
 * beforeEach(async () => {
 *   await createTestEnvironment(store);
 * });
 *
 * // Test with specific edge cases
 * test("handles minimal duration", async () => {
 *   const edgeCases = getEdgeCaseEntries();
 *   expect(edgeCases.minimalDuration?.data.minutes).toBe(1);
 * });
 *
 * // Verify expected counts
 * test("has correct entry counts", async () => {
 *   const counts = getTestDataCounts();
 *   const stats = await getDataStats(store);
 *   expect(stats.active).toBe(counts.expectedActive);
 * });
 *
 * // Clean up after tests
 * afterEach(async () => {
 *   await clearTestData(store);
 * });
 * ```
 */
