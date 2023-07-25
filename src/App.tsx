import styles from "./App.module.css";
import { EntryForm } from "./features";

export const App = () => {
    console.debug("rendering app");

    return (
        <div className={styles.container}>
            <EntryForm />
        </div>
    );
};
