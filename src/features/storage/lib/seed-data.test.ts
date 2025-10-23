import { describe, it, expect } from "vitest";
import { developmentSeedData, testSeedData } from "./seed-data";

describe("Seed Data", () => {
    describe("developmentSeedData", () => {
        it("is an array of events", () => {
            expect(Array.isArray(developmentSeedData)).toBe(true);
            expect(developmentSeedData.length).toBeGreaterThan(0);
        });

        it("contains events with required fields", () => {
            developmentSeedData.forEach((event) => {
                expect(event).toBeDefined();
                expect(event.name).toBeDefined();
                expect(event.args).toBeDefined();

                // Check that it's an entryCreated event
                expect(event.name).toBe("v1.EntryCreated");

                const data = event.args;
                expect(data.id).toBeDefined();
                expect(typeof data.id).toBe("string");
                expect(data.id.length).toBeGreaterThan(0);

                expect(data.date).toBeInstanceOf(Date);
                expect(data.date.getTime()).not.toBeNaN();

                expect(typeof data.minutes).toBe("number");
                expect(data.minutes).toBeGreaterThan(0);
                expect(data.minutes).toBeLessThanOrEqual(1440); // Max 24 hours

                expect(typeof data.description).toBe("string");
            });
        });

        it("has realistic varied durations", () => {
            const durations = developmentSeedData.map(
                (event) => event.args.minutes,
            );

            // Should have variety (not all the same)
            const uniqueDurations = new Set(durations);
            expect(uniqueDurations.size).toBeGreaterThan(1);

            // Should be within realistic work ranges (30 min to 8 hours)
            durations.forEach((minutes) => {
                expect(minutes).toBeGreaterThanOrEqual(30);
                expect(minutes).toBeLessThanOrEqual(480); // 8 hours
            });
        });

        it("has deterministic IDs starting with 'dev-'", () => {
            developmentSeedData.forEach((event) => {
                expect(event.args.id).toMatch(/^dev-\d+$/);
            });

            // IDs should be unique
            const ids = developmentSeedData.map((event) => event.args.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it("spans last 7 days from today", () => {
            const today = new Date();
            const sevenDaysAgo = new Date(
                today.getTime() - 7 * 24 * 60 * 60 * 1000,
            );

            developmentSeedData.forEach((event) => {
                const eventDate = event.args.date;
                expect(eventDate.getTime()).toBeGreaterThanOrEqual(
                    sevenDaysAgo.getTime(),
                );
                expect(eventDate.getTime()).toBeLessThanOrEqual(
                    today.getTime(),
                );
            });
        });

        it("has realistic descriptions", () => {
            developmentSeedData.forEach((event) => {
                const description = event.args.description;
                expect(description.length).toBeGreaterThan(0);
                expect(description.length).toBeLessThan(200); // Reasonable length

                // Should be meaningful work descriptions
                expect(description).not.toBe("test");
                expect(description).not.toBe("TODO");
            });
        });
    });

    describe("testSeedData", () => {
        it("is an array of events", () => {
            expect(Array.isArray(testSeedData)).toBe(true);
            expect(testSeedData.length).toBeGreaterThan(0);
        });

        it("includes edge cases", () => {
            const events = testSeedData;

            // Should have at least one event with minimal duration
            const hasMinimalDuration = events.some(
                (event) =>
                    event.name === "v1.EntryCreated" &&
                    "minutes" in event.args &&
                    event.args.minutes === 1,
            );
            expect(hasMinimalDuration).toBe(true);

            // Should have at least one event with empty description
            const hasEmptyDescription = events.some(
                (event) =>
                    event.name === "v1.EntryCreated" &&
                    "description" in event.args &&
                    event.args.description === "",
            );
            expect(hasEmptyDescription).toBe(true);

            // Should have at least one event with maximum duration
            const hasMaxDuration = events.some(
                (event) =>
                    event.name === "v1.EntryCreated" &&
                    "minutes" in event.args &&
                    event.args.minutes >= 1440,
            );
            expect(hasMaxDuration).toBe(true);
        });

        it("includes deleted entries (entryDeleted events)", () => {
            const deletedEvents = testSeedData.filter(
                (event) => event.name === "v1.EntryDeleted",
            );
            expect(deletedEvents.length).toBeGreaterThan(0);

            deletedEvents.forEach((event) => {
                expect(event.args.id).toBeDefined();
                expect(event.args.deletedAt).toBeInstanceOf(Date);
            });
        });

        it("has deterministic IDs for testing", () => {
            testSeedData.forEach((event) => {
                const id = event.args.id;
                // Should have predictable test IDs
                expect(id).toMatch(/^test-(edge|deleted|max)-\w+$/);
            });
        });

        it("includes boundary date cases", () => {
            const dates = testSeedData
                .filter((event) => event.name === "v1.EntryCreated")
                .map((event) => event.args.date);

            // Should have variety in dates for testing
            const uniqueDates = new Set(dates.map((d) => d.toDateString()));
            expect(uniqueDates.size).toBeGreaterThan(1);
        });

        it("has events with required fields", () => {
            testSeedData.forEach((event) => {
                expect(event.name).toBeDefined();
                expect(event.args).toBeDefined();

                if (event.name === "v1.EntryCreated") {
                    const data = event.args;
                    expect(typeof data.id).toBe("string");
                    expect(data.date).toBeInstanceOf(Date);
                    expect(typeof data.minutes).toBe("number");
                    expect(typeof data.description).toBe("string");
                } else if (event.name === "v1.EntryDeleted") {
                    const data = event.args;
                    expect(typeof data.id).toBe("string");
                    expect(data.deletedAt).toBeInstanceOf(Date);
                }
            });
        });
    });

    describe("Seed Data Consistency", () => {
        it("both data sets have unique event types", () => {
            const allEvents = [...developmentSeedData, ...testSeedData];

            allEvents.forEach((event) => {
                expect([
                    "v1.EntryCreated",
                    "v1.EntryUpdated",
                    "v1.EntryDeleted",
                ]).toContain(event.name);
            });
        });

        it("no duplicate IDs across datasets", () => {
            const devIds = developmentSeedData
                .filter((event) => event.name === "v1.EntryCreated")
                .map((event) => event.args.id);
            const testIds = testSeedData
                .filter((event) => event.name === "v1.EntryCreated")
                .map((event) => event.args.id);

            const allIds = [...devIds, ...testIds];
            const uniqueIds = new Set(allIds);

            expect(uniqueIds.size).toBe(allIds.length);
        });

        it("test data is smaller than development data", () => {
            // Test data should be minimal for fast test execution
            expect(testSeedData.length).toBeLessThanOrEqual(
                developmentSeedData.length,
            );
            expect(testSeedData.length).toBeLessThanOrEqual(15); // Keep test data small
        });
    });
});
