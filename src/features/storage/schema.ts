import { Events, makeSchema, Schema, State } from "@livestore/livestore";

/**
 * Events: Define all possible data changes
 *
 * Events are the source of truth in LiveStore's event-sourced architecture.
 * All data modifications flow through events which are then materialized into table state.
 */
export const events = {
    entryCreated: Events.synced({
        name: "v1.EntryCreated",
        schema: Schema.Struct({
            id: Schema.String,
            date: Schema.DateFromNumber,
            minutes: Schema.Number,
            description: Schema.String,
        }),
    }),
    entryUpdated: Events.synced({
        name: "v1.EntryUpdated",
        schema: Schema.Struct({
            id: Schema.String,
            date: Schema.DateFromNumber.pipe(Schema.optional),
            minutes: Schema.Number.pipe(Schema.optional),
            description: Schema.String.pipe(Schema.optional),
        }),
    }),
    entryDeleted: Events.synced({
        name: "v1.EntryDeleted",
        schema: Schema.Struct({
            id: Schema.String,
            deletedAt: Schema.DateFromNumber,
        }),
    }),
};

/**
 * Tables: Define database schema
 *
 * Tables store the current materialized state derived from events.
 * Indexed columns (date, deletedAt) optimize common query patterns.
 */
export const tables = {
    entries: State.SQLite.table({
        name: "entries",
        columns: {
            id: State.SQLite.text({ primaryKey: true }),
            date: State.SQLite.integer({
                schema: Schema.DateFromNumber,
            }),
            minutes: State.SQLite.integer(),
            description: State.SQLite.text(),
            deletedAt: State.SQLite.integer({
                nullable: true,
                schema: Schema.DateFromNumber,
            }),
        },
        // TODO: Add indexes once LiveStore API is confirmed
        // indexes: [
        //     // Index for chronological queries (orderBy date)
        //     { name: "dateIndex", columns: ["date"] },
        //     // Index for filtering active entries (where deletedAt = null)
        //     { name: "deletedAtIndex", columns: ["deletedAt"] },
        // ],
    }),
};

/**
 * Materializers: Map events to state changes
 *
 * Pure functions that define how each event type updates the database state.
 * These enable event replay, time-travel debugging, and future sync capabilities.
 */
const materializers = State.SQLite.materializers(events, {
    "v1.EntryCreated": ({ id, date, minutes, description }) =>
        tables.entries.insert({
            id,
            date,
            minutes,
            description,
            deletedAt: null,
        }),
    "v1.EntryUpdated": ({ id, date, minutes, description }) =>
        tables.entries
            .update({
                ...(date !== undefined && { date }),
                ...(minutes !== undefined && { minutes }),
                ...(description !== undefined && { description }),
            })
            .where({ id }),
    "v1.EntryDeleted": ({ id, deletedAt }) =>
        tables.entries.update({ deletedAt }).where({ id }),
});

/**
 * Create and export the complete LiveStore schema
 *
 * The schema combines events, tables, and materializers into a single configuration
 * that LiveStore uses to manage local-first data storage with event sourcing.
 *
 * @example
 * ```typescript
 * import { schema } from '@/features/storage'
 * makeWorker({ schema })
 * ```
 */
const state = State.SQLite.makeState({ tables, materializers });
export const schema = makeSchema({ events, state });
export type Schema = typeof schema;
