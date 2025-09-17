import { EntryForm } from "@/features";

import styles from "./App.module.css";

export const App = () => {
    return (
        <div className={styles.container}>
            <EntryForm />
        </div>
    );
};
