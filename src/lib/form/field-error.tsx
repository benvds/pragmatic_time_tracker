import { type Field } from ".";
import styles from "./field-error.module.css";

export const FieldError = ({ field }: { field?: Field<unknown> }) =>
    field && "error" in field ? (
        <div className={styles.fieldError}>{field.error}</div>
    ) : null;
