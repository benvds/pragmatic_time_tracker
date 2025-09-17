import { isErrorField, type Field } from "../util";

import styles from "./field-error.module.css";

export const FieldError = ({ field }: { field?: Field<unknown> }) =>
    field && isErrorField(field) ? (
        <div className={styles.fieldError}>{field.error}</div>
    ) : null;
