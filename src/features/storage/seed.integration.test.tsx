import { describe, it, expect, vi } from "vitest";

import { seedDevelopmentData, seedTestData, clearAllData } from "./lib/seed";
import { developmentSeedData, testSeedData } from "./lib/seed-data";

describe("Seed Integration Tests", () => {
    // Note: These are simplified integration tests using mocked stores
    // E2E tests cover actual storage operations

    describe("Development Data Seeding", () => {
        it("seeds data when store is empty", async () => {
            const mockStore = {
                query: vi.fn().mockResolvedValue([]),
                commit: vi.fn().mockResolvedValue(undefined),
            };

            const result = await seedDevelopmentData(mockStore as any);

            expect(result.success).toBe(true);
            expect(result.seeded).toBe(developmentSeedData.length);
            expect(mockStore.commit).toHaveBeenCalledWith(
                ...developmentSeedData,
            );
        });

        it("skips seeding when data exists", async () => {
            const mockStore = {
                query: vi.fn().mockResolvedValue([{ id: "existing" }]),
                commit: vi.fn(),
            };

            const result = await seedDevelopmentData(mockStore as any);

            expect(result.success).toBe(true);
            expect(result.skipped).toBe(true);
            expect(mockStore.commit).not.toHaveBeenCalled();
        });

        it("maintains referential integrity of seed data", async () => {
            const mockStore = {
                query: vi.fn().mockResolvedValue([]),
                commit: vi.fn(),
            };

            await seedDevelopmentData(mockStore as any);

            const committedEvents = mockStore.commit.mock.calls[0];

            expect(committedEvents.length).toBeGreaterThan(0);
            for (const event of committedEvents) {
                expect(event).toHaveProperty("name", "v1.EntryCreated");
                expect(event.args).toHaveProperty("id");
                expect(event.args).toHaveProperty("date");
                expect(event.args).toHaveProperty("minutes");
                expect(event.args).toHaveProperty("description");
            }
        });
    });

    describe("Test Data Seeding", () => {
        it("clears existing data and seeds test data", async () => {
            const existingEntries = [
                { id: "old-1", description: "Old entry" },
                { id: "old-2", description: "Another old entry" },
            ];

            const mockStore = {
                query: vi.fn().mockResolvedValue(existingEntries),
                commit: vi.fn().mockResolvedValue(undefined),
            };

            const result = await seedTestData(mockStore as any);

            expect(result.success).toBe(true);
            expect(result.cleared).toBe(2);
            expect(result.seeded).toBe(testSeedData.length);

            // Should have been called twice: once for deletes, once for seeds
            expect(mockStore.commit).toHaveBeenCalledTimes(2);
        });

        it("handles empty store correctly", async () => {
            const mockStore = {
                query: vi.fn().mockResolvedValue([]),
                commit: vi.fn().mockResolvedValue(undefined),
            };

            const result = await seedTestData(mockStore as any);

            expect(result.success).toBe(true);
            expect(result.cleared).toBe(0);
            expect(result.seeded).toBe(testSeedData.length);

            // Should only be called once for seeding (no deletes needed)
            expect(mockStore.commit).toHaveBeenCalledOnce();
            expect(mockStore.commit).toHaveBeenCalledWith(...testSeedData);
        });

        it("validates test data structure", async () => {
            const mockStore = {
                query: vi.fn().mockResolvedValue([]),
                commit: vi.fn(),
            };

            await seedTestData(mockStore as any);

            const committedEvents = mockStore.commit.mock.calls[0];

            // Test data should include both created and deleted events
            const createdEvents = committedEvents.filter(
                (e: any) => e.name === "v1.EntryCreated",
            );
            const deletedEvents = committedEvents.filter(
                (e: any) => e.name === "v1.EntryDeleted",
            );

            expect(createdEvents.length).toBeGreaterThan(0);
            expect(deletedEvents.length).toBeGreaterThan(0);

            // Verify created events have edge cases
            const hasMinimalDuration = createdEvents.some(
                (e: any) => e.args.minutes === 1,
            );
            const hasEmptyDescription = createdEvents.some(
                (e: any) => e.args.description === "",
            );

            expect(hasMinimalDuration).toBe(true);
            expect(hasEmptyDescription).toBe(true);
        });
    });

    describe("Clear All Data", () => {
        it("soft deletes all active entries", async () => {
            const activeEntries = [
                { id: "active-1" },
                { id: "active-2" },
                { id: "active-3" },
            ];

            const mockStore = {
                query: vi.fn().mockResolvedValue(activeEntries),
                commit: vi.fn().mockResolvedValue(undefined),
            };

            const result = await clearAllData(mockStore as any);

            expect(result.success).toBe(true);
            expect(result.cleared).toBe(3);

            const deleteEvents = mockStore.commit.mock.calls[0];
            expect(deleteEvents).toHaveLength(3);

            for (let index = 0; index < deleteEvents.length; index++) {
                const event = deleteEvents[index];
                expect(event.name).toBe("v1.EntryDeleted");
                expect(event.args.id).toBe(activeEntries[index].id);
                expect(event.args.deletedAt).toBeInstanceOf(Date);
            }
        });
    });

    describe("Seed Data Validation", () => {
        it("development seed data has required properties", () => {
            expect(developmentSeedData.length).toBeGreaterThan(0);
            for (const event of developmentSeedData) {
                expect(event.name).toBe("v1.EntryCreated");
                expect(event.args.id).toMatch(/^dev-\d+$/);
                expect(event.args.date).toBeInstanceOf(Date);
                expect(typeof event.args.minutes).toBe("number");
                expect(typeof event.args.description).toBe("string");
                expect(event.args.minutes).toBeGreaterThan(0);
                expect(event.args.description.length).toBeGreaterThan(0);
            }
        });

        it("test seed data includes edge cases and deletions", () => {
            const createdEvents = testSeedData.filter(
                (e) => e.name === "v1.EntryCreated",
            );
            const deletedEvents = testSeedData.filter(
                (e) => e.name === "v1.EntryDeleted",
            );

            expect(createdEvents.length).toBeGreaterThan(0);
            expect(deletedEvents.length).toBeGreaterThan(0);

            // Verify edge cases exist
            const hasMinimalDuration = createdEvents.some(
                (e) => e.args.minutes === 1,
            );
            const hasEmptyDescription = createdEvents.some(
                (e) => e.args.description === "",
            );
            const hasMaxDuration = createdEvents.some(
                (e) => e.args.minutes >= 1440,
            );

            expect(hasMinimalDuration).toBe(true);
            expect(hasEmptyDescription).toBe(true);
            expect(hasMaxDuration).toBe(true);
        });
    });
});
