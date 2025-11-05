import { useStore } from "@livestore/react";
import { events } from "../schema";

/**
 * Hook to update existing time entries
 *
 * @returns Function to update an entry with partial data
 */
export function useUpdateEntry() {
    const { store } = useStore();

    return (
        id: string,
        updates: {
            date?: Date;
            minutes?: number;
            description?: string;
        },
    ) => {
        try {
            // Commit entryUpdated event with partial updates
            store.commit(
                events.entryUpdated({
                    id,
                    ...updates,
                }),
            );
        } catch (error) {
            // Handle storage quota exceeded error
            if (error instanceof Error && error.name === "QuotaExceededError") {
                const quotaError = new Error(
                    "Storage quota exceeded. Please clear some old data to continue updating time entries.",
                );
                quotaError.name = "QuotaExceededError";
                console.error("Storage quota exceeded:", error);
                throw quotaError;
            }

            console.error("Failed to update entry:", error);
            throw error;
        }
    };
}
