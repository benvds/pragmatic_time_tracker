import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useForm } from "./use-form";
import type { FieldParsers, PartialFieldStatesFromParsers } from "./util";

describe("useForm", () => {
    const mockParsers = {
        name: (value) =>
            value ? { value } : { value: undefined, error: "Name is required" },
        age: (value) => {
            const num = Number(value);
            return isNaN(num) || num < 0
                ? { value: undefined, error: "Age must be a positive number" }
                : { value: num };
        },
        email: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value ?? "")
                ? { value }
                : { value: undefined, error: "Invalid email format" };
        },
    } satisfies FieldParsers;

    const initial = {
        name: { value: "John" },
        age: { value: 25 },
    } satisfies PartialFieldStatesFromParsers<typeof mockParsers>;

    describe("initial field states", () => {
        it("initializes with empty fields state by default", () => {
            const { result } = renderHook(() =>
                useForm({ parsers: mockParsers }),
            );

            expect(result.current.fields).toEqual({});
        });

        it("initializes with provided initial field states", () => {
            const { result } = renderHook(() =>
                useForm({ initial, parsers: mockParsers }),
            );

            expect(result.current.fields).toEqual(initial);
        });
    });

    describe("reset", () => {
        it("sets fields to initial values", () => {
            const { result } = renderHook(() =>
                useForm({ initial, parsers: mockParsers }),
            );

            // Modify fields
            act(() => {
                const mockEvent = {
                    currentTarget: { value: "Jane" },
                } as React.ChangeEvent<HTMLInputElement>;
                result.current.setField("name")(mockEvent);
            });

            expect(result.current.fields.name?.value).toBe("Jane");

            // Reset
            act(() => {
                result.current.reset();
            });

            expect(result.current.fields).toEqual(initial);
        });

        it("sets fields to empty object when no initial values provided", () => {
            const { result } = renderHook(() =>
                useForm({ parsers: mockParsers }),
            );

            // Add some fields
            act(() => {
                const mockEvent = {
                    currentTarget: { value: "John" },
                } as React.ChangeEvent<HTMLInputElement>;
                result.current.setField("name")(mockEvent);
            });

            expect(result.current.fields.name?.value).toBe("John");

            // Reset
            act(() => {
                result.current.reset();
            });

            expect(result.current.fields).toEqual({});
        });
    });

    describe("setField", () => {
        it("updates single field with valid value", () => {
            const { result } = renderHook(() =>
                useForm({ parsers: mockParsers }),
            );

            act(() => {
                const mockEvent = {
                    currentTarget: { value: "John" },
                } as React.ChangeEvent<HTMLInputElement>;
                result.current.setField("name")(mockEvent);
            });

            expect(result.current.fields).toEqual({
                name: { value: "John" },
            });
        });

        it("updates single field with invalid value", () => {
            const { result } = renderHook(() =>
                useForm({ parsers: mockParsers }),
            );

            act(() => {
                const mockEvent = {
                    currentTarget: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>;
                result.current.setField("name")(mockEvent);
            });

            expect(result.current.fields).toEqual({
                name: { value: undefined, error: "Name is required" },
            });
        });

        it("should preserve existing fields when updating single field", () => {
            const initialWithoutAge = {
                name: { value: "John" },
            };

            const { result } = renderHook(() =>
                useForm({ initial: initialWithoutAge, parsers: mockParsers }),
            );

            act(() => {
                const mockEvent = {
                    currentTarget: { value: "25" },
                } as React.ChangeEvent<HTMLInputElement>;
                // TODO: age is missing but should be inferred from parsers
                result.current.setField("age")(mockEvent);
            });

            expect(result.current.fields).toEqual({
                name: { value: "John" },
                age: { value: 25 },
            });
        });

        it("should update existing field", () => {
            const { result } = renderHook(() =>
                useForm({ initial, parsers: mockParsers }),
            );

            act(() => {
                const mockEvent = {
                    currentTarget: { value: "Jane" },
                } as React.ChangeEvent<HTMLInputElement>;
                result.current.setField("name")(mockEvent);
            });

            expect(result.current.fields).toEqual({
                ...initial,
                name: { value: "Jane" },
            });
        });
    });

    describe("setFields", () => {
        it("should update all fields from form data", () => {
            const { result } = renderHook(() =>
                useForm({ parsers: mockParsers }),
            );

            const mockFormData = new FormData();
            mockFormData.set("name", "John");
            mockFormData.set("age", "25");
            mockFormData.set("email", "john@example.com");

            const mockFormEvent = {
                currentTarget: {
                    // Mock FormData implementation
                    [Symbol.iterator]:
                        mockFormData[Symbol.iterator].bind(mockFormData),
                },
            } as React.FormEvent<HTMLFormElement>;

            // Mock FormData constructor to return our mock data
            vi.spyOn(window, "FormData").mockImplementation(() => mockFormData);

            let returnedFields;
            act(() => {
                returnedFields = result.current.setFields(mockFormEvent);
            });

            expect(result.current.fields).toEqual({
                name: { value: "John" },
                age: { value: 25 },
                email: { value: "john@example.com" },
            });

            expect(returnedFields).toEqual({
                name: { value: "John" },
                age: { value: 25 },
                email: { value: "john@example.com" },
            });

            vi.restoreAllMocks();
        });

        it("should handle form data with validation errors", () => {
            const { result } = renderHook(() =>
                useForm({ parsers: mockParsers }),
            );

            const mockFormData = new FormData();
            mockFormData.set("name", "");
            mockFormData.set("age", "invalid");
            mockFormData.set("email", "invalid-email");

            const mockFormEvent = {
                currentTarget: {},
            } as React.FormEvent<HTMLFormElement>;

            vi.spyOn(window, "FormData").mockImplementation(() => mockFormData);

            let returnedFields;
            act(() => {
                returnedFields = result.current.setFields(mockFormEvent);
            });

            expect(result.current.fields).toEqual({
                name: { value: undefined, error: "Name is required" },
                age: {
                    value: undefined,
                    error: "Age must be a positive number",
                },
                email: { value: undefined, error: "Invalid email format" },
            });

            expect(returnedFields).toEqual({
                name: { value: undefined, error: "Name is required" },
                age: {
                    value: undefined,
                    error: "Age must be a positive number",
                },
                email: { value: undefined, error: "Invalid email format" },
            });

            vi.restoreAllMocks();
        });

        it("should handle mixed valid and invalid form data", () => {
            const { result } = renderHook(() =>
                useForm({ parsers: mockParsers }),
            );

            const mockFormData = new FormData();
            mockFormData.set("name", "John");
            mockFormData.set("age", "invalid");
            mockFormData.set("email", "john@example.com");

            const mockFormEvent = {
                currentTarget: {},
            } as React.FormEvent<HTMLFormElement>;

            vi.spyOn(window, "FormData").mockImplementation(() => mockFormData);

            act(() => {
                result.current.setFields(mockFormEvent);
            });

            expect(result.current.fields).toEqual({
                name: { value: "John" },
                age: {
                    value: undefined,
                    error: "Age must be a positive number",
                },
                email: { value: "john@example.com" },
            });

            vi.restoreAllMocks();
        });

        it("should handle null form data values", () => {
            const { result } = renderHook(() =>
                useForm({ parsers: mockParsers }),
            );

            const mockFormData = new FormData();
            // Simulate null values from FormData.get() - they get converted to empty strings
            vi.spyOn(mockFormData, "get").mockReturnValue(null);

            const mockFormEvent = {
                currentTarget: {},
            } as React.FormEvent<HTMLFormElement>;

            vi.spyOn(window, "FormData").mockImplementation(() => mockFormData);

            act(() => {
                result.current.setFields(mockFormEvent);
            });

            // null from FormData.get() is cast to string and becomes empty string when falsy
            expect(result.current.fields).toEqual({
                name: { value: undefined, error: "Name is required" },
                age: { value: 0, error: undefined },
                email: { value: undefined, error: "Invalid email format" },
            });

            vi.restoreAllMocks();
        });
    });
});
