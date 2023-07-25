import { EntryForm } from "@/features";

import styles from "./App.module.css";

export const App = () => {
    console.debug("rendering app");

    return (
        <div className={styles.container}>
            <EntryForm />
        </div>
    );
};
