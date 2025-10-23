import { useState } from "react";
import { Paper, Text, Button, Title, Stack, Alert } from "@mantine/core";
import { IconDatabase, IconAlertCircle } from "@tabler/icons-react";
import styles from "./empty-state.module.css";

interface EmptyStateProps {
    onLoadSampleData: () => Promise<void>;
}

export function EmptyState({ onLoadSampleData }: EmptyStateProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLoadSampleData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await onLoadSampleData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load sample data. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper
            shadow="sm"
            p="xl"
            radius="md"
            className={styles.emptyState}
            data-testid="empty-state"
        >
            <Stack align="center" gap="lg">
                <IconDatabase size={64} className={styles.icon} stroke={1.5} />

                <div className={styles.content}>
                    <Title order={3} ta="center" className={styles.title}>
                        No time entries yet
                    </Title>

                    <Text
                        size="md"
                        c="dimmed"
                        ta="center"
                        className={styles.description}
                    >
                        Start tracking your time! Your entries will appear here
                        once you begin logging your work.
                    </Text>
                </div>

                <Stack gap="sm" align="center">
                    <Text size="sm" c="dimmed" ta="center">
                        Want to see what it looks like with data?
                    </Text>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadSampleData}
                        loading={isLoading}
                        disabled={isLoading}
                        leftSection={<IconDatabase size={16} />}
                    >
                        {isLoading ? "Loading..." : "Load Sample Data"}
                    </Button>

                    {error && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            color="red"
                            variant="light"
                            className={styles.error}
                        >
                            {error}
                        </Alert>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
