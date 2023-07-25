import { FormEventHandler } from "react";

import { Button } from "@/components/button";

import styles from "./index.module.css";

export const EntryForm = () => {
    const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
        console.debug("form submit event:", evt);
        evt.preventDefault();
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
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
            <div className={styles.formActions}>
                <Button type="submit">Save</Button>
                <Button variant="ghost">Reset</Button>
            </div>
        </form>
    );
};
