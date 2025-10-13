import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { LiveStoreProvider } from "@livestore/react";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { unstable_batchedUpdates } from "react-dom";

import { seedDevelopmentData, seedTestData, clearAllData } from "./lib/seed";
import { developmentSeedData, testSeedData } from "./lib/seed-data";
import { useEntries } from "./hooks/use-entries";

// Mock worker imports
const mockWorker = {} as Worker;
const mockSharedWorker = {} as SharedWorker;

vi.mock("./livestore.worker?worker", () => ({
    default: mockWorker,
}));

vi.mock("@livestore/adapter-web/shared-worker?sharedworker", () => ({
    default: mockSharedWorker,
}));

// Create test adapter
const createTestAdapter = () => {
    return makePersistedAdapter({
        storage: { type: "opfs" },
        worker: mockWorker,
        sharedWorker: mockSharedWorker,
    });
};

// Test component to verify seeded data
function TestEntriesComponent() {
    const entries = useEntries();

    return (
        <div>
            <div data-testid="entries-count">{entries.length}</div>
            {entries.map((entry) => (
                <div key={entry.id} data-testid={`entry-${entry.id}`}>
                    {entry.description}
                </div>
            ))}
        </div>
    );
}

describe("Seed Integration Tests", () => {
    const renderWithProvider = (component: React.ReactElement) => {
        const adapter = createTestAdapter();
        return render(
            <LiveStoreProvider
                adapter={adapter}
                batchUpdates={unstable_batchedUpdates}
            >
                {component}
            </LiveStoreProvider>,
        );
    };

    // Note: These are simplified integration tests since we're mocking the LiveStore worker
    // In a real environment, these would test actual storage operations

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

            // Verify all events are properly structured
            committedEvents.forEach((event: any) => {
                expect(event).toHaveProperty("type", "v1.EntryCreated");
                expect(event.data).toHaveProperty("id");
                expect(event.data).toHaveProperty("date");
                expect(event.data).toHaveProperty("minutes");
                expect(event.data).toHaveProperty("description");
            });
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
                (e: any) => e.type === "v1.EntryCreated",
            );
            const deletedEvents = committedEvents.filter(
                (e: any) => e.type === "v1.EntryDeleted",
            );

            expect(createdEvents.length).toBeGreaterThan(0);
            expect(deletedEvents.length).toBeGreaterThan(0);

            // Verify created events have edge cases
            const hasMinimalDuration = createdEvents.some(
                (e: any) => e.data.minutes === 1,
            );
            const hasEmptyDescription = createdEvents.some(
                (e: any) => e.data.description === "",
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

            // Should commit delete events for each active entry
            const deleteEvents = mockStore.commit.mock.calls[0];
            expect(deleteEvents).toHaveLength(3);

            deleteEvents.forEach((event: any, index: number) => {
                expect(event.type).toBe("v1.EntryDeleted");
                expect(event.data.id).toBe(activeEntries[index].id);
                expect(event.data.deletedAt).toBeInstanceOf(Date);
            });
        });
    });

    describe("Component Integration", () => {
        it("renders with mocked LiveStore provider", () => {
            // This test verifies the test setup works
            const { container } = renderWithProvider(<TestEntriesComponent />);

            expect(container).toBeInTheDocument();
            // With mocked store, entries count should be 0
            expect(
                container.querySelector('[data-testid="entries-count"]'),
            ).toHaveTextContent("0");
        });

        it("component structure supports seeded data display", () => {
            // Verify component can handle entry data structure
            const { container } = renderWithProvider(<TestEntriesComponent />);

            // Component should be ready to display entries
            expect(
                container.querySelector('[data-testid="entries-count"]'),
            ).toBeInTheDocument();
        });
    });

    describe("Seed Data Validation", () => {
        it("development seed data has required properties", () => {
            developmentSeedData.forEach((event) => {
                expect(event.type).toBe("v1.EntryCreated");
                expect(event.data.id).toMatch(/^dev-\d+$/);
                expect(event.data.date).toBeInstanceOf(Date);
                expect(typeof event.data.minutes).toBe("number");
                expect(typeof event.data.description).toBe("string");
                expect(event.data.minutes).toBeGreaterThan(0);
                expect(event.data.description.length).toBeGreaterThan(0);
            });
        });

        it("test seed data includes edge cases and deletions", () => {
            const createdEvents = testSeedData.filter(
                (e) => e.type === "v1.EntryCreated",
            );
            const deletedEvents = testSeedData.filter(
                (e) => e.type === "v1.EntryDeleted",
            );

            expect(createdEvents.length).toBeGreaterThan(0);
            expect(deletedEvents.length).toBeGreaterThan(0);

            // Verify edge cases exist
            const hasMinimalDuration = createdEvents.some(
                (e) => e.data.minutes === 1,
            );
            const hasEmptyDescription = createdEvents.some(
                (e) => e.data.description === "",
            );
            const hasMaxDuration = createdEvents.some(
                (e) => e.data.minutes >= 1440,
            );

            expect(hasMinimalDuration).toBe(true);
            expect(hasEmptyDescription).toBe(true);
            expect(hasMaxDuration).toBe(true);
        });
    });
});
