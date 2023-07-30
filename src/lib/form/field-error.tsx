import { Field } from ".";
import styles from "./field-error.module.css";

export const FieldError = ({ field }: { field?: Field }) =>
    field && "error" in field ? (
        <div className={styles.fieldError}>{field.error}</div>
    ) : null;
