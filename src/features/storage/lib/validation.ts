import { ValidationError } from "../types";

/**
 * UUID v4 regex pattern
 */
const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate entry ID (must be valid UUID v4)
 */
export function validateId(id: string): void {
    if (!id) {
        throw new ValidationError("ID is required", "id");
    }
    if (!UUID_PATTERN.test(id)) {
        throw new ValidationError("ID must be a valid UUID v4", "id");
    }
}

/**
 * Validate date (must be valid date, not in future beyond current day)
 */
export function validateDate(date: Date): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new ValidationError("Invalid date", "date");
    }

    // Allow dates up to end of current day
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (date > endOfToday) {
        throw new ValidationError("Date cannot be in the future", "date");
    }
}

/**
 * Validate minutes (must be positive integer, 1-1440 range recommended)
 */
export function validateMinutes(minutes: number): void {
    if (typeof minutes !== "number" || !Number.isInteger(minutes)) {
        throw new ValidationError("Minutes must be an integer", "minutes");
    }
    if (minutes < 1) {
        throw new ValidationError("Minutes must be at least 1", "minutes");
    }
    // Note: We allow > 1440 (24 hours) for multi-day entries, but show warning in UI
}

/**
 * Validate description (max 10,000 characters)
 */
export function validateDescription(description: string): void {
    if (typeof description !== "string") {
        throw new ValidationError(
            "Description must be a string",
            "description",
        );
    }
    if (description.length > 10000) {
        throw new ValidationError(
            "Description must be 10,000 characters or less",
            "description",
        );
    }
}

/**
 * Validate complete entry data
 */
export function validateEntry(entry: {
    id?: string;
    date: Date;
    minutes: number;
    description: string;
}): void {
    if (entry.id) {
        validateId(entry.id);
    }
    validateDate(entry.date);
    validateMinutes(entry.minutes);
    validateDescription(entry.description);
}

/**
 * Check if storage quota is approaching limit
 * Returns warning message if usage is above 80%
 */
export async function checkStorageQuota(): Promise<{
    used: number;
    total: number;
    percentUsed: number;
    warning?: string;
}> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const total = estimate.quota || 0;
        const percentUsed = total > 0 ? (used / total) * 100 : 0;

        const result = {
            used,
            total,
            percentUsed,
        };

        if (percentUsed > 80) {
            return {
                ...result,
                warning: `Storage is ${percentUsed.toFixed(1)}% full. Consider clearing old entries to free up space.`,
            };
        }

        return result;
    }

    // Fallback for browsers that don't support Storage API
    return {
        used: 0,
        total: 0,
        percentUsed: 0,
    };
}
