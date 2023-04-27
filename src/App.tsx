import styles from "./App.module.css";

export const App = () => {
    console.debug("rendering app");
    return (
        <div className={styles.container}>
            {/* <Button solid onClick={console.debug}></Button> */}
            <form className={styles.form}>
                <div className={styles.formField}>
                    <label htmlFor="desc">Description</label>
                    <input type="text" name="desc" tabIndex={0} />
                </div>
                <div className={styles.formField}>
                    <label htmlFor="project">Project</label>
                    <input type="text" name="project" tabIndex={0} />
                </div>
                <div className={styles.formField}>
                    <label htmlFor="project">Duration (hh:mm)</label>
                    <div className={styles.inputGroup}>
                        <input
                            className={styles.doubleDigits}
                            type="number"
                            name="hh"
                            tabIndex={0}
                        />
                        <input
                            className={styles.doubleDigits}
                            type="number"
                            name="mm"
                            tabIndex={0}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};
