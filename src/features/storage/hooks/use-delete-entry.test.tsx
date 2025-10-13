import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeleteEntry } from "./use-delete-entry";

// Mock the @livestore/react module
const mockCommit = vi.fn();
vi.mock("@livestore/react", () => ({
    useStore: () => ({
        store: {
            commit: mockCommit,
        },
    }),
}));

describe("useDeleteEntry", () => {
    it("should return a delete function", () => {
        const { result } = renderHook(() => useDeleteEntry());

        expect(typeof result.current).toBe("function");
    });

    it("should commit entryDeleted event with deletedAt timestamp", async () => {
        const { result } = renderHook(() => useDeleteEntry());

        await act(async () => {
            await result.current("test-id");
        });

        expect(mockCommit).toHaveBeenCalled();
        const call = mockCommit.mock.calls[0];
        expect(call[0].payload.id).toBe("test-id");
        expect(call[0].payload.deletedAt).toBeInstanceOf(Date);
    });

    it("should handle errors gracefully", async () => {
        mockCommit.mockRejectedValueOnce(new Error("Storage error"));

        const { result } = renderHook(() => useDeleteEntry());

        // Should not throw
        await act(async () => {
            await result.current("test-id");
        });

        expect(true).toBe(true);
    });
});
