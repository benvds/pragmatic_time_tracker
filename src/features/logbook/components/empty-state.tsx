import { Paper, Text, Title, Stack } from "@mantine/core";
import { IconDatabase } from "@tabler/icons-react";
import styles from "./empty-state.module.css";

/**
 * Component displayed when the logbook has no time entries
 * Provides a friendly onboarding experience for new users
 */
export function EmptyState() {
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
            </Stack>
        </Paper>
    );
}