/**
 * LogEntry type matching existing structure
 */
export type LogEntry = {
    id: string; // UUID v4
    date: Date;
    minutes: number;
    description: string;
};

/**
 * Validation error for storage operations
 */
export class ValidationError extends Error {
    field?: string;

    constructor(message: string, field?: string) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}

/**
 * Seed data set for different purposes
 */
export type SeedDataSet = {
    name: string;
    description: string;
    entries: Array<{
        id: string;
        date: Date;
        minutes: number;
        description: string;
    }>;
};
