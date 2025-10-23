import { useState } from "react";
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
} from "@tabler/icons-react";
import { useStore } from "@livestore/react";
import { seedOnboardingData, clearAllData } from "@/features/storage";
import styles from "./debug-overlay.module.css";

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

    // Don't render if not in debug mode
    if (import.meta.env.VITE_DEBUG !== "true") {
        return null;
    }

    const handleLoadSampleData = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            await seedOnboardingData(store);
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

    const handleClearData = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            await clearAllData(store);
            setMessage({
                type: "success",
                text: "All data cleared successfully",
            });
        } catch (err) {
            setMessage({
                type: "error",
                text:
                    err instanceof Error ? err.message : "Failed to clear data",
            });
        } finally {
            setIsLoading(false);
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
