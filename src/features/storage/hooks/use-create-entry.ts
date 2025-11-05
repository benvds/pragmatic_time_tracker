import { useStore } from "@livestore/react";
import { events } from "../schema";

/**
 * Hook to create new time entries
 *
 * @returns Function to create a new entry
 */
export function useCreateEntry() {
    const { store } = useStore();

    return (data: { date: Date; minutes: number; description: string }) => {
        try {
            // Generate unique ID
            const id = crypto.randomUUID();

            // Commit entryCreated event
            store.commit(
                events.entryCreated({
                    id,
                    date: data.date,
                    minutes: data.minutes,
                    description: data.description,
                }),
            );
        } catch (error) {
            // Handle storage quota exceeded error
            if (error instanceof Error && error.name === "QuotaExceededError") {
                const quotaError = new Error(
                    "Storage quota exceeded. Please clear some old data to continue tracking time entries.",
                );
                quotaError.name = "QuotaExceededError";
                console.error("Storage quota exceeded:", error);
                throw quotaError;
            }

            console.error("Failed to create entry:", error);
            throw error;
        }
    };
}
