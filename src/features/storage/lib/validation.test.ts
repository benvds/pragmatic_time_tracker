import { describe, it, expect } from "vitest";
import {
    validateId,
    validateDate,
    validateMinutes,
    validateDescription,
    validateEntry,
} from "./validation";
import { ValidationError } from "../types";

describe("validateId", () => {
    it("should accept valid UUID v4", () => {
        expect(() =>
            validateId("550e8400-e29b-41d4-a716-446655440000"),
        ).not.toThrow();
        expect(() =>
            validateId("f47ac10b-58cc-4372-a567-0e02b2c3d479"),
        ).not.toThrow();
    });

    it("should reject empty ID", () => {
        expect(() => validateId("")).toThrow(ValidationError);
        expect(() => validateId("")).toThrow("ID is required");
    });

    it("should reject non-UUID strings", () => {
        expect(() => validateId("not-a-uuid")).toThrow(ValidationError);
        expect(() => validateId("12345")).toThrow("ID must be a valid UUID v4");
    });

    it("should reject UUID v1 (wrong version)", () => {
        expect(() =>
            validateId("550e8400-e29b-11d4-a716-446655440000"),
        ).toThrow(ValidationError);
    });
});

describe("validateDate", () => {
    it("should accept valid dates in the past", () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        expect(() => validateDate(yesterday)).not.toThrow();
    });

    it("should accept today's date", () => {
        const today = new Date();
        expect(() => validateDate(today)).not.toThrow();
    });

    it("should reject invalid date objects", () => {
        const invalidDate = new Date("invalid");
        expect(() => validateDate(invalidDate)).toThrow(ValidationError);
        expect(() => validateDate(invalidDate)).toThrow("Invalid date");
    });

    it("should reject dates in the future", () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        expect(() => validateDate(tomorrow)).toThrow(ValidationError);
        expect(() => validateDate(tomorrow)).toThrow(
            "Date cannot be in the future",
        );
    });

    it("should accept date at end of current day", () => {
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        expect(() => validateDate(endOfToday)).not.toThrow();
    });
});

describe("validateMinutes", () => {
    it("should accept valid positive integers", () => {
        expect(() => validateMinutes(1)).not.toThrow();
        expect(() => validateMinutes(60)).not.toThrow();
        expect(() => validateMinutes(480)).not.toThrow();
        expect(() => validateMinutes(1440)).not.toThrow();
    });

    it("should accept values greater than 1440 (multi-day entries)", () => {
        expect(() => validateMinutes(2000)).not.toThrow();
    });

    it("should reject zero", () => {
        expect(() => validateMinutes(0)).toThrow(ValidationError);
        expect(() => validateMinutes(0)).toThrow("Minutes must be at least 1");
    });

    it("should reject negative numbers", () => {
        expect(() => validateMinutes(-10)).toThrow(ValidationError);
        expect(() => validateMinutes(-10)).toThrow(
            "Minutes must be at least 1",
        );
    });

    it("should reject non-integers", () => {
        expect(() => validateMinutes(30.5)).toThrow(ValidationError);
        expect(() => validateMinutes(30.5)).toThrow(
            "Minutes must be an integer",
        );
    });

    it("should reject non-numbers", () => {
        expect(() => validateMinutes("60" as unknown as number)).toThrow(
            ValidationError,
        );
    });
});

describe("validateDescription", () => {
    it("should accept empty strings", () => {
        expect(() => validateDescription("")).not.toThrow();
    });

    it("should accept valid strings", () => {
        expect(() => validateDescription("Meeting with team")).not.toThrow();
        expect(() =>
            validateDescription("Development work on feature X"),
        ).not.toThrow();
    });

    it("should accept strings up to 10,000 characters", () => {
        const maxLength = "a".repeat(10000);
        expect(() => validateDescription(maxLength)).not.toThrow();
    });

    it("should reject strings over 10,000 characters", () => {
        const tooLong = "a".repeat(10001);
        expect(() => validateDescription(tooLong)).toThrow(ValidationError);
        expect(() => validateDescription(tooLong)).toThrow(
            "Description must be 10,000 characters or less",
        );
    });

    it("should reject non-strings", () => {
        expect(() => validateDescription(123 as unknown as string)).toThrow(
            ValidationError,
        );
        expect(() => validateDescription(null as unknown as string)).toThrow(
            ValidationError,
        );
    });
});

describe("validateEntry", () => {
    it("should validate complete valid entry", () => {
        expect(() =>
            validateEntry({
                id: "550e8400-e29b-41d4-a716-446655440000",
                date: new Date(),
                minutes: 60,
                description: "Valid entry",
            }),
        ).not.toThrow();
    });

    it("should validate entry without ID", () => {
        expect(() =>
            validateEntry({
                date: new Date(),
                minutes: 60,
                description: "Entry without ID",
            }),
        ).not.toThrow();
    });

    it("should reject entry with invalid ID", () => {
        expect(() =>
            validateEntry({
                id: "invalid-id",
                date: new Date(),
                minutes: 60,
                description: "Invalid ID",
            }),
        ).toThrow(ValidationError);
    });

    it("should reject entry with invalid date", () => {
        expect(() =>
            validateEntry({
                date: new Date("invalid"),
                minutes: 60,
                description: "Invalid date",
            }),
        ).toThrow(ValidationError);
    });

    it("should reject entry with invalid minutes", () => {
        expect(() =>
            validateEntry({
                date: new Date(),
                minutes: -10,
                description: "Invalid minutes",
            }),
        ).toThrow(ValidationError);
    });

    it("should reject entry with invalid description", () => {
        expect(() =>
            validateEntry({
                date: new Date(),
                minutes: 60,
                description: "a".repeat(10001),
            }),
        ).toThrow(ValidationError);
    });

    it("should validate entry with edge case values", () => {
        expect(() =>
            validateEntry({
                date: new Date(),
                minutes: 1,
                description: "",
            }),
        ).not.toThrow();
    });
});

describe("checkStorageQuota", () => {
    // Note: These tests are environment-dependent and may need mocking
    // in some test environments. Actual implementation tested manually.

    it("should return storage stats structure", async () => {
        const result = await import("./validation").then((m) =>
            m.checkStorageQuota(),
        );

        expect(result).toHaveProperty("used");
        expect(result).toHaveProperty("total");
        expect(result).toHaveProperty("percentUsed");
        expect(typeof result.used).toBe("number");
        expect(typeof result.total).toBe("number");
        expect(typeof result.percentUsed).toBe("number");
    });
});
