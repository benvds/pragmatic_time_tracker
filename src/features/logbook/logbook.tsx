import { Container, Table, Title, Paper, Text, Group } from "@mantine/core";
import { useStore } from "@livestore/react";
import { useEntries, seedOnboardingData } from "@/features/storage";
import { OfflineIndicator } from "./components/offline-indicator";
import { EmptyState } from "./components/empty-state";
import styles from "./logbook.module.css";

export const Logbook = () => {
    const { store } = useStore();
    const entries = useEntries();

    const handleLoadSampleData = async () => {
        await seedOnboardingData(store);
    };

    // Format duration from minutes to display string
    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours === 0) {
            return `${remainingMinutes}m`;
        } else if (remainingMinutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${remainingMinutes}m`;
        }
    };

    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Container size="lg" className={styles.container}>
            <Paper shadow="md" p="xl" className={styles.logbook}>
                <Group justify="space-between" align="center" mb="md">
                    <Title order={1} className={styles.title}>
                        Time Tracker Logbook
                    </Title>
                    <OfflineIndicator />
                </Group>

                {entries.length === 0 ? (
                    <EmptyState onLoadSampleData={handleLoadSampleData} />
                ) : (
                    <Table
                        striped
                        highlightOnHover
                        className={styles.table}
                        data-testid="logbook-table"
                    >
                        <Table.Thead>
                            <Table.Tr className={styles.headerRow}>
                                <Table.Th className={styles.dateHeader}>
                                    Date
                                </Table.Th>
                                <Table.Th className={styles.durationHeader}>
                                    Duration
                                </Table.Th>
                                <Table.Th className={styles.descriptionHeader}>
                                    Description
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {entries.map((entry) => (
                                <Table.Tr
                                    key={entry.id}
                                    className={styles.entryRow}
                                >
                                    <Table.Td className={styles.dateCell}>
                                        <Text
                                            size="sm"
                                            className={styles.dateText}
                                        >
                                            {formatDate(entry.date)}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td className={styles.durationCell}>
                                        <Text
                                            size="sm"
                                            className={styles.durationText}
                                        >
                                            {formatDuration(entry.minutes)}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td
                                        className={styles.descriptionCell}
                                    >
                                        <Text
                                            size="sm"
                                            className={styles.descriptionText}
                                        >
                                            {entry.description || "—"}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Paper>
        </Container>
    );
};
