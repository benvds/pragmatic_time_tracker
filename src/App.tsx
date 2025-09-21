import { MantineProvider } from "@mantine/core";

import { EntryForm } from "@/features";

import styles from "./App.module.css";

export const App = () => {
    return (
        <MantineProvider>
            <div className={styles.container}>
                <EntryForm />
            </div>
        </MantineProvider>
    );
};
