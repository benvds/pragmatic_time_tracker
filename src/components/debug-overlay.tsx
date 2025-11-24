import { useEffect, useEffectEvent, useState } from "react";
import {
    Button,
    Stack,
    Paper,
    Text,
    Alert,
    ActionIcon,
    Tooltip,
} from "@mantine/core";
import {
    IconBug,
    IconDatabase,
    IconTrash,
    IconAlertCircle,
    IconX,
    IconDownload,
    IconRefresh,
} from "@tabler/icons-react";
import { useStore } from "@livestore/react";
import { seedOnboardingData } from "@/features/storage";
import { initializeDebugConsole } from "@/lib/debug-console";
import styles from "./debug-overlay.module.css";

const debugEnabled = import.meta.env.VITE_DEBUG !== "true";
/**
 * Debug overlay menu that appears when DEBUG environment variable is true
 * Provides utilities for testing and development
 */
export function DebugOverlay() {
    const { store } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        if (debugEnabled) {
            initializeDebugConsole(store);
        }
    }, [store]);

    // Don't render if not in debug mode
    if (debugEnabled) {
        return null;
    }

    const handleLoadSampleData = () => {
        setIsLoading(true);
        setMessage(null);

        try {
            seedOnboardingData(store);
            setMessage({
                type: "success",
                text: "Sample data loaded successfully",
            });
        } catch (err) {
            setMessage({
                type: "error",
                text:
                    err instanceof Error
                        ? err.message
                        : "Failed to load sample data",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearData = () => {
        setIsLoading(true);
        setMessage(null);

        try {
            if (!__debugLiveStore?.default?._dev) {
                throw new Error("LiveStore debug helpers not available");
            }
            __debugLiveStore.default._dev.hardReset();
            setMessage({
                type: "success",
                text: "All data cleared successfully",
            });
            // Reload page to reflect cleared state
            window.location.reload();
        } catch (err) {
            setMessage({
                type: "error",
                text:
                    err instanceof Error ? err.message : "Failed to clear data",
            });
            setIsLoading(false);
        }
    };

    const handleDownloadDb = () => {
        try {
            if (!__debugLiveStore?.default?._dev) {
                throw new Error("LiveStore debug helpers not available");
            }
            __debugLiveStore.default._dev.downloadDb();
            setMessage({
                type: "success",
                text: "Database download started",
            });
        } catch (err) {
            setMessage({
                type: "error",
                text:
                    err instanceof Error
                        ? err.message
                        : "Failed to download database",
            });
        }
    };

    const handleDownloadEventlog = () => {
        try {
            if (!__debugLiveStore?.default?._dev) {
                throw new Error("LiveStore debug helpers not available");
            }
            __debugLiveStore.default._dev.downloadEventlogDb();
            setMessage({
                type: "success",
                text: "Eventlog download started",
            });
        } catch (err) {
            setMessage({
                type: "error",
                text:
                    err instanceof Error
                        ? err.message
                        : "Failed to download eventlog",
            });
        }
    };

    const handleSyncStates = () => {
        try {
            if (!__debugLiveStore?.default?._dev) {
                throw new Error("LiveStore debug helpers not available");
            }
            const states = __debugLiveStore.default._dev.syncStates();
            console.log("Sync States:", states);
            setMessage({
                type: "success",
                text: "Sync states logged to console",
            });
        } catch (err) {
            setMessage({
                type: "error",
                text:
                    err instanceof Error
                        ? err.message
                        : "Failed to get sync states",
            });
        }
    };

    return (
        <div className={styles.debugOverlay}>
            {!isOpen ? (
                <Tooltip label="Debug Tools" position="left">
                    <ActionIcon
                        size="lg"
                        variant="filled"
                        color="orange"
                        onClick={() => setIsOpen(true)}
                        className={styles.triggerButton}
                        aria-label="Open debug tools"
                    >
                        <IconBug size={20} />
                    </ActionIcon>
                </Tooltip>
            ) : (
                <Paper
                    shadow="lg"
                    p="md"
                    radius="md"
                    className={styles.menu}
                    withBorder
                >
                    <Stack gap="md">
                        <div className={styles.header}>
                            <Text size="sm" fw={600}>
                                Debug Tools
                            </Text>
                            <ActionIcon
                                size="sm"
                                variant="subtle"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close debug tools"
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        </div>

                        <Stack gap="xs">
                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconDatabase size={16} />}
                                onClick={handleLoadSampleData}
                                loading={isLoading}
                                disabled={isLoading}
                                fullWidth
                            >
                                Load Sample Data
                            </Button>

                            <Button
                                size="xs"
                                variant="light"
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={handleClearData}
                                loading={isLoading}
                                disabled={isLoading}
                                fullWidth
                            >
                                Clear All Data
                            </Button>

                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconDownload size={16} />}
                                onClick={handleDownloadDb}
                                disabled={isLoading}
                                fullWidth
                            >
                                Download Database
                            </Button>

                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconDownload size={16} />}
                                onClick={handleDownloadEventlog}
                                disabled={isLoading}
                                fullWidth
                            >
                                Download Eventlog
                            </Button>

                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconRefresh size={16} />}
                                onClick={handleSyncStates}
                                disabled={isLoading}
                                fullWidth
                            >
                                View Sync States
                            </Button>
                        </Stack>

                        {message && (
                            <Alert
                                icon={<IconAlertCircle size={16} />}
                                color={
                                    message.type === "success" ? "green" : "red"
                                }
                                variant="light"
                                className={styles.message}
                            >
                                <Text size="xs">{message.text}</Text>
                            </Alert>
                        )}
                    </Stack>
                </Paper>
            )}
        </div>
    );
}
