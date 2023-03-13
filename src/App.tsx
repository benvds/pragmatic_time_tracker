import styles from "./App.module.css";

export const App = () => {
    console.debug("rendering app");
    return (
        <div className={styles.container}>
            <form>
                <div className={styles.formField}>
                    <label htmlFor="desc">Description</label>
                    <input type="text" name="desc" />
                </div>
            </form>
        </div>
    );
};
