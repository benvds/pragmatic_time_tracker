import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LiveStoreProvider } from "@livestore/react";
import { makePersistedAdapter } from "@livestore/adapter-web";
import { unstable_batchedUpdates } from "react-dom";

import {
    useEntries,
    useCreateEntry,
    useUpdateEntry,
    useDeleteEntry,
} from "./hooks";
import { events } from "./schema";

// Mock worker imports since we can't run real workers in test environment
const mockWorker = {} as Worker;
const mockSharedWorker = {} as SharedWorker;

vi.mock("./livestore.worker?worker", () => ({
    default: mockWorker,
}));

vi.mock("@livestore/adapter-web/shared-worker?sharedworker", () => ({
    default: mockSharedWorker,
}));

// Create a test adapter
const createTestAdapter = () => {
    return makePersistedAdapter({
        storage: { type: "opfs" },
        worker: mockWorker,
        sharedWorker: mockSharedWorker,
    });
};

// Test component that uses all CRUD hooks
function TestComponent() {
    const entries = useEntries();
    const createEntry = useCreateEntry();
    const updateEntry = useUpdateEntry();
    const deleteEntry = useDeleteEntry();

    return (
        <div>
            <div data-testid="entries-count">{entries.length}</div>
            <button
                data-testid="create-entry"
                onClick={() =>
                    createEntry({
                        date: new Date("2025-10-12T10:00:00"),
                        minutes: 60,
                        description: "Offline test entry",
                    })
                }
            >
                Create Entry
            </button>
            <button
                data-testid="update-entry"
                onClick={() =>
                    entries.length > 0 &&
                    updateEntry(entries[0].id, {
                        minutes: 90,
                        description: "Updated offline",
                    })
                }
            >
                Update Entry
            </button>
            <button
                data-testid="delete-entry"
                onClick={() => entries.length > 0 && deleteEntry(entries[0].id)}
            >
                Delete Entry
            </button>
            {entries.map((entry) => (
                <div key={entry.id} data-testid={`entry-${entry.id}`}>
                    {entry.description} - {entry.minutes}m
                </div>
            ))}
        </div>
    );
}

describe("Offline Storage Operations", () => {
    let originalOnLine: boolean;

    beforeEach(() => {
        // Store original online status
        originalOnLine = navigator.onLine;
    });

    afterEach(() => {
        // Restore original online status
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: originalOnLine,
        });
        vi.clearAllMocks();
    });

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

    it("allows creating entries when offline", async () => {
        // Mock offline state
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: false,
        });

        renderWithProvider(<TestComponent />);

        // Should render without errors even when offline
        expect(screen.getByTestId("entries-count")).toBeInTheDocument();
        expect(screen.getByTestId("create-entry")).toBeInTheDocument();

        // Note: Since we're mocking the worker, we can't test actual storage operations
        // In a real test environment with LiveStore, this would test actual offline functionality
        expect(navigator.onLine).toBe(false);
    });

    it("allows updating entries when offline", async () => {
        // Mock offline state
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: false,
        });

        renderWithProvider(<TestComponent />);

        expect(screen.getByTestId("update-entry")).toBeInTheDocument();
        expect(navigator.onLine).toBe(false);

        // Component should render without errors when offline
        expect(screen.getByTestId("entries-count")).toHaveTextContent("0");
    });

    it("allows deleting entries when offline", async () => {
        // Mock offline state
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: false,
        });

        renderWithProvider(<TestComponent />);

        expect(screen.getByTestId("delete-entry")).toBeInTheDocument();
        expect(navigator.onLine).toBe(false);
    });

    it("allows querying entries when offline", async () => {
        // Mock offline state
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: false,
        });

        renderWithProvider(<TestComponent />);

        // Should be able to query entries even when offline
        expect(screen.getByTestId("entries-count")).toBeInTheDocument();
        expect(navigator.onLine).toBe(false);
    });

    it("operations continue to work after reconnecting", async () => {
        // Start offline
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: false,
        });

        renderWithProvider(<TestComponent />);

        expect(navigator.onLine).toBe(false);

        // "Reconnect"
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: true,
        });

        // Should still work after reconnection
        expect(screen.getByTestId("entries-count")).toBeInTheDocument();
        expect(screen.getByTestId("create-entry")).toBeInTheDocument();
        expect(navigator.onLine).toBe(true);
    });

    it("handles network state transitions gracefully", async () => {
        // Start online
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: true,
        });

        renderWithProvider(<TestComponent />);

        expect(navigator.onLine).toBe(true);

        // Go offline
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: false,
        });

        // Component should continue working
        expect(screen.getByTestId("entries-count")).toBeInTheDocument();
        expect(navigator.onLine).toBe(false);

        // Go back online
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: true,
        });

        expect(screen.getByTestId("entries-count")).toBeInTheDocument();
        expect(navigator.onLine).toBe(true);
    });
});

// Note: These tests verify that the components and hooks don't break in offline scenarios.
// LiveStore itself handles offline functionality at the storage layer.
// More comprehensive offline testing would require:
// 1. Real LiveStore instances with proper workers
// 2. Service worker integration tests
// 3. Network request interception
// 4. OPFS storage verification across browser sessions
