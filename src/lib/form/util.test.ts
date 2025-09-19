import { describe, it, expect } from "vitest";

import {
    type FieldStateValid,
    type FieldStateInvalid,
    type FieldStates,
    isFieldStateInvalid,
    isFieldStateValid,
    everyFieldStateValid,
} from "./util";

describe("util", () => {
    describe("isFieldStateInvalid", () => {
        it("returns true for invalid fields", () => {
            const invalidField: FieldStateInvalid<string> = {
                value: "test",
                error: "Something went wrong",
            };

            expect(isFieldStateInvalid(invalidField)).toBe(true);
        });

        it("returns false for valid fields", () => {
            const validField: FieldStateValid<string> = {
                value: "test",
            };

            expect(isFieldStateInvalid(validField)).toBe(false);
        });
    });

    describe("isFieldStateValid", () => {
        it("returns false for invalid fields", () => {
            const invalidField: FieldStateInvalid<string> = {
                value: "test",
                error: "Something went wrong",
            };

            expect(isFieldStateValid(invalidField)).toBe(false);
        });

        it("returns true for valid fields", () => {
            const validField: FieldStateValid<string> = {
                value: "test",
            };

            expect(isFieldStateValid(validField)).toBe(true);
        });
    });

    describe("everyFieldStateValid", () => {
        it("returns true when all fields are valid", () => {
            const fields: FieldStates<{ name: string; age: number }> = {
                name: { value: "John" },
                age: { value: 25 },
            };

            expect(everyFieldStateValid(fields)).toBe(true);
        });

        it("returns false when any field is invalid", () => {
            const fields: FieldStates<{ name: string; age: number }> = {
                name: { value: "John" },
                age: { value: undefined, error: "Required" },
            };

            expect(everyFieldStateValid(fields)).toBe(false);
        });

        it("returns false when multiple fields have errors", () => {
            const fields: FieldStates<{ name: string; age: number }> = {
                name: { value: undefined, error: "Required" },
                age: { value: undefined, error: "Must be a number" },
            };

            expect(everyFieldStateValid(fields)).toBe(false);
        });

        it("returns true for empty fields object", () => {
            const fields: FieldStates<{}> = {};

            expect(everyFieldStateValid(fields)).toBe(true);
        });
    });
});
