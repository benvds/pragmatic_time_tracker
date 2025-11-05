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
        it("commits development events", () => {
            const result = seedDevelopmentData(mockStore as any);

            expect(mockStore.commit).toHaveBeenCalledWith(
                ...developmentSeedData,
            );
            expect(result).toEqual({
                success: true,
                seeded: developmentSeedData.length,
            });
        });

        it("can be called multiple times", () => {
            // First call
            seedDevelopmentData(mockStore as any);
            expect(mockStore.commit).toHaveBeenCalledWith(
                ...developmentSeedData,
            );

            // Reset mocks
            vi.clearAllMocks();

            // Second call - will create duplicate events
            const result = seedDevelopmentData(mockStore as any);
            expect(mockStore.commit).toHaveBeenCalledWith(
                ...developmentSeedData,
            );
            expect(result.success).toBe(true);
        });
    });

    describe("seedTestData", () => {
        it("clears existing entries before seeding", () => {
            const existingEntries = [
                { id: "existing-1", description: "Old entry" },
                { id: "existing-2", description: "Another old entry" },
            ];

            mockStore.query.mockReturnValue(existingEntries);

            const result = seedTestData(mockStore as any);

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

            expect(result).toEqual({
                success: true,
                seeded: testSeedData.length,
                cleared: 2,
            });
        });

        it("seeds test data even if no existing entries", () => {
            mockStore.query.mockReturnValue([]);

            const result = seedTestData(mockStore as any);

            // Should only commit test data (no deletes needed)
            expect(mockStore.commit).toHaveBeenCalledOnce();
            expect(mockStore.commit).toHaveBeenCalledWith(...testSeedData);
            expect(result).toEqual({
                success: true,
                seeded: testSeedData.length,
                cleared: 0,
            });
        });

        it("returns success status with counts", () => {
            const existingEntries = [
                { id: "existing-1" },
                { id: "existing-2" },
            ];
            mockStore.query.mockReturnValue(existingEntries);

            const result = seedTestData(mockStore as any);

            expect(result).toEqual({
                success: true,
                seeded: testSeedData.length,
                cleared: 2,
            });
        });

        it("handles errors gracefully", () => {
            mockStore.query.mockImplementation(() => {
                throw new Error("Query failed");
            });

            const result = seedTestData(mockStore as any);

            expect(result).toEqual({
                success: false,
                error: "Query failed",
            });
        });
    });

    describe("clearAllData", () => {
        it("soft deletes all active entries", () => {
            const activeEntries = [
                { id: "entry-1", description: "Active 1" },
                { id: "entry-2", description: "Active 2" },
                { id: "entry-3", description: "Active 3" },
            ];

            mockStore.query.mockReturnValue(activeEntries);

            const result = clearAllData(mockStore as any);

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

        it("handles empty store gracefully", () => {
            mockStore.query.mockReturnValue([]);

            const result = clearAllData(mockStore as any);

            expect(mockStore.commit).not.toHaveBeenCalled();
            expect(result).toEqual({ success: true, cleared: 0 });
        });

        it("handles errors gracefully", () => {
            mockStore.query.mockImplementation(() => {
                throw new Error("Clear failed");
            });

            const result = clearAllData(mockStore as any);

            expect(result).toEqual({
                success: false,
                error: "Clear failed",
            });
        });
    });

    describe("Seed Operations Integration", () => {
        it("can clear and then seed test data", () => {
            // Setup existing data
            const existingEntries = [{ id: "old-1" }];
            mockStore.query.mockReturnValue(existingEntries);

            // Clear all data
            clearAllData(mockStore as any);
            expect(mockStore.commit).toHaveBeenCalledOnce();

            // Reset for second operation
            vi.clearAllMocks();
            mockStore.query.mockReturnValue([]); // Now empty

            // Seed test data
            seedTestData(mockStore as any);
            expect(mockStore.commit).toHaveBeenCalledWith(...testSeedData);
        });

        it("maintains data integrity across operations", () => {
            // Each operation should maintain proper event structure
            mockStore.query.mockReturnValue([{ id: "test-1" }]);

            clearAllData(mockStore as any);

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
