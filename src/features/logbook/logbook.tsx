import { Container, Table, Title, Paper, Text } from "@mantine/core";
import { generateWorkingDayEntries } from "./util/generate-entries";
import styles from "./logbook.module.css";

export const Logbook = () => {
    const entries = generateWorkingDayEntries();

    return (
        <Container size="lg" className={styles.container}>
            <Paper shadow="md" p="xl" className={styles.logbook}>
                <Title order={1} className={styles.title}>
                    Time Tracker Logbook
                </Title>

                <Table striped highlightOnHover className={styles.table}>
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
                        {entries.map((entry, index) => (
                            <Table.Tr key={index} className={styles.entryRow}>
                                <Table.Td className={styles.dateCell}>
                                    <Text size="sm" className={styles.dateText}>
                                        {entry.date}
                                    </Text>
                                </Table.Td>
                                <Table.Td className={styles.durationCell}>
                                    <Text
                                        size="sm"
                                        className={styles.durationText}
                                    >
                                        {entry.duration}
                                    </Text>
                                </Table.Td>
                                <Table.Td className={styles.descriptionCell}>
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
            </Paper>
        </Container>
    );
};
