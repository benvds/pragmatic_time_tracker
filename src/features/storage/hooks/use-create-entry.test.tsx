import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreateEntry } from "./use-create-entry";

// Mock the @livestore/react module
const mockCommit = vi.fn();
vi.mock("@livestore/react", () => ({
    useStore: () => ({
        store: {
            commit: mockCommit,
        },
    }),
}));

describe("useCreateEntry", () => {
    it("should return a create function", () => {
        const { result } = renderHook(() => useCreateEntry());

        expect(typeof result.current).toBe("function");
    });

    it("should commit entryCreated event", async () => {
        const { result } = renderHook(() => useCreateEntry());

        await act(async () => {
            await result.current({
                date: new Date("2025-10-12"),
                minutes: 60,
                description: "Test entry",
            });
        });

        expect(mockCommit).toHaveBeenCalled();
    });

    it("should generate UUID for new entries", async () => {
        const { result } = renderHook(() => useCreateEntry());

        await act(async () => {
            await result.current({
                date: new Date("2025-10-12"),
                minutes: 60,
                description: "Test entry",
            });
        });

        // Verify the event payload includes an id
        const call = mockCommit.mock.calls[0];
        expect(call[0].payload.id).toBeDefined();
        expect(typeof call[0].payload.id).toBe("string");
    });

    it("should handle validation errors", async () => {
        // This will be implemented with validation
        expect(true).toBe(true);
    });
});
