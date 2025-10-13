import { describe, it, expect } from "vitest";
import { events, schema, tables } from "./schema";

describe("Storage Schema", () => {
    describe("Events", () => {
        it("should create entryCreated event", () => {
            const event = events.entryCreated({
                id: "test-id",
                date: new Date("2025-10-12T10:00:00"),
                minutes: 60,
                description: "Test entry",
            });

            expect(event).toBeDefined();
            // LiveStore events are functions that return the event data
            expect(typeof event).toBe("function");
        });

        it("should create entryUpdated event with partial data", () => {
            const event = events.entryUpdated({
                id: "test-id",
                minutes: 90,
            });

            expect(event).toBeDefined();
            expect(typeof event).toBe("function");
        });

        it("should create entryDeleted event", () => {
            const event = events.entryDeleted({
                id: "test-id",
                deletedAt: new Date("2025-10-12T14:00:00"),
            });

            expect(event).toBeDefined();
            expect(typeof event).toBe("function");
        });
    });

    describe("Schema Exports", () => {
        it("should export schema", () => {
            expect(schema).toBeDefined();
        });

        it("should export tables", () => {
            expect(tables).toBeDefined();
            expect(tables.entries).toBeDefined();
        });

        it("should export events", () => {
            expect(events).toBeDefined();
            expect(events.entryCreated).toBeDefined();
            expect(events.entryUpdated).toBeDefined();
            expect(events.entryDeleted).toBeDefined();
        });
    });
});
