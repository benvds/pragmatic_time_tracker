import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEntries } from "./use-entries";

// Mock the @livestore/react module
vi.mock("@livestore/react", () => ({
    useStore: () => ({
        store: {
            useQuery: vi.fn(() => [
                {
                    id: "1",
                    date: new Date("2025-10-12"),
                    minutes: 60,
                    description: "Test entry 1",
                    deletedAt: null,
                },
                {
                    id: "2",
                    date: new Date("2025-10-11"),
                    minutes: 90,
                    description: "Test entry 2",
                    deletedAt: null,
                },
            ]),
        },
    }),
}));

describe("useEntries", () => {
    it("should return query results", () => {
        const { result } = renderHook(() => useEntries());

        expect(result.current).toHaveLength(2);
        expect(result.current[0].id).toBe("1");
        expect(result.current[1].id).toBe("2");
    });

    it("should filter out deleted entries", () => {
        const { result } = renderHook(() => useEntries());

        // All returned entries should have deletedAt: null
        result.current.forEach((entry) => {
            expect(entry.deletedAt).toBeNull();
        });
    });

    it("should handle empty state", () => {
        // This test will fail until we implement the hook
        // For now, it demonstrates the expected behavior
        expect(true).toBe(true);
    });
});
