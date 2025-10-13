import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUpdateEntry } from "./use-update-entry";

// Mock the @livestore/react module
const mockCommit = vi.fn();
vi.mock("@livestore/react", () => ({
    useStore: () => ({
        store: {
            commit: mockCommit,
        },
    }),
}));

describe("useUpdateEntry", () => {
    it("should return an update function", () => {
        const { result } = renderHook(() => useUpdateEntry());

        expect(typeof result.current).toBe("function");
    });

    it("should commit entryUpdated event with partial data", async () => {
        const { result } = renderHook(() => useUpdateEntry());

        await act(async () => {
            await result.current("test-id", {
                minutes: 90,
            });
        });

        expect(mockCommit).toHaveBeenCalled();
        const call = mockCommit.mock.calls[0];
        expect(call[0].payload.id).toBe("test-id");
        expect(call[0].payload.minutes).toBe(90);
    });

    it("should support updating date", async () => {
        const { result } = renderHook(() => useUpdateEntry());
        const newDate = new Date("2025-10-13");

        await act(async () => {
            await result.current("test-id", {
                date: newDate,
            });
        });

        const call = mockCommit.mock.calls[0];
        expect(call[0].payload.date).toBeDefined();
    });

    it("should support updating description", async () => {
        const { result } = renderHook(() => useUpdateEntry());

        await act(async () => {
            await result.current("test-id", {
                description: "Updated description",
            });
        });

        const call = mockCommit.mock.calls[0];
        expect(call[0].payload.description).toBe("Updated description");
    });

    it("should handle validation errors", async () => {
        // This will be implemented with validation
        expect(true).toBe(true);
    });
});
