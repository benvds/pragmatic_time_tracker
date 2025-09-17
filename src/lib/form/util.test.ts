import { describe, it, expect } from "vitest";

import {
    type Field,
    type OkField,
    type ErrorField,
    type Fields,
    type OkFields,
    type FieldParser,
    type FieldParsers,
    isErrorField,
    isOkField,
    everyFieldOk,
} from "./util";

describe("util", () => {
    describe("type guards", () => {
        describe("isErrorField", () => {
            it("should return true for error fields", () => {
                const errorField: ErrorField<string> = {
                    value: "test",
                    error: "Something went wrong",
                };

                expect(isErrorField(errorField)).toBe(true);
            });

            it("should return false for ok fields", () => {
                const okField: OkField<string> = {
                    value: "test",
                };

                expect(isErrorField(okField)).toBe(false);
            });

            it("should handle undefined value in error field", () => {
                const errorField: ErrorField<string> = {
                    value: undefined,
                    error: "Required field",
                };

                expect(isErrorField(errorField)).toBe(true);
            });
        });

        describe("isOkField", () => {
            it("should return true for ok fields", () => {
                const okField: OkField<string> = {
                    value: "test",
                };

                expect(isOkField(okField)).toBe(true);
            });

            it("should return false for error fields", () => {
                const errorField: ErrorField<string> = {
                    value: "test",
                    error: "Something went wrong",
                };

                expect(isOkField(errorField)).toBe(false);
            });

            it("should handle ok fields with falsy values", () => {
                const okFieldEmpty: OkField<string> = { value: "" };
                const okFieldZero: OkField<number> = { value: 0 };
                const okFieldFalse: OkField<boolean> = { value: false };

                expect(isOkField(okFieldEmpty)).toBe(true);
                expect(isOkField(okFieldZero)).toBe(true);
                expect(isOkField(okFieldFalse)).toBe(true);
            });
        });
    });

    describe("everyFieldOk", () => {
        it("should return true when all fields are ok", () => {
            const fields: Fields<{ name: string; age: number }> = {
                name: { value: "John" },
                age: { value: 25 },
            };

            expect(everyFieldOk(fields)).toBe(true);
        });

        it("should return false when any field has an error", () => {
            const fields: Fields<{ name: string; age: number }> = {
                name: { value: "John" },
                age: { value: undefined, error: "Required" },
            };

            expect(everyFieldOk(fields)).toBe(false);
        });

        it("should return false when multiple fields have errors", () => {
            const fields: Fields<{ name: string; age: number }> = {
                name: { value: undefined, error: "Required" },
                age: { value: undefined, error: "Must be a number" },
            };

            expect(everyFieldOk(fields)).toBe(false);
        });

        it("should handle empty fields object", () => {
            const fields: Fields<{}> = {};

            expect(everyFieldOk(fields)).toBe(true);
        });

        it("should correctly type narrow to OkFields when true", () => {
            const fields: Fields<{ name: string; age: number }> = {
                name: { value: "John" },
                age: { value: 25 },
            };

            if (everyFieldOk(fields)) {
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
