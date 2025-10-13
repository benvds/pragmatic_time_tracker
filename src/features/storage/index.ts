// Schema exports
export { schema, tables, events } from "./schema";
export type { Schema } from "./schema";

// Type exports
export type { LogEntry, SeedDataSet } from "./types";
export { ValidationError } from "./types";

// Hook exports
export { useEntries } from "./hooks/use-entries";
export { useCreateEntry } from "./hooks/use-create-entry";
export { useUpdateEntry } from "./hooks/use-update-entry";
export { useDeleteEntry } from "./hooks/use-delete-entry";

// Utility exports
export {
    validateEntry,
    validateId,
    validateDate,
    validateMinutes,
    validateDescription,
    checkStorageQuota,
} from "./lib/validation";

// Seed utilities
export {
    seedDevelopmentData,
    seedTestData,
    seedOnboardingData,
    clearAllData,
    hasData,
    getDataStats,
} from "./lib/seed";
export type { SeedResult } from "./lib/seed";

// Seed data
export {
    developmentSeedData,
    testSeedData,
    onboardingSeedData,
} from "./lib/seed-data";
