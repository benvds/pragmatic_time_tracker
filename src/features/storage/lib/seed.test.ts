import { describe, it, expect, vi, beforeEach } from "vitest";
import { seedDevelopmentData, seedTestData, clearAllData } from "./seed";
import { developmentSeedData, testSeedData } from "./seed-data";

// Mock the store
const mockStore = {
    query: vi.fn(),
    commit: vi.fn(),
};

describe("Seed Utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("seedDevelopmentData", () => {
        it("checks for existing data before seeding", async () => {
            // Mock empty store
            mockStore.query.mockResolvedValue([]);

            await seedDevelopmentData(mockStore as any);

            // Should check for existing entries
            expect(mockStore.query).toHaveBeenCalledOnce();
            expect(mockStore.commit).toHaveBeenCalledWith(
                ...developmentSeedData,
            );
        });

        it("skips seeding if data already exists", async () => {
            // Mock store with existing data
            mockStore.query.mockResolvedValue([
                { id: "existing-1", description: "Existing entry" },
            ]);

            const result = await seedDevelopmentData(mockStore as any);

            // Should check for existing entries but not commit
            expect(mockStore.query).toHaveBeenCalledOnce();
            expect(mockStore.commit).not.toHaveBeenCalled();
            expect(result).toEqual({
                success: true,
                skipped: true,
                reason: "Data already exists",
            });
        });

        it("commits development events if store is empty", async () => {
            mockStore.query.mockResolvedValue([]);

            const result = await seedDevelopmentData(mockStore as any);

            expect(mockStore.commit).toHaveBeenCalledWith(
                ...developmentSeedData,
            );
            expect(result).toEqual({
                success: true,
                seeded: developmentSeedData.length,
            });
        });

        it("handles errors gracefully", async () => {
            mockStore.query.mockRejectedValue(new Error("Database error"));

            const result = await seedDevelopmentData(mockStore as any);

            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });

        it("is idempotent - can be called multiple times safely", async () => {
            // First call - empty store
            mockStore.query.mockResolvedValueOnce([]);
            await seedDevelopmentData(mockStore as any);

            expect(mockStore.commit).toHaveBeenCalledWith(
                ...developmentSeedData,
            );

            // Reset mocks
            vi.clearAllMocks();

            // Second call - store has data now
            mockStore.query.mockResolvedValueOnce([
                { id: "dev-1", description: "Existing" },
            ]);
            const result = await seedDevelopmentData(mockStore as any);

            expect(mockStore.commit).not.toHaveBeenCalled();
            expect(result.skipped).toBe(true);
        });
    });

    describe("seedTestData", () => {
        it("clears existing entries before seeding", async () => {
            const existingEntries = [
                { id: "existing-1", description: "Old entry" },
                { id: "existing-2", description: "Another old entry" },
            ];

            mockStore.query.mockResolvedValue(existingEntries);

            await seedTestData(mockStore as any);

            // Should query existing entries
            expect(mockStore.query).toHaveBeenCalledOnce();

            // Should commit delete events for existing entries + test seed data
            expect(mockStore.commit).toHaveBeenCalledTimes(2);

            // First commit: delete existing entries
            const firstCommitCall = mockStore.commit.mock.calls[0];
            expect(firstCommitCall[0]).toMatchObject({
                name: "v1.EntryDeleted",
                args: { id: "existing-1" },
            });
            expect(firstCommitCall[1]).toMatchObject({
                name: "v1.EntryDeleted",
                args: { id: "existing-2" },
            });

            // Second commit: add test data
            const secondCommitCall = mockStore.commit.mock.calls[1];
            expect(secondCommitCall).toEqual(testSeedData);
        });

        it("seeds test data even if no existing entries", async () => {
            mockStore.query.mockResolvedValue([]);

            const result = await seedTestData(mockStore as any);

            // Should only commit test data (no deletes needed)
            expect(mockStore.commit).toHaveBeenCalledOnce();
            expect(mockStore.commit).toHaveBeenCalledWith(...testSeedData);
            expect(result).toEqual({
                success: true,
                seeded: testSeedData.length,
                cleared: 0,
            });
        });

        it("returns success status with counts", async () => {
            const existingEntries = [
                { id: "existing-1" },
                { id: "existing-2" },
            ];
            mockStore.query.mockResolvedValue(existingEntries);

            const result = await seedTestData(mockStore as any);

            expect(result).toEqual({
                success: true,
                seeded: testSeedData.length,
                cleared: 2,
            });
        });

        it("handles errors gracefully", async () => {
            mockStore.query.mockRejectedValue(new Error("Query failed"));

            const result = await seedTestData(mockStore as any);

            expect(result).toEqual({
                success: false,
                error: "Query failed",
            });
        });
    });

    describe("clearAllData", () => {
        it("soft deletes all active entries", async () => {
            const activeEntries = [
                { id: "entry-1", description: "Active 1" },
                { id: "entry-2", description: "Active 2" },
                { id: "entry-3", description: "Active 3" },
            ];

            mockStore.query.mockResolvedValue(activeEntries);

            const result = await clearAllData(mockStore as any);

            expect(mockStore.query).toHaveBeenCalledOnce();

            expect(mockStore.commit).toHaveBeenCalledOnce();

            const commitCall = mockStore.commit.mock.calls[0];
            expect(commitCall).toHaveLength(3);

            for (let index = 0; index < commitCall.length; index++) {
                const event = commitCall[index];
                expect(event.name).toBe("v1.EntryDeleted");
                expect(event.args.id).toBe(activeEntries[index].id);
                expect(event.args.deletedAt).toBeInstanceOf(Date);
            }

            expect(result).toEqual({ success: true, cleared: 3 });
        });

        it("handles empty store gracefully", async () => {
            mockStore.query.mockResolvedValue([]);

            const result = await clearAllData(mockStore as any);

            expect(mockStore.commit).not.toHaveBeenCalled();
            expect(result).toEqual({ success: true, cleared: 0 });
        });

        it("handles errors gracefully", async () => {
            mockStore.query.mockRejectedValue(new Error("Clear failed"));

            const result = await clearAllData(mockStore as any);

            expect(result).toEqual({
                success: false,
                error: "Clear failed",
            });
        });
    });

    describe("Seed Operations Integration", () => {
        it("can clear and then seed test data", async () => {
            // Setup existing data
            const existingEntries = [{ id: "old-1" }];
            mockStore.query.mockResolvedValue(existingEntries);

            // Clear all data
            await clearAllData(mockStore as any);
            expect(mockStore.commit).toHaveBeenCalledOnce();

            // Reset for second operation
            vi.clearAllMocks();
            mockStore.query.mockResolvedValue([]); // Now empty

            // Seed test data
            await seedTestData(mockStore as any);
            expect(mockStore.commit).toHaveBeenCalledWith(...testSeedData);
        });

        it("maintains data integrity across operations", async () => {
            // Each operation should maintain proper event structure
            mockStore.query.mockResolvedValue([{ id: "test-1" }]);

            await clearAllData(mockStore as any);

            const deleteEvent = mockStore.commit.mock.calls[0][0];
            expect(deleteEvent).toMatchObject({
                name: "v1.EntryDeleted",
                args: {
                    id: "test-1",
                    deletedAt: expect.any(Date),
                },
            });
        });
    });
});
