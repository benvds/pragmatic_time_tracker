import { useState, useEffect } from "react";
import { Badge } from "@mantine/core";
import styles from "./offline-indicator.module.css";

/**
 * Component that displays an indicator when the user is offline
 */
export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Listen to online/offline events
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Cleanup listeners on unmount
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Don't show anything when online
    if (isOnline) {
        return null;
    }

    return (
        <Badge
            color="orange"
            variant="filled"
            size="sm"
            className={styles.offlineIndicator}
            data-testid="offline-indicator"
        >
            Offline
        </Badge>
    );
}