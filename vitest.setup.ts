import "@testing-library/jest-dom/vitest";

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
    const message = args[0]?.toString() || "";
    if (
        message.includes("Failed to delete entry:") ||
        message.includes("Failed to create entry:") ||
        message.includes("Failed to update entry:") ||
        message.includes("Storage quota exceeded:") ||
        message.includes("LiveStore.UnexpectedError") ||
        message.includes("UNIQUE constraint failed")
    ) {
        return;
    }
    originalConsoleError(...args);
};

console.warn = (...args: any[]) => {
    originalConsoleWarn(...args);
};
