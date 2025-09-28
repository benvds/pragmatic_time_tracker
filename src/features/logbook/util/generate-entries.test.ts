import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateWorkingDayEntries } from "./generate-entries";

describe("generateWorkingDayEntries", () => {
    // Mock Date to have consistent test results
    let originalDate: DateConstructor;

    beforeEach(() => {
        originalDate = global.Date;
        // Mock date to September 27, 2024 (a Friday)
        const mockDate = new Date("2024-09-27T10:00:00Z");
        vi.setSystemTime(mockDate);
    });

    afterEach(() => {
        vi.useRealTimers();
        global.Date = originalDate;
    });

    it("returns an array of log entries", () => {
        const entries = generateWorkingDayEntries();

        expect(Array.isArray(entries)).toBe(true);
        expect(entries.length).toBeGreaterThan(0);
    });

    it("returns entries with correct structure", () => {
        const entries = generateWorkingDayEntries();

        entries.forEach((entry) => {
            expect(entry).toHaveProperty("date");
            expect(entry).toHaveProperty("duration");
            expect(entry).toHaveProperty("description");

            expect(typeof entry.date).toBe("string");
            expect(typeof entry.duration).toBe("string");
            // description can be string or undefined
            expect(
                typeof entry.description === "string" ||
                    entry.description === undefined,
            ).toBe(true);
        });
    });

    it("generates entries only for working days (Monday to Friday)", () => {
        const entries = generateWorkingDayEntries();

        entries.forEach((entry) => {
            // Parse the date to check day of week
            // Assuming current year for parsing
            const fullDate = new Date(entry.date + ", 2024");
            const dayOfWeek = fullDate.getDay();

            // Should be Monday (1) to Friday (5)
            expect(dayOfWeek).toBeGreaterThanOrEqual(1);
            expect(dayOfWeek).toBeLessThanOrEqual(5);
        });
    });

    it("excludes today from the entries", () => {
        const entries = generateWorkingDayEntries();
        const today = new Date();
        const todayString = today.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

        // Today should not be in the entries
        const todayEntry = entries.find((entry) => entry.date === todayString);
        expect(todayEntry).toBeUndefined();
    });

    it("returns entries in reverse chronological order", () => {
        const entries = generateWorkingDayEntries();

        if (entries.length >= 2) {
            for (let i = 0; i < entries.length - 1; i++) {
                const currentDate = new Date(entries[i].date + ", 2024");
                const nextDate = new Date(entries[i + 1].date + ", 2024");

                // Current entry should be more recent than or equal to next entry
                expect(currentDate.getTime()).toBeGreaterThanOrEqual(
                    nextDate.getTime(),
                );
            }
        }
    });

    it("generates valid duration formats", () => {
        const entries = generateWorkingDayEntries();
        const validDurationPattern = /^\d+[hm](\s\d+m)?$/;

        entries.forEach((entry) => {
            expect(entry.duration).toMatch(validDurationPattern);
        });
    });

    it("includes some entries with no description (em dash)", () => {
        // Run multiple times to increase chance of hitting the 20% no-description case
        let hasEmptyDescription = false;

        for (let i = 0; i < 10; i++) {
            const entries = generateWorkingDayEntries();
            if (entries.some((entry) => entry.description === undefined)) {
                hasEmptyDescription = true;
                break;
            }
        }

        // Should have at least one empty description in 10 runs (very high probability)
        expect(hasEmptyDescription).toBe(true);
    });

    it("includes some entries with descriptions", () => {
        const entries = generateWorkingDayEntries();
        const entriesWithDescription = entries.filter(
            (entry) => entry.description !== undefined,
        );

        // Should have at least some entries with descriptions
        expect(entriesWithDescription.length).toBeGreaterThan(0);
    });

    it("uses task descriptions from predefined list", () => {
        const entries = generateWorkingDayEntries();
        const entriesWithDescription = entries.filter(
            (entry) => entry.description !== undefined,
        );

        // All descriptions should be from the predefined list
        const validDescriptions = [
            "Code review and feedback",
            "Feature development - user authentication",
            "Bug fixes in payment system",
            "Meeting with design team",
            "Database optimization work",
            "API endpoint implementation",
            "Unit testing and coverage",
            "Documentation updates",
            "Performance monitoring setup",
            "Client requirements analysis",
            "UI component development",
            "Security audit review",
            "Deployment pipeline setup",
            "Sprint planning meeting",
            "Refactoring legacy code",
            "Third-party integration",
            "Error handling improvements",
            "Mobile responsive fixes",
            "Accessibility improvements",
            "Team standup meeting",
        ];

        entriesWithDescription.forEach((entry) => {
            expect(validDescriptions).toContain(entry.description);
        });
    });

    it("generates entries only for current month up to today", () => {
        const entries = generateWorkingDayEntries();
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        entries.forEach((entry) => {
            const entryDate = new Date(entry.date + ", " + currentYear);

            // Should be in current month
            expect(entryDate.getMonth()).toBe(currentMonth);

            // Should be before or equal to today
            expect(entryDate.getTime()).toBeLessThanOrEqual(today.getTime());
        });
    });

    it("handles month boundaries correctly", () => {
        // Test at beginning of month
        vi.setSystemTime(new Date("2024-09-02T10:00:00Z")); // September 2nd (Monday)

        const entries = generateWorkingDayEntries();

        // Should only have September 1st (if it was a working day)
        const sept1 = new Date("2024-09-01");
        if (sept1.getDay() >= 1 && sept1.getDay() <= 5) {
            expect(entries.some((entry) => entry.date === "Sep 1")).toBe(true);
        }

        // Should not have any August dates
        entries.forEach((entry) => {
            const entryDate = new Date(entry.date + ", 2024");
            expect(entryDate.getMonth()).toBe(8); // September is month 8 (0-indexed)
        });
    });

    it("handles edge case when first day of month is today", () => {
        // Test when today is the first of the month
        vi.setSystemTime(new Date("2024-09-01T10:00:00Z")); // September 1st

        const entries = generateWorkingDayEntries();

        // Should return empty array since no working days before today
        expect(entries).toHaveLength(0);
    });

    it("generates reasonable duration values", () => {
        const entries = generateWorkingDayEntries();

        entries.forEach((entry) => {
            const duration = entry.duration;

            // Extract hours and minutes
            const hoursMatch = duration.match(/(\d+)h/);
            const minutesMatch = duration.match(/(\d+)m/);

            if (hoursMatch) {
                const hours = parseInt(hoursMatch[1]);
                expect(hours).toBeGreaterThanOrEqual(1);
                expect(hours).toBeLessThanOrEqual(8);
            }

            if (minutesMatch) {
                const minutes = parseInt(minutesMatch[1]);
                // Should be 0, 15, 30, or 45 minutes
                expect([0, 15, 30, 45]).toContain(minutes);
            }
        });
    });

    it("consistently returns same results for same date", () => {
        // Set a fixed date
        vi.setSystemTime(new Date("2024-09-15T10:00:00Z"));

        const entries1 = generateWorkingDayEntries();
        const entries2 = generateWorkingDayEntries();

        // Results should be consistent in terms of structure and count
        expect(entries1.length).toBe(entries2.length);

        // Dates should be identical
        entries1.forEach((entry, index) => {
            expect(entry.date).toBe(entries2[index].date);
        });
    });

    it("handles different years correctly", () => {
        // Test with different year
        vi.setSystemTime(new Date("2025-03-15T10:00:00Z")); // March 2025

        const entries = generateWorkingDayEntries();

        entries.forEach((entry) => {
            // Parse with 2025
            const entryDate = new Date(entry.date + ", 2025");
            expect(entryDate.getMonth()).toBe(2); // March is month 2
            expect(entryDate.getFullYear()).toBe(2025);
        });
    });
});
