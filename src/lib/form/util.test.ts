import { describe, it, expect } from "vitest";

import {
    type FieldState,
    type OkFieldState,
    type ErrorFieldState,
    type FieldStates,
    type FieldParser,
    type FieldParsers,
    isErrorFieldSate,
    isOkFieldState,
    everyFieldStateOk,
} from "./util";

describe("util", () => {
    describe("type guards", () => {
        describe("isErrorField", () => {
            it("should return true for error fields", () => {
                const errorField: ErrorFieldState<string> = {
                    value: "test",
                    error: "Something went wrong",
                };

                expect(isErrorFieldSate(errorField)).toBe(true);
            });

            it("should return false for ok fields", () => {
                const okField: OkFieldState<string> = {
                    value: "test",
                };

                expect(isErrorFieldSate(okField)).toBe(false);
            });

            it("should handle undefined value in error field", () => {
                const errorField: ErrorFieldState<string> = {
                    value: undefined,
                    error: "Required field",
                };

                expect(isErrorFieldSate(errorField)).toBe(true);
            });
        });

        describe("isOkField", () => {
            it("should return true for ok fields", () => {
                const okField: OkFieldState<string> = {
                    value: "test",
                };

                expect(isOkFieldState(okField)).toBe(true);
            });

            it("should return false for error fields", () => {
                const errorField: ErrorFieldState<string> = {
                    value: "test",
                    error: "Something went wrong",
                };

                expect(isOkFieldState(errorField)).toBe(false);
            });

            it("should handle ok fields with falsy values", () => {
                const okFieldEmpty: OkFieldState<string> = { value: "" };
                const okFieldZero: OkFieldState<number> = { value: 0 };
                const okFieldFalse: OkFieldState<boolean> = { value: false };

                expect(isOkFieldState(okFieldEmpty)).toBe(true);
                expect(isOkFieldState(okFieldZero)).toBe(true);
                expect(isOkFieldState(okFieldFalse)).toBe(true);
            });
        });
    });

    describe("everyFieldOk", () => {
        it("should return true when all fields are ok", () => {
            const fields: FieldStates<{ name: string; age: number }> = {
                name: { value: "John" },
                age: { value: 25 },
            };

            expect(everyFieldStateOk(fields)).toBe(true);
        });

        it("should return false when any field has an error", () => {
            const fields: FieldStates<{ name: string; age: number }> = {
                name: { value: "John" },
                age: { value: undefined, error: "Required" },
            };

            expect(everyFieldStateOk(fields)).toBe(false);
        });

        it("should return false when multiple fields have errors", () => {
            const fields: FieldStates<{ name: string; age: number }> = {
                name: { value: undefined, error: "Required" },
                age: { value: undefined, error: "Must be a number" },
            };

            expect(everyFieldStateOk(fields)).toBe(false);
        });

        it("should handle empty fields object", () => {
            const fields: FieldStates<{}> = {};

            expect(everyFieldStateOk(fields)).toBe(true);
        });

        it("should correctly type narrow to OkFields when true", () => {
            const fields: FieldStates<{ name: string; age: number }> = {
                name: { value: "John" },
                age: { value: 25 },
            };

            if (everyFieldStateOk(fields)) {
                // Type should be narrowed to OkFields
                expect(fields.name.value).toBe("John");
                expect(fields.age.value).toBe(25);
                // These should not have error property
                expect("error" in fields.name).toBe(false);
                expect("error" in fields.age).toBe(false);
            }
        });
    });

    describe("field parser types", () => {
        it("should work with string parser", () => {
            const stringParser: FieldParser<string> = (inputValue) => {
                if (!inputValue) {
                    return { value: undefined, error: "Required" };
                }
                return { value: inputValue };
            };

            expect(stringParser("")).toEqual({
                value: undefined,
                error: "Required",
            });
            expect(stringParser("test")).toEqual({ value: "test" });
        });

        it("should work with number parser", () => {
            const numberParser: FieldParser<number> = (inputValue) => {
                const num = Number(inputValue);
                if (isNaN(num)) {
                    return { value: undefined, error: "Must be a number" };
                }
                return { value: num };
            };

            expect(numberParser("abc")).toEqual({
                value: undefined,
                error: "Must be a number",
            });
            expect(numberParser("42")).toEqual({ value: 42 });
        });

        it("should work with boolean parser", () => {
            const booleanParser: FieldParser<boolean> = (inputValue) => {
                return { value: inputValue === "true" };
            };

            expect(booleanParser("true")).toEqual({ value: true });
            expect(booleanParser("false")).toEqual({ value: false });
            expect(booleanParser("anything")).toEqual({ value: false });
        });

        it("should work with field parsers object", () => {
            const parsers: FieldParsers<{ name: string; age: number }> = {
                name: (value) =>
                    value ? { value } : { value: undefined, error: "Required" },
                age: (value) => {
                    const num = Number(value);
                    return isNaN(num)
                        ? { value: undefined, error: "Must be a number" }
                        : { value: num };
                },
            };

            expect(parsers.name("John")).toEqual({ value: "John" });
            expect(parsers.name("")).toEqual({
                value: undefined,
                error: "Required",
            });
            expect(parsers.age("25")).toEqual({ value: 25 });
            expect(parsers.age("abc")).toEqual({
                value: undefined,
                error: "Must be a number",
            });
        });
    });
});
