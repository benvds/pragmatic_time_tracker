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
export function seedDevelopmentData(store: Store): SeedResult {
    // Commit development seed events
    store.commit(...developmentSeedData);

    return {
        success: true,
        seeded: developmentSeedData.length,
    };
}

/**
 * Clear all existing entries and seed test data
 *
 * @param store - LiveStore instance
 * @returns Result of seeding operation
 */
export function seedTestData(store: Store): SeedResult {
    try {
        // Get all active entries
        const activeEntries = store.query(
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

            store.commit(...deleteEvents);
            clearedCount = activeEntries.length;
        }

        // Commit test seed events
        store.commit(...testSeedData);

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
export function seedOnboardingData(store: Store): SeedResult {
    try {
        const allEntries = store.query(queryDb(tables.entries));
        const onboardingIds = new Set(
            onboardingSeedData.map((event) => event.args.id),
        );
        const existingOnboardingEntries = allEntries.filter(
            (entry: { id: string }) => onboardingIds.has(entry.id),
        );

        if (existingOnboardingEntries.length > 0) {
            return {
                success: true,
                skipped: true,
                reason: "Onboarding data already exists",
            };
        }

        store.commit(...onboardingSeedData);

        return {
            success: true,
            seeded: onboardingSeedData.length,
            cleared: 0,
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
export function clearAllData(store: Store): SeedResult {
    try {
        // Get all active entries
        const activeEntries = store.query(
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
        store.commit(...deleteEvents);

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
export function hasData(store: Store): boolean {
    try {
        const anyEntries = store.query(queryDb(tables.entries.limit(1)));
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
export function getDataStats(store: Store): {
    total: number;
    active: number;
    deleted: number;
} {
    try {
        const totalEntries = store.query(queryDb(tables.entries));
        const activeEntries = store.query(
            queryDb(tables.entries.where({ deletedAt: null })),
        );

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
