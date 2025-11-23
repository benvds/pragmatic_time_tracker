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
        const event = call[0];
        expect(event.name).toBe("v1.EntryDeleted");
        expect(event.args.id).toBe("test-id");
        expect(event.args.deletedAt).toBeInstanceOf(Date);
    });

    it("should handle errors gracefully", () => {
        mockCommit.mockImplementationOnce(() => {
            throw new Error("Storage error");
        });

        const { result } = renderHook(() => useDeleteEntry());

        // Should throw the error
        expect(() => {
            act(() => {
                result.current("test-id");
            });
        }).toThrow("Storage error");
    });
});
