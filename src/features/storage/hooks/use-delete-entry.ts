import { useStore } from "@livestore/react";
import { events } from "../schema";

/**
 * Hook to soft-delete time entries
 *
 * @returns Function to delete an entry (soft delete - sets deletedAt)
 */
export function useDeleteEntry() {
    const { store } = useStore();

    return (id: string) => {
        try {
            // Commit entryDeleted event with current timestamp
            store.commit(
                events.entryDeleted({
                    id,
                    deletedAt: new Date(),
                }),
            );
        } catch (error) {
            console.error("Failed to delete entry:", error);
            throw error;
        }
    };
}
