import { type Page } from "@playwright/test";

export const NON_CRITICAL_ERROR_PATTERNS = [
    "favicon",
    "livereload",
    "net::ERR_",
    "Failed to fetch",
    "WorkerError",
    "UNIQUE constraint failed",
    "LiveStore.UnexpectedError",
] as const;

export function isNonCriticalError(error: string): boolean {
    return NON_CRITICAL_ERROR_PATTERNS.some((pattern) =>
        error.includes(pattern),
    );
}

export async function collectErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            errors.push(msg.text());
        }
    });
    return errors;
}

export function filterCriticalErrors(errors: string[]): string[] {
    return errors.filter((error) => !isNonCriticalError(error));
}
