import { Store, queryDb } from "@livestore/livestore";
import { tables, events } from "../schema";
import {
    developmentSeedData,
    testSeedData,
    onboardingSeedData,
} from "./seed-data";

export type SeedResult = {
    success: boolean;
    seeded?: number;
    cleared?: number;
    skipped?: boolean;
    reason?: string;
    error?: string;
};

/**
 * Seed development data if the store is empty
 *
 * @param store - LiveStore instance
 * @returns Result of seeding operation
 */
export async function seedDevelopmentData(store: Store): Promise<SeedResult> {
    try {
        // Check if data already exists
        const existingEntries = await store.query(
            queryDb(tables.entries.limit(1)),
        );

        if (existingEntries.length > 0) {
            return {
                success: true,
                skipped: true,
                reason: "Data already exists",
            };
        }

        // Commit development seed events
        await store.commit(...developmentSeedData);

        return {
            success: true,
            seeded: developmentSeedData.length,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Clear all existing entries and seed test data
 *
 * @param store - LiveStore instance
 * @returns Result of seeding operation
 */
export async function seedTestData(store: Store): Promise<SeedResult> {
    try {
        // Get all active entries
        const activeEntries = await store.query(
            queryDb(tables.entries.where({ deletedAt: null })),
        );

        let clearedCount = 0;

        // Soft delete all existing entries if any exist
        if (activeEntries.length > 0) {
            const deleteEvents = activeEntries.map((entry: { id: string }) =>
                events.entryDeleted({
                    id: entry.id,
                    deletedAt: new Date(),
                }),
            );

            await store.commit(...deleteEvents);
            clearedCount = activeEntries.length;
        }

        // Commit test seed events
        await store.commit(...testSeedData);

        return {
            success: true,
            seeded: testSeedData.length,
            cleared: clearedCount,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Seed onboarding data for new users (optional sample data)
 * Clears existing onboarding entries before seeding to allow re-seeding
 *
 * @param store - LiveStore instance
 * @returns Result of seeding operation
 */
export async function seedOnboardingData(store: Store): Promise<SeedResult> {
    try {
        // Get all existing onboarding entries (they have IDs starting with "onboard-")
        const allEntries = await store.query(queryDb(tables.entries));
        const onboardingEntries = allEntries.filter((entry: { id: string }) =>
            entry.id.startsWith("onboard-"),
        );

        let clearedCount = 0;

        // Delete existing onboarding entries to allow re-seeding
        if (onboardingEntries.length > 0) {
            const deleteEvents = onboardingEntries.map(
                (entry: { id: string }) =>
                    events.entryDeleted({
                        id: entry.id,
                        deletedAt: new Date(),
                    }),
            );

            await store.commit(...deleteEvents);
            clearedCount = onboardingEntries.length;
        }

        // Commit onboarding seed events
        await store.commit(...onboardingSeedData);

        return {
            success: true,
            seeded: onboardingSeedData.length,
            cleared: clearedCount,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Clear all data by soft deleting all active entries
 *
 * @param store - LiveStore instance
 * @returns Result of clear operation
 */
export async function clearAllData(store: Store): Promise<SeedResult> {
    try {
        // Get all active entries
        const activeEntries = await store.query(
            queryDb(tables.entries.where({ deletedAt: null })),
        );

        if (activeEntries.length === 0) {
            return {
                success: true,
                cleared: 0,
            };
        }

        // Create delete events for all active entries
        const deleteEvents = activeEntries.map((entry: { id: string }) =>
            events.entryDeleted({
                id: entry.id,
                deletedAt: new Date(),
            }),
        );

        // Commit all delete events
        await store.commit(...deleteEvents);

        return {
            success: true,
            cleared: activeEntries.length,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Check if the store has any data
 *
 * @param store - LiveStore instance
 * @returns True if store has entries (including deleted ones)
 */
export async function hasData(store: Store): Promise<boolean> {
    try {
        const anyEntries = await store.query(queryDb(tables.entries.limit(1)));
        return anyEntries.length > 0;
    } catch (error) {
        console.error("Error checking for existing data:", error);
        return false;
    }
}

/**
 * Get statistics about current data in the store
 *
 * @param store - LiveStore instance
 * @returns Data statistics
 */
export async function getDataStats(store: Store): Promise<{
    total: number;
    active: number;
    deleted: number;
}> {
    try {
        const [totalEntries, activeEntries] = await Promise.all([
            store.query(queryDb(tables.entries)),
            store.query(queryDb(tables.entries.where({ deletedAt: null }))),
        ]);

        return {
            total: (totalEntries as unknown[]).length,
            active: (activeEntries as unknown[]).length,
            deleted:
                (totalEntries as unknown[]).length -
                (activeEntries as unknown[]).length,
        };
    } catch (error) {
        console.error("Error getting data stats:", error);
        return { total: 0, active: 0, deleted: 0 };
    }
}
